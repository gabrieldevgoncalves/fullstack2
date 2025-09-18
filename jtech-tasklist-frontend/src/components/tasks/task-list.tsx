"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { TaskItem } from "./task-item"
import { Plus, CheckSquare } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  listName: string
  onAddTask: () => void
  onToggleComplete: (taskId: number, done: boolean) => Promise<void>
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => Promise<void>
}

export function TaskList({ tasks, listName, onAddTask, onToggleComplete, onEditTask, onDeleteTask }: TaskListProps) {
  const completedTasks = tasks.filter((task) => task.done)
  const pendingTasks = tasks.filter((task) => !task.done)

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="No tasks yet"
        description={`Add your first task to "${listName}" to get started.`}
        action={{
          label: "Add Task",
          onClick: onAddTask,
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{listName}</h2>
          <p className="text-muted-foreground">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4" />
            <span>Completed ({completedTasks.length})</span>
          </div>
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
