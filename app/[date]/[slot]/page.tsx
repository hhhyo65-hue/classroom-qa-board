import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { DATE_RE, isValidSlot } from "@/lib/types";
import QuestionForm from "./QuestionForm";
import QuestionItem from "./QuestionItem";

export default async function SlotPage({
  params,
}: {
  params: Promise<{ date: string; slot: string }>;
}) {
  const { date, slot: slotParam } = await params;
  const slot = Number(slotParam);

  if (!DATE_RE.test(date) || !isValidSlot(slot)) {
    notFound();
  }

  const { data, error } = await supabaseServer
    .from("questions")
    .select("id, content, created_at")
    .eq("session_date", date)
    .eq("slot_number", slot)
    .order("created_at", { ascending: true });

  const questions = error ? [] : data ?? [];

  return (
    <main className="mx-auto max-w-md w-full p-6 flex-1">
      <Link href={`/${date}`} className="text-sm text-blue-600 underline">
        ← {date}로
      </Link>
      <h1 className="text-2xl font-bold my-4">
        {date} 발표{slot} 질문
      </h1>

      <QuestionForm date={date} slot={slot} />

      <ul className="mt-6 space-y-3">
        {questions.length === 0 && (
          <li className="text-gray-500">아직 질문이 없습니다.</li>
        )}
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            id={q.id}
            date={date}
            slot={slot}
            content={q.content}
          />
        ))}
      </ul>
    </main>
  );
}
