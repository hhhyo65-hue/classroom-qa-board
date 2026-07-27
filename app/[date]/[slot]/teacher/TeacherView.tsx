"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { getTeacherQuestions } from "@/app/actions";

type TeacherQuestion = {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
};

export default function TeacherView({ date, slot }: { date: string; slot: number }) {
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<TeacherQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await getTeacherQuestions(date, slot, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setQuestions(result.questions);
    });
  }

  return (
    <main className="mx-auto max-w-md w-full p-6 flex-1">
      <Link href={`/${date}/${slot}`} className="text-sm text-blue-600 underline">
        ← 학생용 화면으로
      </Link>
      <h1 className="text-2xl font-bold my-4">
        {date} 발표{slot} · 선생님용 보기
      </h1>

      {questions === null ? (
        <form onSubmit={handleSubmit} className="space-y-2 border rounded-lg p-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="선생님 비밀번호"
            className="w-full border rounded p-2"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white rounded py-2 font-medium disabled:opacity-50"
          >
            {isPending ? "확인 중..." : "확인"}
          </button>
        </form>
      ) : (
        <ul className="space-y-3">
          {questions.length === 0 && (
            <li className="text-gray-500">아직 질문이 없습니다.</li>
          )}
          {questions.map((q) => (
            <li key={q.id} className="border rounded-lg p-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {q.author_name ?? "(이름 없음)"}
              </p>
              <p className="whitespace-pre-wrap">{q.content}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
