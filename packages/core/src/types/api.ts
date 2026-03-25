export type ApiResponse<T> = {
  data: T
  meta?: {
    message?: string
    total?: number
    page?: number
    pageSize?: number
  }
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}