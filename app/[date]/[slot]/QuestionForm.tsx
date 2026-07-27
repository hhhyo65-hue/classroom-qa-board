"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createQuestion } from "@/app/actions";

export default function QuestionForm({
  date,
  slot,
}: {
  date: string;
  slot: number;
}) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createQuestion(date, slot, authorName, content, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setAuthorName("");
      setContent("");
      setPassword("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border rounded-lg p-4">
      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="이름 또는 학번 (다른 학생에게는 안 보여요)"
        className="w-full border rounded p-2"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="질문을 입력하세요 (다른 학생에게는 익명으로 보여요)"
        className="w-full border rounded p-2"
        rows={3}
        required
      />
      <input
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호 4자리 (수정/삭제용)"
        className="w-full border rounded p-2"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white rounded py-2 font-medium disabled:opacity-50"
      >
        {isPending ? "등록 중..." : "질문 등록"}
      </button>
    </form>
  );
}
