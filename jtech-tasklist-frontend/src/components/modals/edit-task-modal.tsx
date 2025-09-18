"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"

interface EditTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onUpdateTask: (taskId: number, updates: { title?: string; description?: string }) => Promise<void>
}

export function EditTaskModal({ open, onOpenChange, task, onUpdateTask }: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!task) return

    if (!title.trim()) {
      setError("Task title is required")
      return
    }

    if (title.trim().length > 140) {
      setError("Task title must be 140 characters or less")
      return
    }

    if (description.length > 500) {
      setError("Task description must be 500 characters or less")
      return
    }

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (trimmedTitle === task.title && trimmedDescription === (task.description || "")) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onUpdateTask(task.id, {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setError("")
        if (task) {
          setTitle(task.title)
          setDescription(task.description || "")
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Task Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value)
                  setError("")
                }}
                disabled={isSubmitting}
                maxLength={140}
                autoFocus
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{error && <span className="text-destructive">{error}</span>}</span>
                <span>{title.length}/140</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                disabled={isSubmitting}
                maxLength={500}
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/500</div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
