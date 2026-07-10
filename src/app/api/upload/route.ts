import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createUpload } from "@/lib/data";

const uploadSchema = z.object({
  title: z.string().min(2).max(80),
  imageUrl: z.string().url(),
  categoryId: z.string().min(1),
  orientation: z.enum(["PORTRAIT", "LANDSCAPE", "SQUARE"]),
});

export async function POST(request: Request) {
  const session = await auth();
  const parsed = uploadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Envio invalido" }, { status: 400 });
  }

  try {
    const upload = await createUpload({
      ...parsed.data,
      uploaderId: session?.user?.id,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Configure o PostgreSQL para salvar uploads." },
      { status: 503 },
    );
  }
}
