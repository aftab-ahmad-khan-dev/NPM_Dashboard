import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Boxes,
  Brain,
  Cloud,
  Code2,
  Coffee,
  Database,
  Facebook,
  Github,
  Globe,
  Heart,
  Instagram,
  Layers,
  LineChart,
  Linkedin,
  MapPin,
  Package,
  Rocket,
  Server,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  Wrench,
  Zap,
} from "lucide-react";
import { useMeta } from "../hooks/useMeta";
import { BrandIcon } from "../components/BrandIcon";
import { usePackages } from "../context/PackagesContext";

const PORTFOLIO_URL = "https://aftabahmadkhan.online";
const GITHUB_URL = "https://github.com/aftab-ahmad-khan-dev";
const LINKEDIN_URL = "https://www.linkedin.com/in/aftab-ahmad-khan-193240333";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100051148587185";
const INSTAGRAM_URL = "https://www.instagram.com/aftab_ahmad_dev/";
const NPM_PROFILE_URL = "https://www.npmjs.com/~mr-aftab-ahmad-khan";
const GITHUB_ORG_URL = "https://github.com/NPM-Packages-Modules";

export function About() {
  const { packages } = usePackages();
  const pkgCount = packages.length;

  useMeta({
    title:
      "About Aftab Ahmad Khan — Senior MERN, React Native & Flutter Developer · Open-Source npm Author",
    description:
      pkgCount > 0
        ? `Hi, I’m Aftab Ahmad Khan — a senior full-stack engineer from Multan, Pakistan with 7+ years of experience shipping 75+ projects. I build MERN web platforms, React Native mobile apps, Flutter cross-platform apps, AI-integrated products and ${pkgCount}+ open-source npm packages including monodrift, picsmith, mcp-bootstrap, chainsentry, envrunes, llmtoken and promptver.`
        : "Hi, I’m Aftab Ahmad Khan — a senior full-stack engineer from Multan, Pakistan with 7+ years of experience shipping 75+ projects. I build MERN web platforms, React Native mobile apps, Flutter cross-platform apps, AI-integrated products and open-source npm packages including monodrift, picsmith, mcp-bootstrap, chainsentry, envrunes, llmtoken and promptver.",
    keywords:
      "aftab ahmad khan, mr-aftab-ahmad-khan, MERN stack developer, React Native developer, Flutter developer, dart, senior full stack engineer, npm package author, open source maintainer, aftabahmadkhan.online, npm packages, monodrift, picsmith, mcp-bootstrap, chainsentry, envrunes, llmtoken, promptver, mongoose-advanced-plugin, reconnecting-stream, cost-limiter, fileflux",
    canonical: "https://npm-packages-modules.dev/about",
  });

  return (
    <div className='space-y-10 sm:space-y-14'>
      <PersonalHero npmPackageCount={pkgCount} />
      <TechStack />
      <WhatIBuild npmPackageCount={pkgCount} />
      <AboutPlatform npmPackageCount={pkgCount} />
      <PackageCatalogue npmPackageCount={pkgCount} />
      <Values />
      <Connect />
    </div>
  );
}

/* ---------------- Personal hero (you front & center) ---------------- */
interface TechGroup {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: AccentKey;
  items: Array<{ slug: string; name: string; color?: string; forceWhite?: boolean }>;
}

