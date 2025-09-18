// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { TodoProvider } from "@/hooks/use-todo"

export const metadata: Metadata = {
  title: "TodoApp",
  description: "Multi-user TODO with mock auth",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <TodoProvider>
            {children}
          </TodoProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
