"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: number, done: boolean) => Promise<void>
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => Promise<void>
}

export function TaskItem({ task, onToggleComplete, onEditTask, onDeleteTask }: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsToggling(true)
    try {
      await onToggleComplete(task.id, !task.done)
    } catch (error) {
      console.error("Failed to toggle task:", error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDeleteTask(task.id)
    } catch (error) {
      console.error("Failed to delete task:", error)
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  return (
    <div
      className={cn(
        "group p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors",
        task.done && "opacity-75",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.done}
          onCheckedChange={handleToggleComplete}
          disabled={isToggling || isDeleting}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "font-medium text-sm leading-relaxed break-words",
                  task.done && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h4>

              {task.description && (
                <p
                  className={cn(
                    "text-sm text-muted-foreground mt-1 leading-relaxed break-words",
                    task.done && "line-through",
                  )}
                >
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.dueDate)}
                  </Badge>
                )}

                <span className="text-xs text-muted-foreground">Created {formatDate(task.createdAt)}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditTask(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
