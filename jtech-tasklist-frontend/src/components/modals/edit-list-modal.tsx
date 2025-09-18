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
import { Loader2 } from "lucide-react"
import type { TodoList } from "@/lib/types"

interface EditListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: TodoList | null
  onUpdateList: (listId: number, name: string) => Promise<void>
}

export function EditListModal({ open, onOpenChange, list, onUpdateList }: EditListModalProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (list) {
      setName(list.name)
    }
  }, [list])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!list) return

    if (!name.trim()) {
      setError("List name is required")
      return
    }

    if (name.trim().length > 50) {
      setError("List name must be 50 characters or less")
      return
    }

    if (name.trim() === list.name) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onUpdateList(list.id, name.trim())
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update list")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setError("")
        if (list) {
          setName(list.name)
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename List</DialogTitle>
            <DialogDescription>Change the name of your todo list.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                placeholder="Enter list name..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                disabled={isSubmitting}
                maxLength={50}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
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
