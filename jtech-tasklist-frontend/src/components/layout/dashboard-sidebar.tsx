"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, List, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TodoList } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DashboardSidebarProps {
  lists: TodoList[]
  activeListId: number | null
  onSelectList: (listId: number) => void
  onCreateList: () => void
  onEditList: (list: TodoList) => void
  onDeleteList: (list: TodoList) => void
  isOpen?: boolean
  onClose?: () => void
  taskCounts?: Record<number, number>
}

export function DashboardSidebar({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onEditList,
  onDeleteList,
  isOpen = true,
  onClose,
  taskCounts = {},
}: DashboardSidebarProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out md:relative md:top-0 md:h-full md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <Button onClick={onCreateList} className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 p-2">
              {lists.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No lists yet</p>
                  <p className="text-xs">Create your first list to get started</p>
                </div>
              ) : (
                lists.map((list) => (
                  <div
                    key={list.id}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      activeListId === list.id && "bg-accent text-accent-foreground",
                    )}
                    onClick={() => onSelectList(list.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <List className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{list.name}</span>
                      {taskCounts[list.id] !== undefined && taskCounts[list.id] > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {taskCounts[list.id]}
                        </Badge>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditList(list)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteList(list)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  )
}
