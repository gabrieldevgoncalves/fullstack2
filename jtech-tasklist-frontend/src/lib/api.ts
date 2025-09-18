import { type AuthResponse, type LoginRequest, type User, type TodoList, type Task, ApiError } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      document.cookie = `auth_token=${token}; path=/; max-age=${24 * 60 * 60}; samesite=strict`
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new ApiError({
          message: errorData || `HTTP error! status: ${response.status}`,
          status: response.status,
        })
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }

      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: "Network error occurred",
        status: 0,
      })
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me")
  }

  async getLists(userId: number): Promise<TodoList[]> {
    return this.request<TodoList[]>(`/lists?userId=${userId}`)
  }

  async createList(userId: number, name: string): Promise<TodoList> {
    return this.request<TodoList>(`/lists?userId=${userId}&name=${encodeURIComponent(name)}`, {
      method: "POST",
    })
  }

  async updateList(listId: number, name: string): Promise<TodoList> {
    return this.request<TodoList>(`/lists/${listId}?name=${encodeURIComponent(name)}`, {
      method: "PUT",
    })
  }

  async deleteList(listId: number, force = false): Promise<void> {
    return this.request<void>(`/lists/${listId}?force=${force}`, {
      method: "DELETE",
    })
  }

  async getTasks(listId: number): Promise<Task[]> {
    return this.request<Task[]>(`/lists/${listId}/tasks`)
  }

  async createTask(listId: number, title: string, description?: string): Promise<Task> {
    const params = new URLSearchParams({
      listId: listId.toString(),
      title,
    })
    if (description) {
      params.append("description", description)
    }

    return this.request<Task>(`/tasks?${params.toString()}`, {
      method: "POST",
    })
  }

  async updateTask(taskId: number, updates: { title?: string; description?: string; done?: boolean }): Promise<Task> {
    const params = new URLSearchParams()
    if (updates.title !== undefined) params.append("title", updates.title)
    if (updates.description !== undefined) params.append("description", updates.description)
    if (updates.done !== undefined) params.append("done", updates.done.toString())

    return this.request<Task>(`/tasks/${taskId}?${params.toString()}`, {
      method: "PUT",
    })
  }

  async deleteTask(taskId: number): Promise<void> {
    return this.request<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
