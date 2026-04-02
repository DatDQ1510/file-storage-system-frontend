import axios, { AxiosError, type AxiosRequestConfig } from "axios"
import { toast } from "sonner"

interface IApiErrorPayload {
  message?: string
  error?: string
  details?: string
}

export interface IApiError extends Error {
  statusCode?: number
  payload?: IApiErrorPayload
  originalError: unknown
}

type TApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    skipGlobalErrorHandler?: boolean
  }
}

const API_TIMEOUT = 15000
const ACCESS_TOKEN_KEY = "accessToken"
const FALLBACK_ERROR_MESSAGE = "Something went wrong while calling the API."

const ERROR_MESSAGE_BY_STATUS: Record<number, string> = {
  400: "Bad request.",
  401: "Unauthorized request.",
  403: "Forbidden request.",
  404: "Resource not found.",
  409: "Data conflict. Please refresh and try again.",
  422: "Provided data is invalid.",
  429: "Too many requests. Please retry shortly.",
  500: "Server error.",
  503: "Service unavailable.",
}

const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  return baseUrl ? baseUrl : "/api/v1"
}

const getAccessToken = () => {
  if (typeof window === "undefined") {
    return ""
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? ""
}

const getRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getRequestErrorMessage = (error: AxiosError<IApiErrorPayload>) => {
  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please try again."
  }

  if (!error.response) {
    return "Cannot connect to server. Please check your network."
  }

  const payload = error.response.data
  const payloadMessage =
    payload?.message ?? payload?.error ?? payload?.details ?? ""

  if (payloadMessage) {
    return payloadMessage
  }

  return (
    ERROR_MESSAGE_BY_STATUS[error.response.status] ?? FALLBACK_ERROR_MESSAGE
  )
}

const toApiError = (error: AxiosError<IApiErrorPayload>): IApiError => {
  const apiError = new Error(getRequestErrorMessage(error)) as IApiError
  apiError.name = "ApiError"
  apiError.statusCode = error.response?.status
  apiError.payload = error.response?.data
  apiError.originalError = error

  return apiError
}

const normalizeMethod = (method?: string): TApiMethod => {
  const normalized = method?.toUpperCase()

  switch (normalized) {
    case "POST":
    case "PUT":
    case "PATCH":
    case "DELETE":
      return normalized
    default:
      return "GET"
  }
}

export const httpAxiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

httpAxiosClient.interceptors.request.use((config) => {
  const requestConfig = config
  const token = getAccessToken()

  requestConfig.headers.set("Accept", "application/json")
  requestConfig.headers.set("X-Request-Id", getRequestId())

  if (requestConfig.data && !requestConfig.headers.get("Content-Type")) {
    requestConfig.headers.set("Content-Type", "application/json")
  }

  if (token && !requestConfig.skipAuth) {
    requestConfig.headers.set("Authorization", `Bearer ${token}`)
  }

  return requestConfig
})

httpAxiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IApiErrorPayload>) => {
    const apiError = toApiError(error)
    const config = error.config as AxiosRequestConfig & {
      skipGlobalErrorHandler?: boolean
    }

    if (!config?.skipGlobalErrorHandler) {
      const method = normalizeMethod(config?.method)
      const endpoint = config?.url ?? "Unknown endpoint"
      toast.error(apiError.message, {
        description: `${method} ${endpoint}`,
      })
    }

    return Promise.reject(apiError)
  }
)

export const api = httpAxiosClient
