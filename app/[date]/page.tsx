import Link from "next/link";
import { notFound } from "next/navigation";
import { DATE_RE, SLOTS } from "@/lib/types";

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md w-full p-6 flex-1">
      <Link href="/" className="text-sm text-blue-600 underline">
        ← 홈으로
      </Link>
      <h1 className="text-2xl font-bold my-4">{date} 발표 게시판</h1>
      <div className="grid grid-cols-2 gap-3">
        {SLOTS.map((slot) => (
          <Link
            key={slot}
            href={`/${date}/${slot}`}
            className="rounded-lg border border-gray-300 py-6 text-center font-medium hover:bg-gray-50"
          >
            발표{slot}
          </Link>
        ))}
      </div>
    </main>
  );
}
