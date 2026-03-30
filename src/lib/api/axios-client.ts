import axios from "axios"

export const httpAxiosClient = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10000,
})

httpAxiosClient.interceptors.request.use((config) => {
  config.headers.Accept = "application/json"

  // Keep this default for JSON payload requests.
  if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json"
  }

  return config
})

httpAxiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const fallbackMessage = "Something went wrong while calling the API."

    const errorMessageByStatus: Record<number, string> = {
      400: "Bad request.",
      401: "Unauthorized request.",
      403: "Forbidden request.",
      404: "Resource not found.",
      429: "Too many requests. Please retry shortly.",
      500: "Server error.",
      503: "Service unavailable.",
    }

    const message = (status && errorMessageByStatus[status]) || fallbackMessage

    return Promise.reject(new Error(message))
  }
)
