import { notFound } from "next/navigation";
import { DATE_RE, isValidSlot } from "@/lib/types";
import TeacherView from "./TeacherView";

export default async function TeacherPage({
  params,
}: {
  params: Promise<{ date: string; slot: string }>;
}) {
  const { date, slot: slotParam } = await params;
  const slot = Number(slotParam);

  if (!DATE_RE.test(date) || !isValidSlot(slot)) {
    notFound();
  }

  return <TeacherView date={date} slot={slot} />;
}
