"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

// ---------- Tipos ----------
export type TaskId = string
export type ListId = string

export type Task = {
  id: TaskId
  title: string
  done: boolean
  createdAt: string
  updatedAt?: string
}

export type List = {
  id: ListId
  name: string
  createdAt: string
  updatedAt?: string
  taskIds: TaskId[]
}

type State = {
  lists: Record<ListId, List>
  tasks: Record<TaskId, Task>
  currentListId?: ListId
}

type CreateResult<T> = { ok: true; data: T } | { ok: false; error: string }
type MutateResult = { ok: true } | { ok: false; error: string }

export type TodoContextType = {
  hydrated: boolean

  lists: List[]
  currentListId?: ListId
  currentList?: List | undefined
  tasksByCurrentList: Task[]

  selectList: (id: ListId) => void
  createList: (name: string) => CreateResult<List>
  renameList: (id: ListId, name: string) => MutateResult
  deleteList: (id: ListId, opts?: { force?: boolean }) => MutateResult

  addTask: (title: string) => CreateResult<Task>
  toggleTask: (taskId: TaskId) => void
  editTask: (taskId: TaskId, newTitle: string) => MutateResult
  removeTask: (taskId: TaskId) => void

  // util
  reset: () => void
}

const STORAGE_KEY = "todo:state@v1"

