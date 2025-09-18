"use client";

import React from "react";
import { AuthGuard } from "@/hooks/use-auth";
import { useTodo } from "@/hooks/use-todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Edit3, Trash2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}

function DashboardInner() {
  const {
    hydrated,
    lists,
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
  } = useTodo();

  const [newList, setNewList] = React.useState<string>("");
  const [newTask, setNewTask] = React.useState<string>("");

  if (!hydrated) {
    return (
      <main className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Listas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newList.trim();
              if (!name) return;
              const res = createList(name);
              if (!res.ok) {
                alert(res.error);
                return;
              }
              setNewList("");
            }}
          >
            <Input
              placeholder="Nova lista…"
              value={newList}
              onChange={(e) => setNewList(e.target.value)}
            />
            <Button type="submit" title="Criar lista">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {lists.map((l) => {
              const isActive = currentList?.id === l.id;
              return (
                <div
                  key={l.id}
                  className={`flex items-center justify-between rounded border p-2 ${
                    isActive ? "bg-muted" : ""
                  }`}
                >
                  <button
                    className="text-left flex-1"
                    onClick={() => selectList(l.id)}
                    title="Selecionar lista"
                  >
                    {l.name}
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Renomear"
                      onClick={() => {
                        const novo = prompt("Novo nome da lista:", l.name) ?? "";
                        if (!novo.trim()) return;
                        const res = renameList(l.id, novo.trim());
                        if (!res.ok) alert(res.error);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Excluir"
                      onClick={() => {
                        const confirmar = confirm(
                          "Excluir esta lista? As tarefas desta lista também serão removidas."
                        );
                        if (!confirmar) return;
                        const res = deleteList(l.id, { force: true });
                        if (!res.ok) alert(res.error);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {lists.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma lista ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{currentList?.name ?? "Selecione uma lista"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!currentList) {
                alert("Selecione uma lista primeiro.");
                return;
              }
              const t = newTask.trim();
              if (!t) return;
              const res = addTask(t);
              if (!res.ok) {
                alert(res.error);
              } else {
                setNewTask("");
              }
            }}
          >
            <Input
              placeholder="Nova tarefa…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button type="submit" title="Adicionar tarefa">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <ul className="space-y-2">
            {tasksByCurrentList.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between border rounded p-2 gap-3"
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} />
                  <span className={t.done ? "line-through text-muted-foreground" : ""}>
                    {t.title}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const novo = prompt("Editar título:", t.title) ?? "";
                      if (!novo.trim()) return;
                      const res = editTask(t.id, novo.trim());
                      if (!res.ok) alert(res.error);
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="destructive" onClick={() => removeTask(t.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </li>
            ))}
            {currentList && tasksByCurrentList.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa nesta lista. Adicione a primeira acima.
              </p>
            )}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
