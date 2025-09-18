import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { TodoList, Task, User } from "@/lib/types"
import { apiClient } from "@/lib/api"

interface TodoState {
  user: User | null
  lists: TodoList[]
  tasks: Record<number, Task[]> // listId -> tasks
  activeListId: number | null
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setActiveList: (listId: number | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  loadLists: () => Promise<void>
  createList: (name: string) => Promise<TodoList>
  updateList: (listId: number, name: string) => Promise<TodoList>
  deleteList: (listId: number, force?: boolean) => Promise<void>

  loadTasks: (listId: number) => Promise<void>
  createTask: (listId: number, title: string, description?: string) => Promise<Task>
  updateTask: (taskId: number, updates: { title?: string; description?: string; done?: boolean }) => Promise<Task>
  deleteTask: (taskId: number) => Promise<void>

  getTaskCount: (listId: number) => number
  getActiveList: () => TodoList | null
  getActiveTasks: () => Task[]
  getPendingTasks: () => Task[]
  getCompletedTasks: () => Task[]

  reset: () => void
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      user: null,
      lists: [],
      tasks: {},
      activeListId: null,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
          lists: user ? state.lists : [],
          tasks: user ? state.tasks : {},
          activeListId: user ? state.activeListId : null,
        })),

      setActiveList: (listId) =>
        set((state) => ({
          ...state,
          activeListId: listId,
        })),

      setLoading: (loading) =>
        set((state) => ({
          ...state,
          isLoading: loading,
        })),

      setError: (error) =>
        set((state) => ({
          ...state,
          error,
        })),

      loadLists: async () => {
        const { user, setLoading, setError } = get()
        if (!user) return

        setLoading(true)
        setError(null)

        try {
          const userLists = await apiClient.getLists(user.id)

          set((state) => ({
            ...state,
            lists: userLists,
            activeListId:
              userLists.length > 0 && !state.activeListId
                ? userLists[0].id
                : state.activeListId && userLists.some((list) => list.id === state.activeListId)
                  ? state.activeListId
                  : userLists.length > 0
                    ? userLists[0].id
                    : null,
          }))

          await Promise.all(userLists.map((list) => get().loadTasks(list.id)))
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to load lists"
          setError(message)
          throw error
        } finally {
          setLoading(false)
        }
      },

      createList: async (name) => {
        const { user, setError } = get()
        if (!user) throw new Error("User not authenticated")

        setError(null)

        try {
          const newList = await apiClient.createList(user.id, name)

          set((state) => ({
            ...state,
            lists: [...state.lists, newList],
            tasks: { ...state.tasks, [newList.id]: [] },
            activeListId: newList.id,
          }))

          return newList
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create list"
          setError(message)
          throw error
        }
      },

      updateList: async (listId, name) => {
        const { setError } = get()
        setError(null)

        try {
          const updatedList = await apiClient.updateList(listId, name)

          set((state) => ({
            ...state,
            lists: state.lists.map((list) => (list.id === listId ? updatedList : list)),
          }))

          return updatedList
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to update list"
          setError(message)
          throw error
        }
      },

      deleteList: async (listId, force = false) => {
        const { setError } = get()
        setError(null)

        try {
          await apiClient.deleteList(listId, force)

          set((state) => {
            const newLists = state.lists.filter((list: TodoList) => list.id !== listId)
            const newTasks = { ...state.tasks }
            delete newTasks[listId]

            return {
              ...state,
              lists: newLists,
              tasks: newTasks,
              activeListId:
                state.activeListId === listId ? (newLists.length > 0 ? newLists[0].id : null) : state.activeListId,
            }
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to delete list"
          setError(message)
          throw error
        }
      },

      loadTasks: async (listId) => {
        try {
          const listTasks = await apiClient.getTasks(listId)

          set((state) => ({
            ...state,
            tasks: { ...state.tasks, [listId]: listTasks },
          }))
        } catch (error) {
          console.error(`Failed to load tasks for list ${listId}:`, error)
          set((state) => ({
            ...state,
            tasks: { ...state.tasks, [listId]: [] },
          }))
        }
      },

      createTask: async (listId, title, description) => {
        const { setError } = get()
        setError(null)

        try {
          const newTask = await apiClient.createTask(listId, title, description)

          set((state) => ({
            ...state,
            tasks: {
              ...state.tasks,
              [listId]: [...(state.tasks[listId] || []), newTask],
            },
          }))

          return newTask
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create task"
          setError(message)
          throw error
        }
      },

      updateTask: async (taskId, updates) => {
        const { setError, tasks } = get()
        setError(null)

        let listId: number | null = null
        let taskIndex = -1

        for (const [lid, taskList] of Object.entries(tasks)) {
          const index = taskList.findIndex((task) => task.id === taskId)
          if (index !== -1) {
            listId = Number.parseInt(lid)
            taskIndex = index
            break
          }
        }

        if (listId === null || taskIndex === -1) {
          throw new Error("Task not found")
        }

        const originalTask = tasks[listId][taskIndex]
        const optimisticTask = { ...originalTask, ...updates }

        set((state) => ({
          ...state,
          tasks: {
            ...state.tasks,
            [listId!]: state.tasks[listId!].map((task, index) => (index === taskIndex ? optimisticTask : task)),
          },
        }))

        try {
          const updatedTask = await apiClient.updateTask(taskId, updates)

          set((state) => ({
            ...state,
            tasks: {
              ...state.tasks,
              [listId!]: state.tasks[listId!].map((task, index) => (index === taskIndex ? updatedTask : task)),
            },
          }))

          return updatedTask
        } catch (error) {
          set((state) => ({
            ...state,
            tasks: {
              ...state.tasks,
              [listId!]: state.tasks[listId!].map((task, index) => (index === taskIndex ? originalTask : task)),
            },
          }))

          const message = error instanceof Error ? error.message : "Failed to update task"
          setError(message)
          throw error
        }
      },

      deleteTask: async (taskId) => {
        const { setError, tasks } = get()
        setError(null)

        let listId: number | null = null
        let taskIndex = -1

        for (const [lid, taskList] of Object.entries(tasks)) {
          const index = taskList.findIndex((task) => task.id === taskId)
          if (index !== -1) {
            listId = Number.parseInt(lid)
            taskIndex = index
            break
          }
        }

        if (listId === null || taskIndex === -1) {
          throw new Error("Task not found")
        }

        const originalTask = tasks[listId][taskIndex]
        set((state) => ({
          ...state,
          tasks: {
            ...state.tasks,
            [listId!]: state.tasks[listId!].filter((_, index) => index !== taskIndex),
          },
        }))

        try {
          await apiClient.deleteTask(taskId)
        } catch (error) {
          set((state) => ({
            ...state,
            tasks: {
              ...state.tasks,
              [listId!]: [
                ...state.tasks[listId!].slice(0, taskIndex),
                originalTask,
                ...state.tasks[listId!].slice(taskIndex),
              ],
            },
          }))

          const message = error instanceof Error ? error.message : "Failed to delete task"
          setError(message)
          throw error
        }
      },

      getTaskCount: (listId) => {
        const { tasks } = get()
        return tasks[listId]?.length || 0
      },

      getActiveList: () => {
        const { lists, activeListId } = get()
        return lists.find((list) => list.id === activeListId) || null
      },

      getActiveTasks: () => {
        const { tasks, activeListId } = get()
        return activeListId ? tasks[activeListId] || [] : []
      },

      getPendingTasks: () => {
        return get()
          .getActiveTasks()
          .filter((task) => !task.done)
      },

      getCompletedTasks: () => {
        return get()
          .getActiveTasks()
          .filter((task) => task.done)
      },

      reset: () =>
        set(() => ({
          user: null,
          lists: [],
          tasks: {},
          activeListId: null,
          isLoading: false,
          error: null,
        })),
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        lists: state.lists,
        tasks: state.tasks,
        activeListId: state.activeListId,
      }),
    },
  ),
)
