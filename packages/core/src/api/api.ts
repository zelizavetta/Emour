import axios from 'axios'


let API_URL = ''

export function configureApi(apiUrl: string) {
  API_URL = apiUrl
}

const api = axios.create({
  timeout: 10000
})

api.interceptors.request.use(config => {
  config.baseURL = API_URL
  return config
})


// GET no user authorization
export async function get<T>(url: string, params?: any): Promise<T> {
  const res = await api.get<T>(url, { params, headers: { Authorization: undefined } })
  return res.data
}

// POST no user authorization
export async function post<T>(url: string, data?: any): Promise<T> {
  const res = await api.post<T>(url, data, { headers: { Authorization: undefined } })
  return res.data
}


// PATCH no user authorization
export async function patch<T>(url: string, data?: any): Promise<T> {
  const res = await api.patch<T>(url, data, { headers: { Authorization: undefined } })
  return res.data
}

// DELETE no user authorization
export async function del<T>(url: string, params?: any): Promise<T> {
  const res = await api.delete<T>(url, {
    params,
    headers: { Authorization: undefined },
  })
  return res.data
}