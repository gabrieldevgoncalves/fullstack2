export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface TodoList {
  id: number
  name: string
  userId: number
  createdAt: string
}

export interface Task {
  id: number
  title: string
  description?: string
  done: boolean
  dueDate?: string
  listId: number
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export class ApiError extends Error {
  public status: number

  constructor({ message, status }: { message: string; status: number }) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
