# Documentação Técnica — Plenton Web

> Documento gerado a partir da análise direta do código-fonte. Reflete o estado
> atual do repositório (frontend SPA). A camada de back-end é mantida no
> repositório `Plenton-Back` (ASP.NET Core + PostgreSQL/Supabase) e não é
> coberta aqui, exceto pela forma como o frontend a consome.

---

## 1. Visão geral

Frontend da plataforma **Plenton** — sistema de gestão para nutricionistas
(pacientes, consultas/agenda, anamneses, planos alimentares, catálogo de
alimentos, antropometria, dashboard e assinaturas). O nome Plenton é usado de
forma consistente no produto, no repositório e na documentação.

Aplicação **SPA** (Single Page Application) servida pelo Vite, consumindo uma
API REST por HTTP (axios). Autenticação por **JWT (access token) + refresh
token em cookie HttpOnly** e isolamento **multi-tenant** via header
`X-TenantId`.

---

## 2. Stack principal

| Camada | Tecnologia | Versão (package.json) |
| --- | --- | --- |
| Linguagem | TypeScript | `^5.8.2` |
| UI / Runtime | React + React DOM | `^19.1.0` |
| Build / Dev server | Vite + plugin React (SWC) | `^6.2.5` / `@vitejs/plugin-react-swc ^3.8.1` |
| Design system | Material UI (MUI) v7 + MUI Lab + Icons | `^7.0.1` / `^7.0.0-beta.10` / `^7.3.1` |
| Estilização | Emotion (`@emotion/react`, `styled`, `cache`) | `^11.14.x` |
| Roteamento | React Router DOM | `^7.4.1` |
| HTTP | Axios | `^1.9.0` |
| Formulários | Formik + Yup | `^2.4.6` / `^1.6.1` |
| Gráficos | ApexCharts + react-apexcharts | `^4.5.0` / `^1.7.0` |
| Calendário | FullCalendar (daygrid, timegrid, interaction, react) | `^6.1.18` |
| Datas | Day.js (+ plugin UTC) | `^1.11.13` |
| JWT | jwt-decode | `^4.0.0` |
| Utilitários | es-toolkit, minimal-shared | `^1.34.1` / `^1.0.7` |
| Ícones | @iconify/react | `^5.2.1` |
| Scroll | simplebar-react | `^3.3.0` |
| Fontes | @fontsource-variable/dm-sans, @fontsource/barlow | `^5.2.5` |

**Qualidade de código:** ESLint 9 (flat config) + plugins (import, perfectionist,
react, react-hooks, unused-imports) e Prettier 3. Type-check contínuo no dev via
`vite-plugin-checker`.

