import {
  Activity,
  Badge,
  Bird,
  Bike,
  BriefcaseBusiness,
  Bug,
  Building2,
  Car,
  Cat,
  Crown,
  Dog,
  Flower2,
  Footprints,
  Gauge,
  Gem,
  Home as HomeIcon,
  Images,
  Leaf,
  Mountain,
  Radio,
  Rocket,
  ScanSearch,
  Shield,
  Shirt,
  Shuffle,
  Sun,
  TreePine,
  Utensils,
  Users,
  Watch,
  Waves,
  Fish,
  type LucideIcon,
} from "lucide-react";

import { DuelArena } from "@/components/duel-arena";
import { UploadForm } from "@/components/upload-form";
import { getDashboard, getDuel } from "@/lib/data";

const iconMap = {
  Activity,
  Badge,
  Bird,
  Bike,
  BriefcaseBusiness,
  Bug,
  Building2,
  Car,
  Cat,
  Dog,
  Flower2,
  Footprints,
  Fish,
  Gauge,
  Gem,
  Home: HomeIcon,
  Images,
  Leaf,
  Mountain,
  Rocket,
  ScanSearch,
  Shirt,
  Shuffle,
  Sun,
  TreePine,
  Utensils,
  Watch,
  Waves,
};

export default async function Home() {
  const dashboard = await getDashboard();
  const initialDuel = await getDuel({
    category: dashboard.categories[0]?.slug,
    orientation: "PORTRAIT",
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#071018] text-white">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(251,191,36,0.20),transparent_30%)]" />
      <div className="relative">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/50">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black leading-5">Duelo</p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                ranking por voto
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 text-sm font-bold text-slate-300 md:flex">
            <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#ranking">
              Ranking
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#upload">
              Enviar
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#admin">
              Admin
            </a>
          </nav>
        </header>

        <DuelArena
          initialDuel={initialDuel}
          categories={dashboard.categories}
        />

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <Stat icon={Radio} label="Duelos ativos" value={dashboard.stats.activeDuels} />
          <Stat icon={Activity} label="Votos registrados" value={dashboard.stats.votes} />
          <Stat icon={Images} label="Imagens" value={dashboard.stats.images} />
          <Stat icon={Users} label="Usuarios" value={dashboard.stats.users} />
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                categorias
              </p>
              <h2 className="text-3xl font-black">Arenas prontas</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {dashboard.categories.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap] ?? Gauge;
              return (
                <article
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-4 backdrop-blur"
                  key={category.id}
                >
                  <Icon className="mb-4 h-7 w-7 text-amber-300" />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                    {category.groupName}
                  </p>
                  <h3 className="mt-1 text-lg font-black">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {category.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="ranking"
          className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <Crown className="h-7 w-7 text-amber-300" />
            <h2 className="text-3xl font-black">Top imagens</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dashboard.topImages.slice(0, 8).map((image, index) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-lg border border-white/10 bg-white text-slate-950 shadow-xl"
              >
                <div className="relative aspect-[4/5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-sm font-black text-white">
                    #{index + 1}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                    {image.categoryName}
                  </p>
                  <h3 className="mt-1 text-lg font-black">{image.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-600">
                    Elo {Math.round(image.rating)} - {image.wins} vitorias
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="upload"
          className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
              comunidade
            </p>
            <h2 className="text-3xl font-black">Envie uma imagem para entrar na fila.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              O MVP aceita URL de imagem e deixa o item pendente para moderacao.
              Com storage configurado, este fluxo vira upload direto com cortes
              automaticos por orientacao.
            </p>
          </div>
          <UploadForm categories={dashboard.categories} />
        </section>

        <section
          id="admin"
          className="mx-auto w-full max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-lg border border-white/10 bg-slate-950 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-black">Painel administrativo</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <AdminItem label="Online agora" value={dashboard.stats.activeDuels * 2} />
              <AdminItem label="Duelos em execucao" value={dashboard.stats.activeDuels} />
              <AdminItem label="Pendencias de moderacao" value="0 demo" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white p-4 text-slate-950 shadow-xl">
      <Icon className="mb-3 h-6 w-6 text-cyan-700" />
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm font-bold text-slate-600">{label}</p>
    </div>
  );
}

function AdminItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-white/5 p-4">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
