"use client"

import type React from "react"

import { useState } from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import type { TodoList } from "@/lib/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  lists: TodoList[]
  activeListId: number | null
  onSelectList: (listId: number) => void
  onCreateList: () => void
  onEditList: (list: TodoList) => void
  onDeleteList: (list: TodoList) => void
  taskCounts?: Record<number, number>
}

export function DashboardLayout({
  children,
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onEditList,
  onDeleteList,
  taskCounts,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex h-[calc(100vh-3.5rem)]">
        <DashboardSidebar
          lists={lists}
          activeListId={activeListId}
          onSelectList={onSelectList}
          onCreateList={onCreateList}
          onEditList={onEditList}
          onDeleteList={onDeleteList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          taskCounts={taskCounts}
        />

        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
