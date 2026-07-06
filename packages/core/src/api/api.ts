import axios from 'axios'

let API_URL = ''
let AUTH_TOKEN: string | null = null

export function configureApi(apiUrl: string) {
  API_URL = apiUrl
}

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token
}

const api = axios.create({
  timeout: 10000,
})

api.interceptors.request.use(config => {
  config.baseURL = API_URL
  if (AUTH_TOKEN) {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

export async function get<T>(url: string, params?: unknown): Promise<T> {
  const res = await api.get<T>(url, { params })
  return res.data
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.post<T>(url, data)
  return res.data
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const res = await api.patch<T>(url, data)
  return res.data
}

export async function del<T>(url: string, params?: unknown): Promise<T> {
  const res = await api.delete<T>(url, { params })
  return res.data
}
