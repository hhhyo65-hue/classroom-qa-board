import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export default async function HomePage() {
  const today = todayString();

  const { data, error } = await supabaseServer
    .from("questions")
    .select("session_date")
    .order("session_date", { ascending: false })
    .limit(5000);

  const dates = error
    ? []
    : Array.from(new Set((data ?? []).map((row) => row.session_date as string)));

  return (
    <main className="mx-auto max-w-md w-full p-6 flex-1">
      <h1 className="text-2xl font-bold mb-6">수업 질문 게시판</h1>

      <Link
        href={`/${today}`}
        className="block rounded-lg bg-blue-600 text-white text-center py-3 mb-8 font-medium"
      >
        오늘({today})로 이동
      </Link>

      <h2 className="text-lg font-semibold mb-2">지난 날짜</h2>
      {dates.length === 0 ? (
        <p className="text-gray-500">아직 등록된 질문이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {dates.map((date) => (
            <li key={date}>
              <Link href={`/${date}`} className="text-blue-600 underline">
                {date}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
