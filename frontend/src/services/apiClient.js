import axios from 'axios'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000/api'

const baseURL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
const token = (import.meta.env.VITE_API_TOKEN || '').trim()

/**
 * Single Axios instance for the whole application. Components never build
 * URLs: they call the functions in the service modules.
 */
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
})

if (token) {
  apiClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Token ${token}`
    return config
  })
}

export default apiClient
