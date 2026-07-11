"use client";

import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";

import type { CategoryView, Orientation } from "@/lib/demo-data";

type UploadState = "idle" | "sending" | "success" | "error";

export function UploadForm({ categories }: { categories: CategoryView[] }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [orientation, setOrientation] = useState<Orientation>("PORTRAIT");
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl,
          categoryId,
          orientation,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setState("error");
        setMessage(payload.error ?? "Não foi possível enviar a imagem.");
        return;
      }

      setState("success");
      setTitle("");
      setImageUrl("");
      setMessage("Imagem recebida e marcada como pendente de moderação.");
    } catch {
      setState("error");
      setMessage("Falha de conexão ao enviar a imagem.");
    }
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-white/[0.07] p-4 backdrop-blur"
      onSubmit={submit}
    >
      <Upload className="mb-3 h-6 w-6 text-cyan-300" />
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        Título
      </label>
      <input
        className="mb-3 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-300"
        maxLength={80}
        minLength={2}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Título da imagem"
        required
        value={title}
      />
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        URL da imagem
      </label>
      <input
        className="mb-3 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-cyan-300"
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder="https://..."
        required
        type="url"
        value={imageUrl}
      />
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        Categoria
      </label>
      <select
        className="mb-3 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold outline-none focus:border-cyan-300"
        onChange={(event) => setCategoryId(event.target.value)}
        required
        value={categoryId}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.groupName ? `${category.groupName} - ${category.name}` : category.name}
          </option>
        ))}
      </select>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
        Formato
      </label>
      <select
        className="mb-3 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold outline-none focus:border-cyan-300"
        onChange={(event) => setOrientation(event.target.value as Orientation)}
        value={orientation}
      >
        <option value="PORTRAIT">Em pé</option>
        <option value="LANDSCAPE">Deitada</option>
        <option value="SQUARE">1:1</option>
      </select>
      <button
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-wait disabled:opacity-70"
        disabled={state === "sending"}
        type="submit"
      >
        {state === "sending" ? "Enviando..." : "Enviar para moderação"}
      </button>
      {message ? (
        <p
          className={
            state === "success"
              ? "mt-3 flex items-center gap-2 text-sm font-bold text-emerald-200"
              : "mt-3 text-sm font-bold text-amber-200"
          }
          role="status"
        >
          {state === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}
