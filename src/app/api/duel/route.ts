import { NextResponse } from "next/server";
import { z } from "zod";

import { getDuel, recordVote } from "@/lib/data";

const voteSchema = z.object({
  winnerId: z.string(),
  loserId: z.string(),
  mode: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const duel = await getDuel({
    category: searchParams.get("category"),
    categories: searchParams.get("categories"),
    mode: searchParams.get("mode"),
    orientation: searchParams.get("orientation"),
    keepId: searchParams.get("keepId"),
    excludeId: searchParams.get("excludeId"),
  });

  return NextResponse.json(duel);
}

export async function POST(request: Request) {
  const parsed = voteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Voto invalido" }, { status: 400 });
  }

  const result = await recordVote(parsed.data);

  return NextResponse.json(result);
}
