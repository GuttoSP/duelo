import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createUpload } from "@/lib/data";
import { uploadSchema } from "@/lib/upload-validation";

export async function POST(request: Request) {
  const parsed = uploadSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  try {
    const session = await getOptionalSession();
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

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

async function getOptionalSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