function nowISO(): string {
  return new Date().toISOString()
}
function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`
}
function normalize(s: string): string {
  return s.normalize("NFC").trim().toLowerCase()
}

const initialState: State = (() => {
  const listId = genId("list")
  const t1 = genId("task")
  const t2 = genId("task")
  const t3 = genId("task")

  const tasks: Record<TaskId, Task> = {
    [t1]: { id: t1, title: "Ler documentação do projeto", done: false, createdAt: nowISO() },
    [t2]: { id: t2, title: "Configurar ambiente", done: true, createdAt: nowISO(), updatedAt: nowISO() },
    [t3]: { id: t3, title: "Criar primeira lista", done: false, createdAt: nowISO() },
  }

  const list: List = {
    id: listId,
    name: "Pessoal",
    createdAt: nowISO(),
    taskIds: [t1, t2, t3],
  }

  return {
    lists: { [listId]: list },
    tasks,
    currentListId: listId,
  }
})()

const TodoContext = createContext<TodoContextType | null>(null)

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<State>(initialState)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as State
        setState(parsed)
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state, hydrated])

  const lists = useMemo(() => Object.values(state.lists), [state.lists])
  const currentList = state.currentListId ? state.lists[state.currentListId] : undefined
  const tasksByCurrentList = useMemo(() => {
    if (!currentList) return []
    return currentList.taskIds
      .map((id) => state.tasks[id])
      .filter(Boolean)
  }, [currentList, state.tasks])

  const selectList = useCallback((id: ListId) => {
    if (!state.lists[id]) return
    setState((s) => ({ ...s, currentListId: id }))
  }, [state.lists])

  const createList = useCallback((name: string): CreateResult<List> => {
    const n = name.trim()
    if (!n) return { ok: false, error: "Nome da lista é obrigatório." }
    const exists = Object.values(state.lists).some((l) => normalize(l.name) === normalize(n))
    if (exists) return { ok: false, error: "Já existe uma lista com esse nome." }

    const id = genId("list")
    const list: List = { id, name: n, createdAt: nowISO(), taskIds: [] }

    setState((s) => ({
      ...s,
      lists: { ...s.lists, [id]: list },
      currentListId: id,
    }))
    return { ok: true, data: list }
  }, [state.lists])

  const renameList = useCallback((id: ListId, name: string): MutateResult => {
    const list = state.lists[id]
    if (!list) return { ok: false, error: "Lista não encontrada." }
    const n = name.trim()
    if (!n) return { ok: false, error: "Nome da lista é obrigatório." }
    const exists = Object.values(state.lists).some(
      (l) => l.id !== id && normalize(l.name) === normalize(n)
    )
    if (exists) return { ok: false, error: "Já existe uma lista com esse nome." }

    setState((s) => ({
      ...s,
      lists: {
        ...s.lists,
        [id]: { ...s.lists[id], name: n, updatedAt: nowISO() },
      },
    }))
    return { ok: true }
  }, [state.lists])

  const deleteList = useCallback((id: ListId, opts?: { force?: boolean }): MutateResult => {
    const list = state.lists[id]
    if (!list) return { ok: false, error: "Lista não encontrada." }
    const hasTasks = list.taskIds.length > 0
    const force = opts?.force === true
    if (hasTasks && !force) {
      return { ok: false, error: "Lista possui tarefas. Use { force: true } para excluir." }
    }

    setState((s) => {
      const newLists = { ...s.lists }
      delete newLists[id]

      const newTasks = { ...s.tasks }
      for (const tid of list.taskIds) {
        delete newTasks[tid]
      }

      const nextListId = s.currentListId === id ? Object.keys(newLists)[0] : s.currentListId
      return {
        lists: newLists,
        tasks: newTasks,
        currentListId: nextListId,
      }
    })
    return { ok: true }
  }, [state.lists, state.tasks, state.currentListId])

  const addTask = useCallback((title: string): CreateResult<Task> => {
    const list = currentList
    if (!list) return { ok: false, error: "Nenhuma lista selecionada." }
    const t = title.trim()
    if (!t) return { ok: false, error: "Título é obrigatório." }

    const dup = list.taskIds
      .map((id) => state.tasks[id])
      .some((task) => normalize(task.title) === normalize(t))
    if (dup) return { ok: false, error: "Já existe uma tarefa com esse título nesta lista." }

    const id = genId("task")
    const task: Task = { id, title: t, done: false, createdAt: nowISO() }

    setState((s) => ({
      ...s,
      tasks: { ...s.tasks, [id]: task },
      lists: {
        ...s.lists,
        [list.id]: { ...s.lists[list.id], taskIds: [...s.lists[list.id].taskIds, id] },
      },
    }))

    return { ok: true, data: task }
  }, [currentList, state.tasks, state.lists])

  const toggleTask = useCallback((taskId: TaskId) => {
    if (!state.tasks[taskId]) return
    setState((s) => ({
      ...s,
      tasks: {
        ...s.tasks,
        [taskId]: {
          ...s.tasks[taskId],
          done: !s.tasks[taskId].done,
          updatedAt: nowISO(),
        },
      },
    }))
  }, [state.tasks])

  const editTask = useCallback((taskId: TaskId, newTitle: string): MutateResult => {
    const list = currentList
    if (!list) return { ok: false, error: "Nenhuma lista selecionada." }
    const task = state.tasks[taskId]
    if (!task) return { ok: false, error: "Tarefa não encontrada." }

    const t = newTitle.trim()
    if (!t) return { ok: false, error: "Título é obrigatório." }
    const dup = list.taskIds
      .filter((id) => id !== taskId)
      .map((id) => state.tasks[id])
      .some((k) => normalize(k.title) === normalize(t))
    if (dup) return { ok: false, error: "Já existe uma tarefa com esse título nesta lista." }

    setState((s) => ({
      ...s,
      tasks: {
        ...s.tasks,
        [taskId]: { ...s.tasks[taskId], title: t, updatedAt: nowISO() },
      },
    }))
    return { ok: true }
  }, [currentList, state.tasks])

  const removeTask = useCallback((taskId: TaskId) => {
    const list = currentList
    if (!list || !state.tasks[taskId]) return
    setState((s) => {
      const newTasks = { ...s.tasks }
      delete newTasks[taskId]
      return {
        ...s,
        tasks: newTasks,
        lists: {
          ...s.lists,
          [list.id]: {
            ...s.lists[list.id],
            taskIds: s.lists[list.id].taskIds.filter((id) => id !== taskId),
          },
        },
      }
    })
  }, [currentList, state.tasks])

  const reset = useCallback(() => {
    setState(initialState)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
    }
  }, [])

  const value: TodoContextType = useMemo(
    () => ({
      hydrated,
      lists,
      currentListId: state.currentListId,
      currentList,
      tasksByCurrentList,
      selectList,
      createList,
      renameList,
      deleteList,
      addTask,
      toggleTask,
      editTask,
      removeTask,
      reset,
    }),
    [
      hydrated,
      lists,
      state.currentListId,
      currentList,
      tasksByCurrentList,
      selectList,
      createList,
      renameList,
      deleteList,
      addTask,
      toggleTask,
      editTask,
      removeTask,
      reset,
    ]
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodo(): TodoContextType {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error("useTodo deve ser usado dentro de <TodoProvider>")
  return ctx
}