**Origem do template:** projeto iniciado a partir do
[Minimal UI Kit (free)](https://free.minimals.cc/) — licença MIT (`LICENSE.md`).
O `name` em `package.json` ainda é `@minimal/material-kit-react`, herança do
template.

**Requisitos de ambiente:** Node.js `>=20`; gerenciador de pacotes
`yarn@1.22.22` (campo `packageManager`), com suporte alternativo a npm.

---

## 3. Como rodar localmente

```bash
# 1. Instalar dependências
yarn install      # ou: npm install

# 2. Variável de ambiente — ver docs/ENVIRONMENT.md
#    Copie o modelo e ajuste se necessário (o .env não é versionado):
#      cp .env.example .env        # VITE_BASE_URL=http://localhost:7259

# 3. Subir o dev server (Vite) — http://localhost:3039
yarn dev          # ou: npm run dev

# 4. (Opcional) Build de produção + preview
yarn build        # tsc + vite build
yarn start        # preview do build em http://localhost:3039
```

> O backend `Plenton-Back` precisa estar rodando e acessível pela URL definida
> em `VITE_BASE_URL` para que as telas autenticadas funcionem. A landing page e
> as páginas institucionais funcionam sem backend.

---

## 4. Scripts disponíveis (`package.json`)

| Script | Comando | Descrição |
| --- | --- | --- |
| `dev` | `vite` | Dev server com HMR em `http://localhost:3039`. |
| `start` | `vite preview` | Serve o build de produção (preview) na mesma porta. |
| `build` | `tsc && vite build` | Type-check completo seguido do build de produção. |
| `lint` | `eslint "src/**/*.{js,jsx,ts,tsx}"` | Análise estática. |
| `lint:fix` | `eslint --fix ...` | Corrige problemas de lint automaticamente. |
| `lint:print` | `eslint --print-config ...` | Exporta a config resolvida do ESLint. |
| `fm:check` | `prettier --check ...` | Verifica formatação. |
| `fm:fix` | `prettier --write ...` | Aplica formatação. |
| `fix:all` | `lint:fix && fm:fix` | Lint + format de uma vez. |
| `clean` | `rm -rf node_modules .next out dist build` | Limpa artefatos (comando Unix). |
| `re:dev` | `yarn clean && yarn install && yarn dev` | Reinstalação limpa + dev. |
| `re:build` | `yarn clean && yarn install && yarn build` | Reinstalação limpa + build. |
| `re:build-npm` | `npm run clean && npm install && npm run build` | Idem usando npm. |
| `tsc:dev` | `yarn dev & yarn tsc:watch` | Dev + type-check em paralelo. |
| `tsc:watch` | `tsc --noEmit --watch` | Type-check contínuo sem emitir. |
| `tsc:print` | `tsc --showConfig` | Exibe a config resolvida do TS. |

> **Atenção (Windows):** `clean` (e por consequência `re:dev`/`re:build`) usa
> `rm -rf`, que não existe nativamente no PowerShell. Em Windows, remova as
> pastas manualmente ou rode os scripts via Git Bash/WSL.

---

## 5. Estrutura de pastas

```
Plenton-Web/
├─ index.html                 # HTML raiz (title "Plenton", favicons, theme-color)
├─ vite.config.ts             # Vite: porta 3039, alias src/*, checker (ts+eslint)
├─ vercel.json                # Deploy Vercel (SPA rewrite → "/")
├─ .env                       # Variáveis de ambiente locais (gitignored; copie de .env.example)
├─ .env.example               # Modelo versionado das variáveis de ambiente
├─ public/                    # Estáticos (favicon, robots.txt, sitemap.xml, assets/)
├─ docs/                      # Documentação (este arquivo, ENVIRONMENT.md, specs, etc.)
└─ src/
   ├─ main.tsx                # Bootstrap: Router + AuthProvider + ConfirmProvider
   ├─ app.tsx                 # App shell: ThemeProvider, scroll-to-top, color scheme
   ├─ config-global.ts        # CONFIG: appName, appVersion, siteUrl, contactEmail
   ├─ global.css              # Estilos globais
   ├─ pages/                  # Entradas de rota (componentes "page", lazy)
   ├─ routes/                 # sections.tsx (mapa de rotas) + components (RequireAuth, ErrorBoundary) + hooks
   ├─ layouts/                # auth, dashboard, core (primitivos), profile, nav-config-*
   ├─ sections/               # UI por domínio (telas e componentes de feature)
   ├─ hooks/                  # Hooks por domínio + common
   ├─ services/               # Camada HTTP: api (axios), http-client e serviços por domínio
   ├─ contexts/               # AuthContext, ConfirmContext
   ├─ components/             # Componentes compartilhados (table, chart, iconify, label, seo, ...)
   ├─ utils/                  # Helpers (auth-storage, jwt-utils, http-client, format-*, api-error)
   ├─ types/                  # Tipagens: domain/, api/ (requests/responses), dto/
   ├─ enums/                  # Enums espelhados do backend (patient, appointment, anamnesis, nutritionist)
   └─ theme/                  # Tema MUI customizado (palette, typography, components, ...)
```

**Alias de import:** `src/...` resolve para `./src/...` (configurado em
`vite.config.ts` e no `tsconfig`). Use sempre imports absolutos `src/...`.

---

## 6. Inicialização da aplicação (bootstrap)

Fluxo de inicialização (`src/main.tsx` → `src/app.tsx`):

1. `createBrowserRouter` monta o roteador a partir de `routesSection`
   (`src/routes/sections.tsx`), com `ErrorBoundary` global.
2. A árvore é envolvida por **providers** (de fora para dentro):
   `StrictMode` → `AuthProvider` → `ConfirmProvider` → `RouterProvider`.
3. O `Component` raiz renderiza `<App>` envolvendo o `<Outlet>` das rotas.
4. `App` aplica `InitColorSchemeScript` (modo de cor `data-color-scheme`, default
   `system`, persistido na chave `theme`), o `ThemeProvider` (MUI customizado) e
   o hook `useScrollToTop` (rola ao topo a cada mudança de `pathname`).

---

## 7. Fluxo de autenticação

A autenticação combina **access token em memória** (estado do módulo HTTP),
**refresh token em cookie HttpOnly** (gerenciado pelo backend) e uma cópia
opcional do access token em `localStorage`.

### 7.1 Componentes envolvidos

| Arquivo | Responsabilidade |
| --- | --- |
| `src/services/api/index.ts` | Instância axios, interceptors, estado de auth em memória (`HttpAuthState`), fila de refresh, handler de sessão expirada. |
| `src/services/auth/authService.ts` | `login`, `refresh`, `logout`, `register`, `forgot/reset/changePassword`, `getUserProfile`, `bootstrapSession`. |
| `src/contexts/auth-context.tsx` | `AuthProvider`: estado de sessão (`user`, `loading`, `authenticating`), `signIn`/`signOut`, bootstrap inicial, registro do handler de sessão expirada. |
| `src/utils/auth-storage.ts` | Persistência em `localStorage` (`user`, `token`). |
| `src/utils/jwt-utils.ts` | Decodificação do JWT (`id`, `email`, `name`, `role`, `tenantId`, `exp`). |
| `src/utils/auth-helpers.ts` | `buildAndStoreUser`: monta o `User` a partir do JWT + `getUserProfile`. |
| `src/routes/components/require-auth.tsx` | Guarda de rota: bloqueia até `loading` resolver; redireciona para `/sign-in` se não autenticado. |

### 7.2 Login

1. `signIn(credentials)` → `authService.login` faz `POST /api/auth/login`.
2. Em sucesso (`isSuccess`, sem `errors`, com `accessToken`): grava o token em
   memória (`HttpAuthState.setAccessToken`) e em `localStorage`
   (`authStorage.setToken`, marcado como opcional no código).
3. `buildAndStoreUser(token)` decodifica o JWT e busca o perfil
   (`GET /api/auth/profile`), persistindo o `User` no storage.

> O **cadastro** de nutricionista não tem rota própria: é um modo da tela
> `/sign-in` (`authService.register` → `POST /api/auth/register`).

### 7.3 Bootstrap de sessão (reload da página)

No `AuthProvider`, ao montar:
- Se a rota atual começa com `/sign-in`, `/forgot-password`, `/reset-password`
  ou `/public/`, **não** tenta restaurar sessão (evita 401 para visitantes).
- Só tenta `bootstrapSession` (→ `authService.refresh`) se já houver um `user`
  salvo no storage. Em sucesso, reconstrói o `User`; em falha, limpa o storage.

### 7.4 Refresh automático (interceptor de 401)

`api.interceptors.response` trata respostas `401`:
- Ignora se: não for 401, já houve retry (`_retry`), for rota de auth
  (`/login`, `/logout`, `/refresh`), estiver deslogando, ou não houver token.
- Caso contrário, dispara um **único** refresh (`refreshExecutor` =
  `authService.refresh`, `POST /api/auth/refresh` com `withCredentials`),
  enfileirando as requisições concorrentes e reexecutando-as com o novo token.
- Se o refresh falhar, chama `handleSessionExpired` → limpa sessão e redireciona
  para `/sign-in` (handler registrado pelo `AuthProvider`).

### 7.5 Logout

`signOut` → `authService.logout`: marca `loggingOut`, **aborta requisições em
voo** (`abortAllRequests`), zera o token, limpa o storage e chama
`POST /api/auth/logout` (invalida o cookie HttpOnly). Ao final, redireciona para
`/sign-in`.

### 7.6 Multi-tenant

Em toda requisição autenticada, o interceptor de request injeta:
- `Authorization: Bearer <accessToken>`;
- `X-TenantId: <tenantId>` — extraído do claim `tenantId` do JWT
  (`JwtUtils.getTenantId`).

O tenant corresponde ao nutricionista (chave de isolamento aplicada no backend).

---

## 8. Rotas (`src/routes/sections.tsx`)

Todas as páginas são **lazy-loaded** (`React.lazy` + `Suspense` com fallback de
`LinearProgress`).

### 8.1 Públicas — sem layout compartilhado

| Path | Página | Observações |
| --- | --- | --- |
| `/` (index) | `LandingPage` | Landing/marketing (Plenton). |
| `/public/:tenantId/anamnesis/:token` | `PublicAnamnesisPage` | Link público para o paciente responder a anamnese. |
| `/subscription/success` | `SubscriptionSuccessPage` | Retorno de pagamento (sucesso). |
| `/subscription/cancel` | `SubscriptionCancelPage` | Retorno de pagamento (cancelado). |
| `/subscription/expired` | `SubscriptionExpiredPage` | Assinatura expirada. |
| `/privacidade` | `PrivacyPolicyPage` | Política de privacidade. |
| `/termos` | `TermsOfUsePage` | Termos de uso. |
| `/contato` | `ContactPage` | Página institucional de contato. |
| `/politica-de-privacidade` | → redireciona | `Navigate` para `/privacidade`. |
| `/termos-de-uso` | → redireciona | `Navigate` para `/termos`. |

### 8.2 Públicas — sob `AuthLayout`

| Path | Página |
| --- | --- |
| `/sign-in` | `SignInPage` (login + cadastro via `?action=register`) |
| `/forgot-password` | `ForgotPasswordPage` |
| `/reset-password` | `ResetPasswordPage` |

### 8.3 Autenticadas — sob `RequireAuth` + `DashboardLayout`

| Path | Página | Domínio |
| --- | --- | --- |
| `/dashboard` | `DashboardPage` | KPIs / visão analítica |
| `/patient` | `PatientPage` | Pacientes |
| `/appointment` | `AppointmentPage` | Consultas / agenda |
| `/workspace` | `WorkspacePage` | Workspace por paciente |
| `/food` | `FoodPage` | Catálogo de alimentos |
| `/anamnesis` | `AnamnesisPage` | Anamneses (templates) |
| `/subscription/checkout` | `SubscriptionCheckoutPage` | Checkout de assinatura |
| `/subscription/pending` | `SubscriptionPendingPage` | Assinatura pendente de pagamento |
| `/settings/subscription` | `SettingsSubscriptionPage` | Gestão da assinatura |

### 8.4 Fallback

| Path | Página |
| --- | --- |
| `/404` | `Page404` |
| `*` | `Page404` |

---

## 9. Layouts (`src/layouts/`)

| Layout | Uso | Conteúdo |
| --- | --- | --- |
| `auth/` (`AuthLayout`) | `/sign-in`, `/forgot-password`, `/reset-password` | Layout centrado para telas de autenticação. |
| `dashboard/` (`DashboardLayout`) | Área autenticada | Sidebar (nav) + topbar; navegação em `nav-config-dashboard.tsx`; conta em `nav-config-account.tsx` (popover de conta, troca de senha, perfil, settings). |
| `core/` | Base dos layouts acima | Primitivos: `layout-section`, `header-section`, `main-section`, CSS vars. |
| `profile/` | Edição de perfil do nutricionista | Tabs (dados, endereço) reutilizadas no popover de conta. |

A **landing page** e as **páginas institucionais** não usam esses layouts: têm
header/footer próprios (`sections/landing/components/landing-header|footer`,
`sections/institutional/components/public-page-layout`).

**Navegação principal (sidebar)** — `src/layouts/nav-config-dashboard.tsx`:
Dashboard, Paciente, Consulta, Workspace, Alimentos, Anamnese.

---

## 10. Serviços / consumo de API (`src/services/`)

### 10.1 Camada HTTP base

- **`services/api/index.ts`** — instância axios única:
  - `baseURL = import.meta.env.VITE_BASE_URL ?? 'http://localhost:5226'`;
  - `timeout: 30000`, `withCredentials: true` (envia o cookie de refresh);
  - suporte a **ngrok** (`ngrok-skip-browser-warning`) quando a base contém
    `ngrok-free.app`;
  - interceptors de request (Authorization + X-TenantId) e response (refresh em
    401), fila de refresh e `AbortController` global para cancelamento em massa.
- **`utils/http-client.ts`** — wrappers tipados sobre a instância: `get`, `post`,
  `put`, `del`, `postMultipart`, `putMultipart` (este último converte objetos
  aninhados em `FormData`, inclusive `File`).

### 10.2 Serviços por domínio

| Serviço | Arquivo | Endpoints/responsabilidade (amostra) |
| --- | --- | --- |
| Auth | `auth/authService.ts` | `/api/auth/{login,refresh,logout,register,forgot-password,reset-password,change-password,profile}` |
| Pacientes | `patient/patientService.ts` | `/api/patient/{get-all-patients,create-patient,:id}` (CRUD + paginação) |
| Consultas | `appointment/appointmentService.ts` | Agenda/consultas |
| Anamnese | `anamnesis/anamnesisService.ts` | Templates, perguntas, respostas |
| Anamnese pública | `public/publicAnamnesisService.ts` | Fluxo do link público (`/public/...`) |
| Plano alimentar | `mealPlan/mealPlanService.ts`, `mealPlan/homemadeMeasureService.ts` | Refeições, itens, substitutos, medidas caseiras |
| Alimentos | `food/foodService.ts`, `food/foodTemplateService.ts` | Catálogo (TACO) e alimentos do usuário |
| Workspace | `workspace/workspaceService.ts`, `workspacePlanService.ts`, `workspaceAnthropometryService.ts`, `workspaceAnthropometricEvolutionService.ts` | Visão consolidada por paciente (plano, antropometria, evolução) |
| Overview | `overview/overviewService.ts` | KPIs do dashboard |
| Assinatura | `subscription/subscriptionService.ts` | `/api/subscription-plans/active`, `/api/subscriptions/asaas/start`, `/api/subscriptions/current` |
| User data | `userData/userDataService.ts` | Dados do usuário/perfil |
| System settings | `systemSettings/systemSettingsService.ts` | Configurações de sistema |

> O `services/index.ts` reexporta apenas os serviços de uso mais frequente
> (`auth`, `patient`, `overview`, `mealPlan`, `appointment`, `subscription`);
> os demais são importados diretamente pelo caminho.

**Padrão de resposta:** vários endpoints retornam um envelope `{ data: ... }`
(ou `ServiceResponse<T>`). Serviços como o de **assinatura** fazem
**normalização defensiva** (`unwrap`, conversão de enums numéricos/textuais,
booleanos, ciclos de cobrança, status), tolerando variações no payload do
backend.

---

## 11. Hooks (`src/hooks/`)

Organizados por domínio; encapsulam carregamento de dados, paginação e estado de
formulário. Principais:

**`common/`**
- `use-auth.ts` — acesso ao `AuthContext` (`user`, `isAuthenticated`, `loading`,
  `signIn`, `signOut`).
- `use-confirm.ts` — diálogos de confirmação (via `ConfirmContext`).
- `use-table.ts` — estado de tabela (paginação, ordenação, seleção).
- `use-theme-mode.ts` — alternância de modo de cor.

**Por domínio**
- `overview/use-overview.ts` — KPIs do dashboard.
- `patient/use-patient-list.ts`, `use-patient-detail.ts`.
- `appointment/use-appointment.ts`.
- `anamnesis/use-anamnesis-list.ts`, `use-anamnesis-detail.ts`,
  `use-anamnesis-by-patient.ts`, `use-anamnesis-response-pdf.ts`.
- `food/use-food-list.ts`, `use-food-details.ts`.
- `meal-plan/use-homemade-measures.ts`, `use-meal-plan-pdf.ts`.
- `workspace/` — `use-workspace-list`, `use-workspace-section`,
  `use-workspace-plans`, `use-workspace-anthropometries`,
  `use-workspace-anthropometry-detail`, `use-workspace-anthropometric-evolution`,
  `use-energy-expenditure-calculation`.
- `subscription/` — `use-current-subscription`, `use-start-subscription`,
  `use-subscription-catalog`.
- `public/use-public-anamnesis.ts`, `user-data/use-user-data-details.ts`,
  `system-settings/use-system-settings.ts`.

---

## 12. Tipos / domínios (`src/types/`)

Reexportados por `src/types/index.ts`. Organização:

- **`domain/`** — modelos de negócio: `user` (`User`, `Profile`, `Gender`),
  `patient`, `nutritionist`, `food`, `FoodGroup`, `anamnesis`,
  `public-anamnesis`, `meal-plans`, `appointment`, `workspace`, `overview`,
  `subscription`, `system-settings`, `address`, `jwt-payload`.
- **`api/requests/`** — payloads de requisição (`LoginRequest`, `RegisterRequest`,
  `ForgotPasswordRequest`, `ResetPasswordRequest`, `PagedRequest`, `RequestOpts`).
- **`api/responses/`** — respostas (`LoginResponse`, `PagedResult<T>`).
- **`dto/`** — DTOs auxiliares (ex.: `address-dto`).

Tipos-chave de autenticação:
- `JwtPayload`: `{ id, name, email, exp, tenantId, role }`.
- `User`: `{ id, email, name, tenantId, role, profile? }`.
- `LoginResponse`: `{ accessToken, refreshToken, errors, isSuccess }`.
- `PagedResult<T>`: `{ currentPage, items, pageSize?, totalCount, totalPages }`.

**Enums** (`src/enums/`): espelham valores do backend para `patient`,
`appointment`, `anamnesis`, `nutritionist`.

---

## 13. Páginas e seções

### 13.1 Páginas (`src/pages/`)

Cada arquivo é um componente "page" fino que define `<title>` e renderiza a
*view* correspondente da seção. Páginas: `landing`, `dashboard`, `patient`,
`appointment`, `anamnesis`, `workspace`, `food`, `sign-in`, `forgot-password`,
`reset-password`, `public-anamnesis`, `privacy-policy`, `terms-of-use`,
`contact`, `page-not-found`, e a família `subscription-*`
(`checkout`, `pending`, `success`, `cancel`, `expired`) + `settings-subscription`.

### 13.2 Seções (`src/sections/`)

UI agrupada por domínio. Cada domínio costuma ter `view/` (telas) e
`components/` (peças reutilizáveis):

- **`landing/`** — header, hero, features, how-it-works, pricing, faq, cta,
  footer (ver §14).
- **`institutional/`** — `public-page-layout`, `legal-document` e views de
  privacidade, termos e contato.
- **`public-anamnesis/`** — formulário público (header, consent, question, view).
- **`auth/`** — `sign-in-view`, `forgot-password-view`, `reset-password-view`.
- **`overview/`** — widgets de analytics (charts, widgets, skeletons) e
  `overview-analytics-view`.
- **`patient/`** — lista, formulário (tabs: dados/endereço/observações), header.
- **`appointment/`** — lista/calendário e formulário de consulta.
- **`anamnesis/`** — lista, formulário, painel de perguntas, preview, cards.
- **`mealPlan/`** — refeições, itens, substitutos, medidas caseiras,
  autocompletes, insights, drawers.
- **`food/`** — lista, toolbar, linha de tabela, formulário.
- **`workspace/`** — sidebar, tabs (anamnese, antropometria, plano alimentar,
  evolução, documentos), seção de gasto energético, drawers.
- **`subscription/`** — checkout, gestão, pendente, rota de status.
- **`error/`** — `not-found-view`.

> **Refatoração em andamento (git status):** a antiga pasta `sections/public/`
> foi substituída por `sections/public-anamnesis/`, e foram adicionadas
> `sections/institutional/` e as páginas `contact`/`privacy-policy`/
> `terms-of-use`. A documentação acima reflete a estrutura nova (atual).

---

## 14. Estrutura da landing page

A landing é renderizada por `sections/landing/view/landing-view.tsx`, que compõe,
em ordem, os blocos abaixo dentro de um `Box` com `background.default`:

1. `LandingHeader` — navegação/topbar da landing.
2. `LandingHero` — chamada principal.
3. `LandingFeatures` — recursos do produto.
4. `LandingHowItWorks` — passo a passo.
5. `LandingPricing` — planos/preços.
6. `LandingFaq` — perguntas frequentes.
7. `LandingCta` — chamada para ação.
8. `LandingFooter` — rodapé.

A view lê o `hash` da URL (`useLocation`) e, ao chegar com uma âncora (ex.:
vindo de uma página institucional para `/#pricing`), faz **scroll suave** até a
seção após o scroll-to-top global (timeout de 100ms).

---

## 15. Configuração global e SEO

- **`src/config-global.ts`** (`CONFIG`):
  - `appName: 'Plenton'`
  - `appVersion`: lido de `package.json` (`3.0.0`)
  - `siteUrl: 'https://www.plenton.com.br'`
  - `contactEmail: 'contato@plenton.com.br'`
  - **Não lê variáveis de ambiente** — são valores fixos no código.
- **`index.html`** — `title` "Plenton", `theme-color #0F766E`, favicons da marca.
- **`public/sitemap.xml`** — `/`, `/contato`, `/privacidade`, `/termos`
  (domínio `www.plenton.com.br`).
- **`public/robots.txt`** — diretrizes de indexação.
- **`src/components/seo/no-index.tsx`** — utilitário para marcar páginas como
  `noindex`.

---

## 16. Deploy

- **Vercel** — `vercel.json` define rewrite SPA: todas as rotas (`/(.*)`)
  servem `/` (fallback de client-side routing). Build padrão `yarn build`.
- Em produção, `VITE_BASE_URL` é configurada nas **variáveis de ambiente do
  Vercel** (valor: `https://api.plenton.com.br`) — não há `.env.production`
  versionado. Ver `docs/ENVIRONMENT.md`.

---

## 17. Pontos de atenção técnicos

1. **`VITE_BASE_URL` é a única variável de ambiente consumida** (em
   `services/api/index.ts`). Definida em dois lugares: `.env` local (gitignored,
   `http://localhost:7259`) e variáveis do Vercel em produção
   (`https://api.plenton.com.br`). O `.env.example` versionado serve de modelo.
2. **Fallback `5226` no código:** se `VITE_BASE_URL` não existir, a base cai para
   `http://localhost:5226`. É apenas rede de segurança — sempre configure o
   `.env` (porta real do `Plenton-Back`: `7259`). Ver `docs/ENVIRONMENT.md`.
3. **Token NÃO é persistido em `localStorage`**: o access token vive apenas em
   memória (`HttpAuthState`) e o refresh token em cookie HttpOnly. O
   `localStorage` guarda somente o objeto `user`. `authStorage` foi reduzido a
   `setUser`/`getUser`/`clear` (este apenas remove a chave `user`). `JwtUtils`
   opera só sobre token passado explicitamente (sem fallback de storage).
4. **`config-global.ts` com valores fixos:** `siteUrl`/`contactEmail`/`appName`
   estão hardcoded. Se houver ambientes (staging/prod) com domínios distintos,
   considerar movê-los para env.
5. **Nomenclatura de marca:** produto, repositório e documentação usam
   "Plenton". Manter a mesma grafia ao evoluir a documentação pública.
6. **Scripts `clean`/`re:*` são Unix-only** (`rm -rf`): incompatíveis com
   PowerShell no Windows.
7. **Normalização defensiva no `subscriptionService`:** o serviço tolera enums
   numéricos e textuais e múltiplos formatos de payload — indica contrato ainda
   não totalmente estável com o backend de pagamentos (Asaas).
8. **`index.html` com `<html lang="en">`:** o produto é pt-BR; considerar
   ajustar para `pt-BR` por acessibilidade/SEO.

---

## 18. Referências de arquivos

| Tema | Arquivo |
| --- | --- |
| Rotas | `src/routes/sections.tsx` |
| Guarda de rota | `src/routes/components/require-auth.tsx` |
| Bootstrap | `src/main.tsx`, `src/app.tsx` |
| Auth (estado/sessão) | `src/contexts/auth-context.tsx` |
| Auth (API) | `src/services/auth/authService.ts` |
| HTTP base | `src/services/api/index.ts`, `src/utils/http-client.ts` |
| JWT | `src/utils/jwt-utils.ts`, `src/utils/auth-helpers.ts` |
| Storage | `src/utils/auth-storage.ts` |
| Config | `src/config-global.ts`, `vite.config.ts` |
| Navegação | `src/layouts/nav-config-dashboard.tsx` |
| Landing | `src/sections/landing/view/landing-view.tsx` |
| Variáveis de ambiente | `docs/ENVIRONMENT.md` |