const TECH_GROUPS: TechGroup[] = [
  {
    title: "Frontend & UI",
    description: "Modern, fast, type-safe interfaces.",
    icon: <Sparkles className='w-3.5 h-3.5' />,
    accent: "violet",
    items: [
      { slug: "react", name: "React", color: "61DAFB" },
      { slug: "nextdotjs", name: "Next.js", forceWhite: true },
      { slug: "typescript", name: "TypeScript", color: "3178C6" },
      { slug: "javascript", name: "JavaScript", color: "F7DF1E" },
      { slug: "tailwindcss", name: "Tailwind CSS", color: "06B6D4" },
      { slug: "vite", name: "Vite", color: "646CFF" },
      { slug: "framer", name: "Framer Motion", color: "0055FF" },
      { slug: "redux", name: "Redux", color: "764ABC" },
    ],
  },
  {
    title: "Backend & Real-time",
    description: "Scalable APIs, sockets and streams.",
    icon: <Server className='w-3.5 h-3.5' />,
    accent: "emerald",
    items: [
      { slug: "nodedotjs", name: "Node.js", color: "5FA04E" },
      { slug: "express", name: "Express", forceWhite: true },
      { slug: "graphql", name: "GraphQL", color: "E10098" },
      { slug: "socketdotio", name: "Socket.io", forceWhite: true },
      { slug: "nestjs", name: "NestJS", color: "E0234E" },
      { slug: "prisma", name: "Prisma", forceWhite: true },
    ],
  },
  {
    title: "Mobile · RN & Flutter",
    description: "Ship native-quality iOS & Android from React Native or Flutter — Expo, Dart tooling and store pipelines.",
    icon: <Smartphone className='w-3.5 h-3.5' />,
    accent: "sky",
    items: [
      { slug: "react", name: "React Native", color: "0FA9E6" },
      { slug: "flutter", name: "Flutter", color: "02569B" },
      { slug: "dart", name: "Dart", color: "0175C2" },
      { slug: "expo", name: "Expo", forceWhite: true },
      { slug: "tauri", name: "Tauri", color: "FFC131" },
      { slug: "electron", name: "Electron", color: "47848F" },
      { slug: "pwa", name: "PWA", color: "5A0FC8" },
      { slug: "ios", name: "iOS", forceWhite: true },
      { slug: "android", name: "Android", color: "3DDC84" },
    ],
  },
  {
    title: "Databases & Cache",
    description: "Relational, document, in-memory.",
    icon: <Database className='w-3.5 h-3.5' />,
    accent: "cyan",
    items: [
      { slug: "mongodb", name: "MongoDB", color: "47A248" },
      { slug: "mongoose", name: "Mongoose", color: "880000" },
      { slug: "postgresql", name: "PostgreSQL", color: "4169E1" },
      { slug: "mysql", name: "MySQL", color: "4479A1" },
      { slug: "redis", name: "Redis", color: "DC382D" },
      { slug: "firebase", name: "Firebase", color: "DD2C00" },
      { slug: "supabase", name: "Supabase", color: "3FCF8E" },
    ],
  },
  {
    title: "E-commerce & Payments",
    description: "Storefronts and checkout flows.",
    icon: <ShoppingBag className='w-3.5 h-3.5' />,
    accent: "amber",
    items: [
      { slug: "shopify", name: "Shopify", color: "5E8E3E" },
      { slug: "stripe", name: "Stripe", color: "635BFF" },
      { slug: "paypal", name: "PayPal", color: "003087" },
      { slug: "woocommerce", name: "WooCommerce", color: "96588A" },
    ],
  },
  {
    title: "Cloud & DevOps",
    description: "Deploy, scale, monitor.",
    icon: <Cloud className='w-3.5 h-3.5' />,
    accent: "indigo",
    items: [
      { slug: "amazonaws", name: "AWS", color: "FF9900" },
      { slug: "googlecloud", name: "Google Cloud", color: "4285F4" },
      { slug: "vercel", name: "Vercel", forceWhite: true },
      { slug: "docker", name: "Docker", color: "2496ED" },
      { slug: "githubactions", name: "GitHub Actions", color: "2088FF" },
      { slug: "nginx", name: "NGINX", color: "009639" },
    ],
  },
  {
    title: "AI & Automation",
    description: "LLM features in production.",
    icon: <Brain className='w-3.5 h-3.5' />,
    accent: "rose",
    items: [
      { slug: "openai", name: "OpenAI", forceWhite: true },
      { slug: "anthropic", name: "Anthropic", forceWhite: true },
      { slug: "langchain", name: "LangChain", forceWhite: true },
      { slug: "huggingface", name: "Hugging Face", color: "FFD21E" },
      { slug: "pinecone", name: "Pinecone", forceWhite: true },
    ],
  },
];

