"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateQuestion, deleteQuestion } from "@/app/actions";

export default function QuestionItem({
  id,
  date,
  slot,
  content,
}: {
  id: string;
  date: string;
  slot: number;
  content: string;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [editContent, setEditContent] = useState(content);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setMode("view");
    setPassword("");
    setError(null);
    setEditContent(content);
  }

  function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateQuestion(id, date, slot, editContent, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      reset();
    });
  }

  function handleDelete(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await deleteQuestion(id, date, slot, password);
      if ("error" in result) {
        setError(result.error);
      }
    });
  }

  if (mode === "edit") {
    return (
      <li className="border rounded-lg p-3">
        <form onSubmit={handleUpdate} className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border rounded p-2"
            rows={2}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 4자리"
            className="w-full border rounded p-2"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 text-white rounded py-1"
            >
              저장
            </button>
            <button type="button" onClick={reset} className="flex-1 border rounded py-1">
              취소
            </button>
          </div>
        </form>
      </li>
    );
  }

  if (mode === "delete") {
    return (
      <li className="border rounded-lg p-3">
        <p className="mb-2 whitespace-pre-wrap">{content}</p>
        <form onSubmit={handleDelete} className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 4자리"
            className="w-full border rounded p-2"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-red-600 text-white rounded py-1"
            >
              삭제 확인
            </button>
            <button type="button" onClick={reset} className="flex-1 border rounded py-1">
              취소
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border rounded-lg p-3">
      <p className="mb-2 whitespace-pre-wrap">{content}</p>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setMode("edit")} className="text-blue-600 underline">
          수정
        </button>
        <button onClick={() => setMode("delete")} className="text-red-600 underline">
          삭제
        </button>
      </div>
    </li>
  );
}
