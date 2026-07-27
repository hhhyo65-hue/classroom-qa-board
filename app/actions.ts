"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabase-server";
import { DATE_RE, isValidSlot } from "@/lib/types";

type ActionResult = { success: true } | { error: string };

export async function createQuestion(
  date: string,
  slot: number,
  content: string,
  password: string
): Promise<ActionResult> {
  if (!DATE_RE.test(date) || !isValidSlot(slot)) {
    return { error: "잘못된 요청입니다." };
  }
  if (!content.trim()) {
    return { error: "질문 내용을 입력해주세요." };
  }
  if (!/^\d{4}$/.test(password)) {
    return { error: "비밀번호는 숫자 4자리로 입력해주세요." };
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabaseServer.from("questions").insert({
    session_date: date,
    slot_number: slot,
    content: content.trim(),
    password_hash,
  });

  if (error) {
    return { error: "질문 저장에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/${date}/${slot}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateQuestion(
  id: string,
  date: string,
  slot: number,
  content: string,
  password: string
): Promise<ActionResult> {
  if (!DATE_RE.test(date) || !isValidSlot(slot)) {
    return { error: "잘못된 요청입니다." };
  }
  if (!content.trim()) {
    return { error: "질문 내용을 입력해주세요." };
  }

  const { data, error: fetchError } = await supabaseServer
    .from("questions")
    .select("password_hash")
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    return { error: "질문을 찾을 수 없습니다." };
  }

  const matches = await bcrypt.compare(password, data.password_hash);
  if (!matches) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const { error } = await supabaseServer
    .from("questions")
    .update({ content: content.trim() })
    .eq("id", id);

  if (error) {
    return { error: "수정에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/${date}/${slot}`);
  return { success: true };
}

export async function deleteQuestion(
  id: string,
  date: string,
  slot: number,
  password: string
): Promise<ActionResult> {
  if (!DATE_RE.test(date) || !isValidSlot(slot)) {
    return { error: "잘못된 요청입니다." };
  }

  const { data, error: fetchError } = await supabaseServer
    .from("questions")
    .select("password_hash")
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    return { error: "질문을 찾을 수 없습니다." };
  }

  const matches = await bcrypt.compare(password, data.password_hash);
  if (!matches) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const { error } = await supabaseServer.from("questions").delete().eq("id", id);

  if (error) {
    return { error: "삭제에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath(`/${date}/${slot}`);
  revalidatePath("/");
  return { success: true };
}
