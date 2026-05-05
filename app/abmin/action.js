"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFeedback() {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFeedback(id) {
  await prisma.feedback.delete({ where: { id } });
  revalidatePath("/admin");
}
