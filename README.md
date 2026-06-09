# Plenton Web

Frontend da plataforma **Plenton**, sistema de gestão para nutricionistas (gestão de pacientes, consultas, anamneses, planos alimentares, catálogo de alimentos, assinaturas e dashboard).

Construído com **React 19 + Vite + TypeScript** e **Material UI v7**, consumindo o backend `Plenton-Back` (ASP.NET Core 9 + PostgreSQL).

> 📚 Documentação técnica detalhada em [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md) e variáveis de ambiente em [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

---

## Requisitos

- Node.js `>=20`
- Yarn `1.22.x` (definido em `packageManager`) ou npm
- Backend Plenton rodando localmente (ver repositório `Plenton-Back`)

## Instalação

```bash
yarn install
# ou
npm install
```

## Scripts

| Script | Descrição |
| --- | --- |
| `yarn dev` | Sobe o dev server (Vite) em `http://localhost:3039` |
| `yarn build` | Type-check (`tsc`) + build de produção |
| `yarn start` | Preview do build de produção |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn fm:check` / `yarn fm:fix` | Prettier |
| `yarn fix:all` | `lint:fix` + `fm:fix` |
| `yarn tsc:watch` | TypeScript em modo watch (sem emitir) |

## Variáveis de ambiente

A URL do backend é configurada pela variável **`VITE_BASE_URL`**. Use **dois
arquivos**: um `.env` local (não versionado) para rodar e o `.env.example`
versionado como modelo.

```bash
cp .env.example .env   # ajuste o valor se necessário
```

```env
# .env (gitignored)
VITE_BASE_URL=http://localhost:7259
```

> Em **produção**, `VITE_BASE_URL` é configurada nas variáveis de ambiente do
> **Vercel** (`https://api.plenton.com.br`), não em arquivo. Caso a variável não
> esteja definida, o fallback no código é `http://localhost:5226` (ver
> [src/services/api/index.ts](src/services/api/index.ts), única fonte que consome
> a variável). O arquivo [src/config-global.ts](src/config-global.ts) expõe
> `appName`/`appVersion`/`siteUrl`/`contactEmail` com valores fixos e **não** lê
> variáveis de ambiente. Detalhes em [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

---

## Estrutura

```
src/
├─ pages/         # Entradas das rotas (lazy)
├─ routes/        # Configuração de rotas + RequireAuth
├─ layouts/       # Layouts: auth e dashboard (sidebar + topbar)
├─ sections/      # UI por domínio (patient, appointment, anamnesis, mealPlan, food, workspace, overview, auth, public)
├─ hooks/         # Hooks por domínio (use-* / lista, detalhe, formulário)
├─ services/      # Camada HTTP (axios) por domínio
├─ contexts/      # AuthContext, ConfirmContext
├─ components/    # Componentes compartilhados
├─ utils/         # Helpers (auth-storage, format-*, etc.)
├─ types/         # Tipagens compartilhadas
├─ enums/         # Enums espelhados do backend
└─ theme/         # Customização MUI
```

## Domínios principais

- **Autenticação** — login com JWT + refresh token (cookie HttpOnly), bootstrap de sessão em [contexts/auth-context.tsx](src/contexts/auth-context.tsx).
- **Pacientes** — CRUD, fotos, endereço, observações e vínculo com planos alimentares.
- **Consultas / Agenda** — agendamento, edição, status, calendário (FullCalendar).
- **Anamneses** — templates dinâmicos com perguntas/opções e link público para o paciente responder.
- **Planos alimentares** — refeições, itens, substitutos, medidas caseiras e insights nutricionais.
- **Alimentos** — busca no catálogo TACO importado pelo backend.
- **Workspace** — visão consolidada por paciente (próxima consulta, último plano, antropometria, anamnese, envios).
- **Dashboard** — KPIs (pacientes ativos, taxa de retorno, comparecimento, consultas concluídas) e IMC médio.
- **Assinaturas** — catálogo de planos, checkout (integração Asaas), status (pendente/sucesso/cancelado/expirado) e gestão em `/settings/subscription`.

## Multi-tenant

Todas as requisições autenticadas enviam o header `X-TenantId`. Veja [src/services/api](src/services/api).

## Rotas

- Públicas (sem layout): `/` (landing), `/public/:tenantId/anamnesis/:token`, `/privacidade`, `/termos`, `/contato`, `/subscription/{success,cancel,expired}` (e redirects `/politica-de-privacidade` → `/privacidade`, `/termos-de-uso` → `/termos`)
- Públicas (sob `AuthLayout`): `/sign-in`, `/forgot-password`, `/reset-password`
- Autenticadas (sob `RequireAuth` + `DashboardLayout`): `/dashboard`, `/patient`, `/appointment`, `/workspace`, `/food`, `/anamnesis`, `/subscription/{checkout,pending}`, `/settings/subscription`
- Fallback: `/404` (e `*` → 404)

> Lista completa e detalhada em [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md#8-rotas-srcroutessectionstsx).

> O cadastro de nutricionista não tem rota própria: é um modo da tela
> `/sign-in` ativado por `?action=register`.

## Deploy

Configuração para Vercel em [vercel.json](vercel.json) (build com `yarn build` e SPA fallback).

---

## Convenções

- TypeScript estrito; preferir tipagens em `src/types/`.
- Hooks por domínio em `src/hooks/<dominio>/`.
- Serviços HTTP por domínio em `src/services/<dominio>/`.
- Validação de formulários com **Formik + Yup**.
- Estilo com **MUI v7** + tema customizado em `src/theme/`.

## Base do template

Projeto iniciado a partir do template [Minimal UI Kit (free)](https://free.minimals.cc/) — licença MIT mantida em [LICENSE.md](LICENSE.md).
