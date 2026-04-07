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
const REFRESH_TOKEN_KEY = "refreshToken"
const AUTH_DATA_KEY = "authData"
const ROLE_KEY = "role"
const REFRESH_ENDPOINT = "/auth/refresh"
const FALLBACK_ERROR_MESSAGE = "Something went wrong while calling the API."

let refreshTokenPromise: Promise<string | null> | null = null

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

const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_DATA_KEY)
  localStorage.removeItem(ROLE_KEY)
}

const getStoredAuthData = () => {
  if (typeof window === "undefined") {
    return null
  }

  const rawAuthData = localStorage.getItem(AUTH_DATA_KEY)

  if (!rawAuthData) {
    return null
  }

  try {
    return JSON.parse(rawAuthData) as Record<string, unknown>
  } catch {
    return null
  }
}

const storeRefreshedAuth = (authData: Record<string, unknown>) => {
  if (typeof window === "undefined") {
    return
  }

  const nextAccessToken =
    typeof authData.accessToken === "string" ? authData.accessToken : ""

  if (!nextAccessToken) {
    return
  }

  const currentAuthData = getStoredAuthData()
  const mergedAuthData = {
    ...(currentAuthData ?? {}),
    ...authData,
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken)
  localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(mergedAuthData))

  if (typeof mergedAuthData.role === "string") {
    localStorage.setItem(ROLE_KEY, mergedAuthData.role)
  }
}

const redirectToSignIn = () => {
  if (typeof window === "undefined") {
    return
  }

  if (window.location.pathname !== "/sign-in") {
    window.location.replace("/sign-in")
  }
}

export const httpAxiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

const refreshHttpClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

const requestNewAccessToken = async (): Promise<string | null> => {
  type TRefreshAuthData = Record<string, unknown> & { accessToken?: string }
  type TRefreshResponse = {
    data?: TRefreshAuthData
  }

  const response = await refreshHttpClient.post<TRefreshResponse>(
    REFRESH_ENDPOINT,
    {}
  )

  const refreshedAuthData = (response.data?.data ?? {}) as TRefreshAuthData
  storeRefreshedAuth(refreshedAuthData)

  return typeof refreshedAuthData.accessToken === "string"
    ? refreshedAuthData.accessToken
    : null
}

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
  async (error: AxiosError<IApiErrorPayload>) => {
    const apiError = toApiError(error)
    const config = error.config as AxiosRequestConfig & {
      skipGlobalErrorHandler?: boolean
      skipAuth?: boolean
      _retry?: boolean
    }

    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = config?.url?.includes(REFRESH_ENDPOINT)
    const canRefresh = Boolean(config && !config.skipAuth && !config._retry && !isRefreshRequest)

    if (isUnauthorized && canRefresh) {
      config._retry = true

      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = requestNewAccessToken().finally(() => {
            refreshTokenPromise = null
          })
        }

        const refreshedAccessToken = await refreshTokenPromise

        if (refreshedAccessToken) {
          config.headers = config.headers ?? {}

          if (typeof (config.headers as { set?: unknown }).set === "function") {
            (config.headers as { set: (name: string, value: string) => void }).set(
              "Authorization",
              `Bearer ${refreshedAccessToken}`
            )
          } else {
            (config.headers as Record<string, string>).Authorization = `Bearer ${refreshedAccessToken}`
          }

          return httpAxiosClient(config)
        }
      } catch {
        // Handled below by logout + redirect branch.
      }
    }

    if (isUnauthorized) {
      clearStoredAuth()
      redirectToSignIn()
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
