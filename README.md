# ☕ Morning Brief

> AI-powered personalised morning news briefings — fetch top headlines from
> **NewsAPI.org**, summarise them with **Claude**, and read a crisp digest of
> your day.

Built with **React**, **Tailwind CSS**, **Vite**, the **Claude API**
(`@anthropic-ai/sdk`), and **NewsAPI.org** — structured strictly around
**Clean Architecture**.

---

## Features

- 🎯 Pick the news categories you care about
- 📰 Fetches live top headlines per category from NewsAPI.org
- 🤖 Generates a markdown morning digest with the Claude API
- 🧱 Clean Architecture: domain · application · infrastructure · interfaces
- ✅ Strict TypeScript, ESLint with layer-boundary enforcement, Prettier

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [NewsAPI.org](https://newsapi.org/register) API key
- An [Anthropic Console](https://console.anthropic.com/) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your keys in `.env.local`:

```dotenv
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_NEWS_API_KEY=...
# optional overrides
VITE_CLAUDE_MODEL=claude-3-5-haiku-20241022
VITE_MAX_ARTICLES_PER_CATEGORY=5
```

### 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173.

### Other scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run build`      | Type-check and build for production      |
| `npm run preview`    | Preview the production build             |
| `npm run lint`       | Lint (incl. clean-architecture boundaries) |
| `npm run lint:fix`   | Lint and auto-fix                        |
| `npm run format`     | Format with Prettier                     |
| `npm run type-check` | Type-check without emitting              |

> ⚠️ **Security note:** This scaffold calls the Anthropic API directly from the
> browser (`dangerouslyAllowBrowser: true`) so it runs out-of-the-box for local
> development. **For production, proxy Claude calls through a backend** so your
> API key is never shipped to clients. The clean architecture makes this a
> drop-in change: implement `ISummarisationService` against your backend and
> swap it in the composition root — no domain, application, or UI code changes.

---

## Clean Architecture

This project follows a strict layered architecture. **Dependencies only point
inward.** The rules are documented in the `CLAUDE.md` files in each layer and
enforced by `architecture.json` and an ESLint `import/no-restricted-paths` rule.

```
interfaces  →  application  →  domain
infrastructure  →  application  →  domain
domain depends on NOTHING outside itself
```

### Layers

```
src/
├── domain/             ← Enterprise business rules (zero dependencies)
│   ├── entities/           Article, Brief, UserPreferences
│   ├── value-objects/      ArticleId, BriefId, Category, SourceName
│   ├── repositories/       IArticleRepository, IBriefRepository (interfaces)
│   ├── services/           BriefAssemblyService, ISummarisationService (port)
│   └── errors/             DomainError
│
├── application/        ← Use cases & orchestration (depends only on domain)
│   ├── use-cases/          GenerateMorningBriefUseCase, GetLatestBriefUseCase
│   ├── dtos/               ArticleDTO, BriefDTO, UserPreferencesDTO
│   ├── mappers/            ArticleMapper, BriefMapper
│   ├── ports/              IUseCaseRegistry
│   └── errors/             ApplicationError
│
├── infrastructure/     ← I/O & implementations (implements domain/app ports)
│   ├── http/               NewsApiClient
│   ├── llm/                ClaudeSummarisationService (implements port)
│   ├── repositories/       NewsApiArticleRepository, InMemoryBriefRepository
│   └── config/             env, CompositionRoot (dependency injection)
│
├── interfaces/         ← Adapters / UI (depends only on application)
│   ├── controllers/        BriefController
│   ├── di/                 UseCaseContext (DI boundary for React)
│   ├── hooks/              useMorningBrief
│   ├── components/         CategoryPicker, BriefView, ArticleCard, …
│   ├── pages/              HomePage
│   ├── lib/                cn, markdown
│   └── App.tsx
│
└── main.tsx            ← Bootstrap seam: wires infrastructure → interfaces
```

### How a request flows

1. **`HomePage`** (interfaces) reads UI state and calls the
   **`useMorningBrief`** hook.
2. The hook calls **`BriefController`** (interfaces), which depends only on the
   **`IUseCaseRegistry`** application port.
3. The controller invokes **`GenerateMorningBriefUseCase`** (application).
4. The use case parses **`UserPreferences`** (domain), fetches articles through
   the **`IArticleRepository`** port, assembles a **`Brief`** aggregate via
   **`BriefAssemblyService`** (domain), and requests a summary through the
   **`ISummarisationService`** port.
5. **Infrastructure** supplies the concrete implementations
   (`NewsApiArticleRepository`, `ClaudeSummarisationService`,
   `InMemoryBriefRepository`), wired together in **`CompositionRoot`**.
6. The use case returns a **`BriefDTO`** — never a raw domain entity — back up
   through the controller to the UI.

### Why the seam is in `main.tsx`

The interfaces layer is forbidden from importing infrastructure. So the single
place where the infrastructure **composition root** meets the interfaces layer
is `src/main.tsx` (the bootstrap file, which sits outside the inner layers). It
builds the `IUseCaseRegistry` and injects it via React context. To swap any
implementation (e.g. a real database or a backend-proxied Claude), you only edit
`CompositionRoot.ts` — nothing else changes.

---

## License

MIT
