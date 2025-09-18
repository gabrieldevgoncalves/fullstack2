"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertTriangle } from "lucide-react"
import type { TodoList } from "@/lib/types"

interface DeleteListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: TodoList | null
  taskCount: number
  onDeleteList: (listId: number, force: boolean) => Promise<void>
}

export function DeleteListModal({ open, onOpenChange, list, taskCount, onDeleteList }: DeleteListModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forceDelete, setForceDelete] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!list) return

    setIsSubmitting(true)
    setError("")

    try {
      await onDeleteList(list.id, forceDelete)
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete list")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setForceDelete(false)
        setError("")
      }
    }
  }

  const hasActiveTasks = taskCount > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete List
          </DialogTitle>
          <DialogDescription>
            {'Are you sure you want to delete "'}
            {list?.name}
            {'"? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasActiveTasks && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This list contains {taskCount} {taskCount === 1 ? "task" : "tasks"}.
                {!forceDelete && " You must check the box below to delete it."}
              </AlertDescription>
            </Alert>
          )}

          {hasActiveTasks && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="force-delete"
                checked={forceDelete}
                onCheckedChange={(checked: boolean) => setForceDelete(checked === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="force-delete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand that all tasks in this list will be permanently deleted
              </Label>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || (hasActiveTasks && !forceDelete)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