function PersonalHero({ npmPackageCount }: { npmPackageCount: number }) {
  return (
    <section className='relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 animate-fade-up'>
      <div className='absolute inset-0 grid-bg' />
      <div className='absolute -top-32 -right-24 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl' />
      <div className='absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]' />

      <div className='relative grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14'>
        {/* LEFT — name & pitch */}
        <div>
          <div className='inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-400' />
            </span>
            <span className='text-[11px] tracking-wide text-emerald-300 font-medium'>
              Available for new projects
            </span>
          </div>

          <p className='text-xs sm:text-sm text-zinc-500 uppercase tracking-[0.2em] mb-3'>
            About Me
          </p>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]'>
            <span className='bg-gradient-to-br from-zinc-50 via-zinc-200 to-zinc-500 bg-clip-text text-transparent'>
              Hi, I’m{" "}
            </span>
            <span className='bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent'>
              Aftab Ahmad Khan.
            </span>
          </h1>
          <p className='text-base sm:text-lg text-zinc-300 mt-5 max-w-2xl leading-relaxed'>
            <strong className='text-zinc-100'>Senior Full-Stack Engineer</strong>{" "}
            with <strong className='text-zinc-100'>7+ years</strong> and{" "}
            <strong className='text-zinc-100'>75+ shipped projects</strong>. My work is
            organized around three stacks —{" "}
            <span className='text-violet-300'>MERN</span> web platforms,{" "}
            <span className='text-sky-300'>React Native</span> mobile apps, and{" "}
            <span className='text-cyan-300'>Flutter</span> cross-platform apps — plus{" "}
            <span className='text-rose-300'>AI-native</span> features where they belong.
            I also ship{" "}
            {npmPackageCount > 0 ? (
              <>{npmPackageCount}+ </>
            ) : null}
            open-source <span className='text-fuchsia-300'>npm packages</span> used by
            developers worldwide.
          </p>

          {/* Quick context row */}
          <div className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400'>
            <span className='inline-flex items-center gap-1.5'>
              <MapPin className='w-3.5 h-3.5 text-zinc-500' />
              Multan, Pakistan · UTC+5
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Coffee className='w-3.5 h-3.5 text-zinc-500' />
              Evolvo Technologies
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Code2 className='w-3.5 h-3.5 text-zinc-500' />
              Building since 2018
            </span>
          </div>

          {/* CTA */}
          <div className='mt-7 flex flex-wrap gap-3'>
            <a
              href={PORTFOLIO_URL}
              target='_blank'
              rel='noreferrer'
              className='group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white text-sm font-medium shadow-lg shadow-violet-500/25 transition-all'
            >
              Visit my portfolio
              <ArrowUpRight className='w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
            </a>
            <a
              href={GITHUB_URL}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-200 text-sm font-medium transition-all'
            >
              <Github className='w-4 h-4' />
              GitHub
            </a>
            <a
              href={LINKEDIN_URL}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 hover:border-[#0A66C2]/60 bg-zinc-900/50 hover:bg-[#0A66C2]/10 text-zinc-200 text-sm font-medium transition-all'
            >
              <Linkedin className='w-4 h-4 text-[#4DA9FF]' />
              LinkedIn
            </a>
          </div>
        </div>

        {/* RIGHT — stats card */}
        <aside className='relative'>
          <div className='absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-500/40 opacity-40 blur-xl' />
          <div className='relative rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-5 sm:p-6'>
            <div className='flex items-center justify-between mb-5'>
              <div className='text-[10px] uppercase tracking-[0.18em] text-zinc-500'>
                Three-stack snapshot
              </div>
              <div className='inline-flex items-center gap-1.5 text-[10px] text-emerald-300'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse' />
                Live
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:gap-4'>
              <StatTile value='7+' label='Years building' accent='violet' />
              <StatTile value='75+' label='Projects shipped' accent='fuchsia' />
              <StatTile value='50+' label='MERN full-stack apps' accent='emerald' />
              <StatTile value='15+' label='React Native apps' accent='sky' />
              <StatTile value='10+' label='Flutter apps' accent='amber' />
              <StatTile
                value={npmPackageCount > 0 ? String(npmPackageCount) : "—"}
                label='npm packages'
                accent='rose'
              />
            </div>
            <div className='mt-5 pt-5 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-[11px]'>
              <div>
                <div className='text-zinc-500'>Response</div>
                <div className='text-zinc-200 font-medium'>~30 minutes - 1 hour</div>
              </div>
              <div>
                <div className='text-zinc-500'>Engagements</div>
                <div className='text-zinc-200 font-medium'>
                  Fixed · Hourly · Retainer
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ---------------- Tech stack with brand icons ---------------- */

function TechStack() {
  return (
    <section className='animate-fade-up delay-2'>
      <SectionHeader
        icon={<Code2 className='w-3.5 h-3.5' />}
        label='Tech stack'
        title='The toolkit I ship with every day.'
        subtitle='MERN, React Native & Flutter — plus TypeScript, cloud and AI adjacent tooling.'
        accent='cyan'
      />
      <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'>
        {TECH_GROUPS.map((g) => {
          const a = ACCENTS[g.accent];
          return (
            <article
              key={g.title}
              className='rounded-2xl border border-zinc-800/70 bg-zinc-900/40 backdrop-blur-sm p-5 sm:p-6'
            >
              <header className='flex items-start gap-3 mb-4'>
                <span
                  className={`p-1.5 rounded-lg ring-1 ring-inset ${a.ring} ${a.chip}`}
                >
                  {g.icon}
                </span>
                <div>
                  <h3 className='text-sm font-semibold text-zinc-100'>{g.title}</h3>
                  <p className='text-[11px] text-zinc-500 mt-0.5'>{g.description}</p>
                </div>
              </header>
              <ul className='flex flex-wrap gap-1.5'>
                {g.items.map((it) => (
                  <li
                    key={`${g.title}-${it.name}`}
                    className='inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-300'
                  >
                    <BrandIcon
                      slug={it.slug}
                      color={it.color}
                      forceWhite={it.forceWhite}
                      size={14}
                      alt={it.name}
                    />
                    <span>{it.name}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
/* ---------------- What I build ---------------- */

interface BuildItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accent: AccentKey;
  tags: string[];
  count?: string;
}

const BUILDS: BuildItem[] = [
  {
    icon: <Server className='w-5 h-5' />,
    title: "MERN Full-Stack Platforms",
    subtitle: "MongoDB · Express · React · Node.js",
    description:
      "Production SaaS, dashboards, marketplaces and APIs — auth, payments, websockets, queues, observability and AI features wired into the same battle-tested MERN architecture.",
    accent: "emerald",
    tags: ["MongoDB", "Express", "React", "Node.js", "Next.js", "TypeScript"],
    count: "50+ delivered",
  },
  {
    icon: <Smartphone className='w-5 h-5' />,
    title: "React Native Mobile Apps",
    subtitle: "iOS · Android · One codebase",
    description:
      "Native-grade experiences with Expo or bare workflow — push, IAP, secure storage, offline sync, deep links, native modules and disciplined release trains to the stores.",
    accent: "sky",
    tags: ["React Native", "Expo", "TypeScript", "Native Modules"],
    count: "15+ delivered",
  },
  {
    icon: <TabletSmartphone className='w-5 h-5' />,
    title: "Flutter & Dart Apps",
    subtitle: "Material · Cupertino · Skia UI",
    description:
      "Cross-platform mobile (and lean desktop/web targets where it fits) with Flutter’s widget model, isolates for concurrency, platform channels, codegen and performance profiling baked in.",
    accent: "cyan",
    tags: ["Flutter", "Dart", "Bloc / Riverpod", "Platform channels"],
    count: "10+ delivered",
  },
  {
    icon: <Package className='w-5 h-5' />,
    title: "Open-Source npm Packages",
    subtitle: "TypeScript · MIT · Dual ESM+CJS",
    description:
      "Focused libraries for developer tooling, AI infrastructure, security, media pipelines and MongoDB — consumed across MERN, React Native and Flutter workflows.",
    accent: "violet",
    tags: ["TypeScript", "tsup", "vitest", "ESM", "CJS"],
  },
];

function WhatIBuild({ npmPackageCount }: { npmPackageCount: number }) {
  return (
    <section className='animate-fade-up delay-1'>
      <SectionHeader
        icon={<Layers className='w-3.5 h-3.5' />}
        label='What I build'
        title='Three stacks plus open-source npm modules.'
        subtitle='MERN web, React Native mobile and Flutter — each shipped with production rigor, plus libraries published for everyone.'
        accent='violet'
      />
      <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5'>
        {BUILDS.map((b) => {
          const a = ACCENTS[b.accent];
          const countBadge =
            b.title === "Open-Source npm Packages"
              ? npmPackageCount > 0
                ? `${npmPackageCount} published`
                : undefined
              : b.count;
          return (
            <article
              key={b.title}
              className='group relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40 backdrop-blur-sm p-5 sm:p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors'
            >
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${a.bg} blur-3xl opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className='relative'>
                <div className='flex items-start justify-between gap-3 mb-3'>
                  <span
                    className={`p-2.5 rounded-xl ring-1 ring-inset ${a.ring} ${a.chip}`}
                  >
                    {b.icon}
                  </span>
                  {countBadge && (
                    <span className='text-[10px] uppercase tracking-wider text-zinc-500 mt-1'>
                      {countBadge}
                    </span>
                  )}
                </div>
                <h3 className='text-base sm:text-lg font-semibold text-zinc-100'>
                  {b.title}
                </h3>
                <p className='text-[11px] text-zinc-500 mt-0.5'>{b.subtitle}</p>
                <p className='text-xs sm:text-sm text-zinc-400 leading-relaxed mt-3'>
                  {b.description}
                </p>
                <div className='flex flex-wrap gap-1.5 mt-4'>
                  {b.tags.map((t) => (
                    <span
                      key={t}
                      className='text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-800'
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Package catalogue ---------------- */

interface PkgEntry {
  name: string;
  blurb: string;
}
interface Category {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  accent: AccentKey;
  packages: PkgEntry[];
}

const CATEGORIES: Category[] = [
  {
    icon: <Wrench className='w-4 h-4' />,
    title: "Developer experience",
    blurb: "Tools that make TypeScript and monorepo work feel effortless.",
    accent: "violet",
    packages: [
      {
        name: "monodrift",
        blurb:
          "Monorepo drift detector that flags version mismatches and conflicting peer ranges across pnpm, yarn, and npm workspaces.",
      },
      {
        name: "mcp-bootstrap",
        blurb:
          "Interactive scaffolder for Model Context Protocol (MCP) servers with TypeScript templates and transport presets.",
      },
      {
        name: "envrunes",
        blurb:
          "Type-safe environment variable loader with schema validation, defaults, transforms, and zero-runtime overhead.",
      },
    ],
  },
  {
    icon: <Zap className='w-4 h-4' />,
    title: "Performance & infrastructure",
    blurb: "High-throughput building blocks for production Node.js apps.",
    accent: "cyan",
    packages: [
      {
        name: "picsmith",
        blurb:
          "Image optimization pipeline with on-the-fly resizing, AVIF and WebP conversion, smart cropping, and CDN-friendly caching.",
      },
      {
        name: "fileflux",
        blurb:
          "File upload handler with resumable multipart uploads, signed URLs, virus-scanning hooks, and pluggable storage adapters for S3, GCS, and local disk.",
      },
      {
        name: "cost-limiter",
        blurb:
          "Rate & cost limiting middleware: per-user, per-app, per-model budgets, token accounting, hard & soft cutoffs for production API gateways.",
      },
      {
        name: "reconnecting-stream",
        blurb:
          "Resilient SSE and WebSocket client with automatic reconnection, exponential backoff, heartbeat checks, and replay-from-last-event-id support.",
      },
    ],
  },
  {
    icon: <ShieldCheck className='w-4 h-4' />,
    title: "Supply-chain security",
    blurb: "Catch malicious dependencies before they ship.",
    accent: "amber",
    packages: [
      {
        name: "chainsentry",
        blurb:
          "Supply-chain scanner that audits npm dependencies for typosquats, malicious install scripts, license risk, and known CVEs.",
      },
    ],
  },
  {
    icon: <Brain className='w-4 h-4' />,
    title: "AI & LLM tooling",
    blurb: "Glue code for shipping production AI features.",
    accent: "rose",
    packages: [
      {
        name: "llmtoken",
        blurb:
          "Universal LLM stream parser that normalizes SSE chunks from OpenAI, Anthropic, Google, Groq, DeepSeek and Ollama into a single token event API.",
      },
      {
        name: "promptver",
        blurb:
          "AI prompt versioning toolkit with diffing, semantic version tags, evaluation runs, and one-command rollbacks for LLM applications.",
      },
    ],
  },
  {
    icon: <Database className='w-4 h-4' />,
    title: "Backend & data",
    blurb: "Pragmatic helpers for the data layer.",
    accent: "emerald",
    packages: [
      {
        name: "mongoose-advanced-plugin",
        blurb:
          "Mongoose plugin: soft delete, pagination, actor tracking, embedded audit trail (auditLog), optimistic versioning, and history snapshots.",
      },
    ],
  },
];

function PackageCatalogue({ npmPackageCount }: { npmPackageCount: number }) {
  return (
    <section className='animate-fade-up delay-3'>
      <SectionHeader
        icon={<Package className='w-3.5 h-3.5' />}
        label='Open-source catalogue'
        title={
          npmPackageCount > 0
            ? `${npmPackageCount} npm packages, grouped by what they solve.`
            : "npm packages, grouped by what they solve."
        }
        subtitle='Each one is small, single-purpose, MIT licensed, and TypeScript-first.'
        accent='emerald'
      />

      <div className='space-y-5'>
        {CATEGORIES.map((c) => (
          <article
            key={c.title}
            className='rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6'
          >
            <header className='flex items-start gap-3 mb-4'>
              <span
                className={`p-2 rounded-xl ring-1 ring-inset ${ACCENTS[c.accent].ring} ${
                  ACCENTS[c.accent].chip
                }`}
              >
                {c.icon}
              </span>
              <div className='min-w-0'>
                <h3 className='text-base font-semibold text-zinc-100'>{c.title}</h3>
                <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>{c.blurb}</p>
              </div>
            </header>
            <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-3'>
              {c.packages.map((p) => (
                <Link
                  key={p.name}
                  to={`/packages/${encodeURIComponent(p.name)}`}
                  className='group block rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:border-violet-500/40 hover:bg-zinc-900/80 p-4 transition-colors'
                >
                  <div className='flex items-center justify-between mb-1.5'>
                    <h4 className='text-sm font-medium text-zinc-100 truncate'>
                      {p.name}
                    </h4>
                    <ArrowUpRight className='w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-300 transition-colors' />
                  </div>
                  <p className='text-xs text-zinc-400 leading-relaxed line-clamp-3'>
                    {p.blurb}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function StatTile({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: "violet" | "fuchsia" | "emerald" | "amber" | "sky" | "rose";
}) {
  const colors: Record<typeof accent, string> = {
    violet: "text-violet-300",
    fuchsia: "text-fuchsia-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    sky: "text-sky-300",
    rose: "text-rose-300",
  };
  return (
    <div className='rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3'>
      <div
        className={`text-xl sm:text-2xl font-bold leading-none ${colors[accent]}`}
      >
        {value}
      </div>
      <div className='text-[10px] sm:text-[11px] text-zinc-500 mt-1.5 leading-tight'>
        {label}
      </div>
    </div>
  );
}
/* ---------------- About platform ---------------- */

function AboutPlatform({ npmPackageCount }: { npmPackageCount: number }) {
  return (
    <section className='animate-fade-up delay-4'>
      <SectionHeader
        icon={<LineChart className='w-3.5 h-3.5' />}
        label='The platform'
        title='A live dashboard for an entire npm portfolio.'
        subtitle='One page that pulls everything from the public npm registry in real time.'
        accent='cyan'
      />

      <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        <FeatureCard
          icon={<Zap className='w-4 h-4' />}
          title='Real-time data'
          accent='violet'
        >
          Every metric — versions, weekly & monthly downloads, last-publish date,
          unpacked size, dependencies, license, keywords — is fetched live from{" "}
          <code className='text-[11px] bg-zinc-800 px-1 rounded'>
            registry.npmjs.org
          </code>{" "}
          and{" "}
          <code className='text-[11px] bg-zinc-800 px-1 rounded'>api.npmjs.org</code>
          .
        </FeatureCard>
        <FeatureCard
          icon={<Boxes className='w-4 h-4' />}
          title='Unified view'
          accent='cyan'
        >
          {npmPackageCount > 0 ? `${npmPackageCount} packages` : "Packages"}, one searchable,
          sortable grid. Filter by MERN / React Native / Flutter signals, search by text,
          full release history and a one-click copy install command.
        </FeatureCard>
        <FeatureCard
          icon={<Rocket className='w-4 h-4' />}
          title='Zero backend'
          accent='emerald'
        >
          A pure static SPA — no server, no database, no caching layer. Deploy to
          Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host in
          seconds.
        </FeatureCard>
        <FeatureCard
          icon={<ShieldCheck className='w-4 h-4' />}
          title='Privacy-friendly'
          accent='amber'
        >
          No login required. Package metrics load directly from npm&apos;s public APIs in your
          browser. Optional site analytics may record aggregated page views only.
        </FeatureCard>
        <FeatureCard
          icon={<Globe className='w-4 h-4' />}
          title='SEO-ready'
          accent='rose'
        >
          Semantic HTML, structured data (JSON-LD), Open Graph cards, Twitter cards,
          a generated sitemap, and meta tags tuned for every route.
        </FeatureCard>
        <FeatureCard
          icon={<Wrench className='w-4 h-4' />}
          title='Tiny & fast'
          accent='indigo'
        >
          Under 70&nbsp;KB gzipped. Renders instantly. Mobile-first responsive layout
          from a single 360&nbsp;px phone up to ultra-wide displays.
        </FeatureCard>
      </div>
    </section>
  );
}

/* ---------------- Values ---------------- */

function Values() {
  const items = [
    {
      icon: <Heart className='w-4 h-4' />,
      title: "Tiny, focused, composable",
      body: "Every package solves one problem cleanly. No kitchen-sink frameworks, no surprise dependencies. If something doesn’t belong, it ships as a separate module.",
    },
    {
      icon: <ShieldCheck className='w-4 h-4' />,
      title: "Type-safe by default",
      body: "All public APIs ship `.d.ts` declarations generated from real TypeScript source. No `any` smuggled across boundaries.",
    },
    {
      icon: <Rocket className='w-4 h-4' />,
      title: "Modern build outputs",
      body: "Dual ESM + CJS, source maps included, side-effects flagged correctly, tree-shakeable. Works in Node, Bun, Deno, and bundlers.",
    },
    {
      icon: <Sparkles className='w-4 h-4' />,
      title: "Open by default",
      body: "MIT licensed, source on GitHub, issues open, contributions welcome. No telemetry, no premium tier, no lock-in.",
    },
  ];
  return (
    <section className='animate-fade-up delay-5'>
      <SectionHeader
        icon={<Heart className='w-3.5 h-3.5' />}
        label='Philosophy'
        title='What every package — and every project — commits to.'
        subtitle='The non-negotiables shared by everything I ship.'
        accent='rose'
      />
      <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {items.map((it) => (
          <div
            key={it.title}
            className='rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5'
          >
            <div className='flex items-center gap-2 mb-2 text-violet-300'>
              {it.icon}
              <h3 className='text-sm font-semibold text-zinc-100'>{it.title}</h3>
            </div>
            <p className='text-xs sm:text-sm text-zinc-400 leading-relaxed'>
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Connect ---------------- */

const SOCIAL_CARDS = [
  {
    label: "Portfolio",
    handle: "aftabahmadkhan.online",
    href: PORTFOLIO_URL,
    icon: <Globe className='w-4 h-4' />,
    color: "from-violet-500 to-fuchsia-500",
    ring: "hover:border-violet-500/60",
  },
  {
    label: "GitHub",
    handle: "@aftab-ahmad-khan-dev",
    href: GITHUB_URL,
    icon: <Github className='w-4 h-4' />,
    color: "from-zinc-500 to-zinc-700",
    ring: "hover:border-zinc-500/60",
  },
  {
    label: "LinkedIn",
    handle: "aftab-ahmad-khan",
    href: LINKEDIN_URL,
    icon: <Linkedin className='w-4 h-4' />,
    color: "from-[#0A66C2] to-[#4DA9FF]",
    ring: "hover:border-[#0A66C2]/60",
  },
  {
    label: "Instagram",
    handle: "@aftab_ahmad_dev",
    href: INSTAGRAM_URL,
    icon: <Instagram className='w-4 h-4' />,
    color: "from-fuchsia-500 via-rose-500 to-amber-500",
    ring: "hover:border-fuchsia-500/60",
  },
  {
    label: "Facebook",
    handle: "Aftab Ahmad Khan",
    href: FACEBOOK_URL,
    icon: <Facebook className='w-4 h-4' />,
    color: "from-[#1877F2] to-[#4F9CFF]",
    ring: "hover:border-[#1877F2]/60",
  },
  {
    label: "npm publisher",
    handle: "~mr-aftab-ahmad-khan",
    href: NPM_PROFILE_URL,
    icon: <Package className='w-4 h-4' />,
    color: "from-[#CB3837] to-[#FF6E6E]",
    ring: "hover:border-[#CB3837]/60",
  },
  {
    label: "GitHub org",
    handle: "NPM-Packages-Modules",
    href: GITHUB_ORG_URL,
    icon: <Boxes className='w-4 h-4' />,
    color: "from-emerald-500 to-cyan-500",
    ring: "hover:border-emerald-500/60",
  },
];

function Connect() {
  return (
    <section className='animate-fade-up delay-6'>
      <SectionHeader
        icon={<Rocket className='w-3.5 h-3.5' />}
        label='Let’s work together'
        title='Hire me, collaborate, or just say hi.'
        subtitle='Available for MERN, React Native, Flutter & AI-augmented products — fixed, hourly or long-term.'
        accent='violet'
      />
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
        {SOCIAL_CARDS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target='_blank'
            rel='noreferrer'
            className={`group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm p-4 transition-colors ${s.ring}`}
          >
            <span
              className={`relative p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg shadow-black/40`}
            >
              {s.icon}
            </span>
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium text-zinc-100 truncate'>
                {s.label}
              </div>
              <div className='text-xs text-zinc-500 truncate'>{s.handle}</div>
            </div>
            <ArrowUpRight className='w-4 h-4 text-zinc-600 group-hover:text-zinc-200 group-hover:rotate-45 transition-all' />
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Shared bits ---------------- */

type AccentKey =
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "sky"
  | "fuchsia";

const ACCENTS: Record<AccentKey, { ring: string; chip: string; bg: string }> = {
  violet: {
    ring: "ring-violet-500/20",
    chip: "bg-violet-500/10 text-violet-300",
    bg: "bg-violet-500/20",
  },
  cyan: {
    ring: "ring-cyan-500/20",
    chip: "bg-cyan-500/10 text-cyan-300",
    bg: "bg-cyan-500/20",
  },
  emerald: {
    ring: "ring-emerald-500/20",
    chip: "bg-emerald-500/10 text-emerald-300",
    bg: "bg-emerald-500/20",
  },
  amber: {
    ring: "ring-amber-500/20",
    chip: "bg-amber-500/10 text-amber-300",
    bg: "bg-amber-500/20",
  },
  rose: {
    ring: "ring-rose-500/20",
    chip: "bg-rose-500/10 text-rose-300",
    bg: "bg-rose-500/20",
  },
  indigo: {
    ring: "ring-indigo-500/20",
    chip: "bg-indigo-500/10 text-indigo-300",
    bg: "bg-indigo-500/20",
  },
  sky: {
    ring: "ring-sky-500/20",
    chip: "bg-sky-500/10 text-sky-300",
    bg: "bg-sky-500/20",
  },
  fuchsia: {
    ring: "ring-fuchsia-500/20",
    chip: "bg-fuchsia-500/10 text-fuchsia-300",
    bg: "bg-fuchsia-500/20",
  },
};

function SectionHeader({
  icon,
  label,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
  accent: AccentKey;
}) {
  const a = ACCENTS[accent];
  return (
    <header className='mb-5'>
      <div className='inline-flex items-center gap-2 mb-3'>
        <span className={`p-1.5 rounded-lg ring-1 ring-inset ${a.ring} ${a.chip}`}>
          {icon}
        </span>
        <span className='text-[10px] uppercase tracking-wider text-zinc-400'>
          {label}
        </span>
      </div>
      <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-50 tracking-tight'>
        {title}
      </h2>
      <p className='text-sm sm:text-base text-zinc-400 mt-1.5 max-w-3xl'>
        {subtitle}
      </p>
    </header>
  );
}

function FeatureCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: AccentKey;
  children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5'>
      <div className='flex items-center gap-2 mb-2'>
        <span className={`p-1.5 rounded-lg ring-1 ring-inset ${a.ring} ${a.chip}`}>
          {icon}
        </span>
        <h3 className='text-sm font-semibold text-zinc-100'>{title}</h3>
      </div>
      <p className='text-xs sm:text-sm text-zinc-400 leading-relaxed'>{children}</p>
    </div>
  );
}
