# MVP Plenton Web — Progresso e Pendências

> Documento de acompanhamento da implementação do MVP por fases.
> Use para retomar o trabalho em outro momento.
> Última atualização: 2026-05-18.

## Status geral

| Fase | Tema                             | Status                   |
| ---- | -------------------------------- | ------------------------ |
| 0    | Preparação e saneamento técnico  | ✅ Concluída (commitada) |
| 1    | Autenticação e sessão            | ✅ Concluída (commitada) |
| 2    | Pacientes                        | ✅ Concluída (commitada) |
| 3    | Agenda / Consultas               | ✅ Concluída (commitada) |
| 4    | Anamnese                         | ✅ Concluída             |
| 5    | Workspace MVP                    | ⏳ Próxima               |
| 6    | Antropometria e gasto energético | ⬜ Pendente              |
| 7    | Plano alimentar                  | ⬜ Pendente              |
| 8    | Alimentos                        | ⬜ Pendente              |
| 9    | Dashboard                        | ⬜ Pendente              |
| 10   | Homologação ponta a ponta        | ⬜ Pendente              |

**Saúde do projeto:** `npm run lint` → 0 erros / 0 warnings · `npm run build` → OK
(único aviso pré-existente: chunks > 500 kB — não bloqueante).

### Como retomar / convenções

- Validar sempre ao fim de cada fase: `npm.cmd run lint` e `npm.cmd run build`.
- Auto-fix de ordenação de imports: `npm.cmd run lint:fix`.
- Backend disponível em `c:\Desenvolvimento\Plenton-Back` — cruzar contratos antes de assumir.
- Padrão de erro: usar `extractApiErrorMessage` (`src/utils/api-error.ts`).
- Regra do plano: não refatorar partes não relacionadas; preservar o padrão atual.
- Mapa de endpoints por fase: [docs/endpoints-mvp.md](endpoints-mvp.md).

---

## Fase 0 — Preparação e saneamento técnico ✅

**Feito:**

- README corrigido: variável de ambiente correta `VITE_BASE_URL` (era `VITE_API_URL`), arquivo `.env.development.local`, porta 7259, fonte de consumo (`src/services/api/index.ts`) e seção de rotas alinhada a `src/routes/sections.tsx`.
- 5 warnings de `perfectionist/sort-named-imports` corrigidos via `lint:fix`.
- Criado [docs/endpoints-mvp.md](endpoints-mvp.md) com os endpoints obrigatórios por fase, cruzados com o backend.

**Arquivos:** `README.md`, `docs/endpoints-mvp.md` (novo), `src/services/anamnesis/anamnesisService.ts`, `src/services/mealPlan/mealPlanService.ts`.

---

## Fase 1 — Autenticação e sessão ✅

**Feito:**

- Validado por revisão de código: login, cadastro (modo `?action=register` da `/sign-in`), logout, refresh com fila, bootstrap de sessão, `Authorization` + `X-TenantId`, recuperação/redefinição de senha, troca de senha no perfil, `RequireAuth`.
- **Correção:** `authService.login` e `authService.changePassword` não normalizavam erro do backend → passaram a usar `extractApiErrorMessage` (padrão do arquivo).
- **Correção da pendência #1 (refresh falho no meio da sessão):** novo `registerSessionExpiredHandler` em `src/services/api/index.ts` (espelha `registerRefreshExecutor`), acionado no `catch` do refresh; `AuthContext` registra handler que limpa storage e redireciona para `/sign-in`. Fecha o critério de aceite "rotas protegidas redirecionam" também no meio da sessão.

**Arquivos:** `src/services/auth/authService.ts`, `src/services/api/index.ts`, `src/contexts/auth-context.tsx`.

---

## Fase 2 — Pacientes ✅

**Feito:**

- **`nutritionistId` resolvido:** o endpoint `POST /api/patient/create-patient` espera o **`userId`** (backend chama `GetNutricionistByUserIdAsync` e resolve o nutricionista). Logo `authStorage.getUser()?.id` está **correto** no cadastro de paciente. A diferença para os outros módulos (`user.profile.id`) é **proposital** (contratos de endpoint diferentes). Sem mudança de código; documentado.
- Validado: listagem/busca/paginação/ordenação, CRUD, exclusão com confirmação destrutiva (backend bloqueia se há consultas).
- **Correções:**
  - Mensagens de erro copy-paste erradas ("anamnese"/"questionário") em `use-patient-list.ts`.
  - Bug do CEP vazio em `validation.ts` (regex disparava em campo opcional em branco) → `excludeEmptyString: true`.
  - Duplo `createOrUpdate` no cadastro (risco de POST/paciente duplicado) → reduzido a uma chamada.
- **Removida** a aba morta "Plano alimentar" do cadastro do paciente (componente stub deletado). Plano alimentar permanece só no Workspace.

**Arquivos:** `src/hooks/patient/use-patient-list.ts`, `src/sections/patient/validation.ts`, `src/sections/patient/view/patient-form-view.tsx`, `src/sections/patient/components/form-tabs/patient-tabs.tsx`, **deletado** `src/sections/patient/components/form-tabs/patient-meal-plans-tab.tsx`.

---

## Fase 3 — Agenda / Consultas ✅

**Feito:**

- Validado: calendário (FullCalendar pt-BR), CRUD, drag&drop, status, seleção de paciente.
- **`nutritionistId` confirmado:** consulta usa `CreateAppointmentDto.NutritionistId` direto → `user.profile.id` está correto aqui (confirma que a diferença vs. paciente é proposital).
- **Drag&drop seguro:** backend `AppointmentMapper.MapToEntity` só altera a data quando `IsDragDrop=true` — não apaga cor/observação/paciente.
- **Correção:** os 5 handlers de erro do `use-appointment.ts` estavam inconsistentes; o `deleteEvent` podia renderizar objeto (`[object Object]`) no Snackbar → padronizados com `extractApiErrorMessage`.
- Pasta `src/services/appoointment` renomeada para `src/services/appointment` (pendência técnica resolvida).

**Arquivos:** `src/hooks/appointment/use-appointment.ts` (+ renomeação de pasta do service).

---

## Fase 4 — Anamnese ✅

**Validado (dois lados):** CRUD de templates, tipos de pergunta (texto, número,
boolean, select, multiselect), preview, envio público (link/copiar, e-mail via
backend, WhatsApp via `wa.me` puro), rota pública `/public/:tenantId/anamnesis/:token`
fora do `RequireAuth`, consentimento LGPD e submissão final. Contratos
front↔back conferidos (controllers, DTOs, services).

**Contrato esclarecido:** em Select/MultiSelect o valor enviado/validado é o
**texto da opção** (`AnamnesisOption.Text`), não o Id — front e back já
consistentes. JSDoc enganoso em `public-anamnesis.ts` (dizia "opcaoId" e rotas
erradas) corrigido para evitar bug futuro.

**Correções de frontend:**

- `anamnesis-form-view.tsx`: `handleSave` tinha chamada dupla frágil de
  `createOrUpdate` + rejeição não tratada (mesma classe do bug da Fase 2) →
  reduzido a 1 chamada com `try/catch`; `isEdit` morto removido.
- Padronização de erro com `extractApiErrorMessage` (padrão do projeto, igual
  F1/F3) em `use-anamnesis-detail`, `use-anamnesis-list`,
  `use-anamnesis-by-patient`, `use-public-anamnesis` (4 catches) e
  `workspace-send-anamnesis-dialog` (2 catches).
- `public-anamnesis-view.tsx`: `reload()` redundante removido (o `submit` do
  hook já recarrega o estado "enviado").

**Correção de backend (P12 — decisão do usuário: corrigir agora):** vazamento
entre tenants. `AnamnesisService.GetPagedAnamnesisAsync` /
`AnamnesisRepository.GetPagedAsync` não filtravam por tenant, e
`GetByIdAsync`/`UpdateAnamnesisAsync` não checavam propriedade (só o DELETE
checava). Adicionado escopo por `TenantId`: listagem filtra na query;
`GetById` retorna 404 (não revela existência entre tenants);
`Update` retorna 403 (espelha o DELETE). Repo `GetByIdAsync(Guid)` mantido
intacto (usado pelo fluxo público). Compila 0 erros (Core/Infra/Application).
⚠️ Reiniciar a instância da API em execução para efetivar.

**Correção de backend (P14 — bug reportado em teste): `DbUpdateConcurrencyException`
ao editar anamnese e adicionar pergunta nova.** `Entity.Id = Guid.NewGuid()` no
construtor → perguntas novas já nascem com Guid; `RepositoryBase.UpdateAndSaveAsync`
faz `_db.Update(entity)` que marca o grafo inteiro como `Modified` → EF emite
`UPDATE` numa linha inexistente → 0 linhas → exceção. O repo já tinha o
`AnamnesisRepository.UpdateAsync` especializado (estados Added/Modified/Deleted
por entidade) mas estava órfão (fora da interface, sem chamadores). Exposto em
`IAnamnesisRepository` e `UpdateAnamnesisAsync` passou a usá-lo; removido o
check frágil `affectedRows == 0` (dava falso erro 500 quando só havia reordenação)
e corrigida a mensagem copy-paste ("Consulta cancelada" → "Questionário
atualizado"). Compila 0 erros. ⚠️ Reiniciar a API para efetivar.
Limitação secundária conhecida (não-bloqueante): remover opção individual de
uma pergunta existente pode deixar linha órfã em `AnamnesisOptions` — registrado
como P15.

**Decisão #2 (rascunho):** **não incluir** — confirmado. O front não tem UI de
rascunho; `saveDraft` no hook/serviço é plumbing inócuo (igual P6). Nada a
esconder, sem mudança de código.

**Decisão #4 (envio e-mail/WhatsApp):** resolvido — e-mail usa endpoint real
do backend; WhatsApp é `wa.me` client-side puro (sem backend). Alinhado à
regra do MVP.

**Arquivos (frontend):** `src/sections/anamnesis/view/anamnesis-form-view.tsx`,
`src/hooks/anamnesis/use-anamnesis-detail.ts`,
`src/hooks/anamnesis/use-anamnesis-list.ts`,
`src/hooks/anamnesis/use-anamnesis-by-patient.ts`,
`src/hooks/public/use-public-anamnesis.ts`,
`src/sections/public/view/public-anamnesis-view.tsx`,
`src/sections/workspace/components/form-tabs/workspace-send-anamnesis-dialog.tsx`,
`src/types/domain/public-anamnesis.ts`.

**Arquivos (backend):** `Plenton.Core/Interfaces/Repositories/IAnamnesisRepository.cs`,
`Plenton.Infra/Repositories/AnamnesisRepository.cs`,
`Plenton.Application/Services/Anamnesis/IAnamnesisService.cs`,
`Plenton.Application/Services/Anamnesis/AnamnesisService.cs`,
`Plenton.API/Controllers/Anamnesis/AnamnesisController.cs`.

**Observação (não-bloqueante):** `AnamnesisController.SubmitResponses`
(`POST /api/anamnesis/submit`) tem `nutritionistId` fixo em `Guid.Empty` →
sempre 401. Não é consumido pelo front (fluxo de submissão usa o controller
público). Endpoint morto — backlog backend.

---

## Pendências consolidadas

| #   | Origem | Item                                                                                                             | Risco  | Recomendação                                            | Status        |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------- | ------------- |
| P1  | F1     | Refresh falho não redirecionava                                                                                  | Médio  | —                                                       | ✅ Resolvido  |
| P2  | F1     | Regra de senha inconsistente (reset sem mín.; change mín. 6; cadastro "mín. 8" só helper)                        | Baixo  | Alinhar quando a política do backend estiver confirmada | Aberto        |
| P3  | F1     | Sign-in/cadastro não usam Formik+Yup (diverge da convenção)                                                      | Nenhum | Não mexer (fora de escopo / preservar padrão)           | Aceito        |
| P4  | F1/F5  | Botões sociais (Google/GitHub/Twitter) decorativos                                                               | Baixo  | Esconder na Fase 5 (limpeza de mocks)                   | Para F5       |
| P5  | F2     | Endereço: prompt pede obrigatório, schema atual é opcional                                                       | Médio  | **Decisão necessária** (ver abaixo)                     | Aberto        |
| P6  | F2     | `dietPlans`/`dietSchema` ainda no type/validação (plumbing inócuo)                                               | Nenhum | Limpeza opcional pós-MVP                                | Aberto        |
| P7  | F3     | Dropdown de Status aparece na "Nova Consulta", mas `CreateAppointmentDto` não tem Status (nasce sempre Agendada) | Baixo  | Esconder o campo Status no modo criação                 | Aberto        |
| P8  | F3     | `AppointmentView.PatientName` depende de `Patient` carregado pós-save; título pode nascer vazio                  | Médio  | Verificar na Fase 10; se ocorrer, eager-load no backend | Verificar F10 |
| P9  | F3     | Backend `GetAppointmentsByPatient` retorna `Success` com status 404                                              | Baixo  | Backlog do backend                                      | Aberto        |
| P10 | F0     | Casing inconsistente nas rotas da API (`/api/Workspace` vs `/api/patient`)                                       | Nenhum | Backlog pós-MVP                                         | Aberto        |
| P11 | F0     | Bundle > 500 kB                                                                                                  | Nenhum | Dívida técnica pós-MVP (code-splitting)                 | Aberto        |
| P12 | F4     | Vazamento entre tenants: anamnese list/getById/update sem escopo por tenant                                      | Alto   | Corrigido no backend (escopo por `TenantId`)            | ✅ Resolvido  |
| P13 | F4     | `POST /api/anamnesis/submit` morto (nutritionistId `Guid.Empty` → 401); não consumido pelo front                 | Nenhum | Backlog backend (remover/implementar)                   | Aberto        |
| P14 | F4     | `DbUpdateConcurrencyException` ao editar anamnese + nova pergunta (`_db.Update` marca grafo todo Modified)        | Alto   | Corrigido: usar `AnamnesisRepository.UpdateAsync` espec. | ✅ Resolvido  |
| P15 | F4     | Remover opção de pergunta existente pode deixar `AnamnesisOptions` órfã (sem delete do órfão no `UpdateAsync`)    | Baixo  | Backlog backend (tratar órfãos pós-MVP)                 | Aberto        |

## Decisões pendentes (precisam de você)

1. **Endereço obrigatório? (Fase 2 / P5)** — Hoje opcional por design. O prompt lista endereço como obrigatório. Recomendação: **manter opcional no MVP**. Atenção: backend `EditPatientAsync` usa `editPatientDto.AddressDto!` (non-null) — validar na Fase 10.
2. ~~**Rascunho de anamnese no MVP? (Fase 4)**~~ — ✅ **Resolvido (F4): não incluir.** Front não tem UI de rascunho; `saveDraft` é plumbing inócuo. Sem mudança de código.
3. **Status na criação de consulta (Fase 3 / P7)** — esconder o campo no modo criação? (mudança de UX, fora do escopo mínimo da F3).
4. ~~**Envio de anamnese por e-mail/WhatsApp (Fase 4)**~~ — ✅ **Resolvido (F4):** e-mail via backend; WhatsApp via `wa.me` client-side. Sem simulação.

---

## Próxima fase — Fase 5: Workspace MVP ⏳

**Objetivo:** workspace do paciente com abas reais (plano alimentar,
antropometria, anamnese) integradas; esconder o que não tem backend.

**Tarefas:**

- Abas reais: plano alimentar, antropometria, anamnese (reaproveitar os módulos já validados).
- Esconder mocks de evolução/documentos (sem backend) e botões sociais (P4).
- `GET /api/Workspace/patients` para a lista de pacientes do workspace.
- Estados loading/vazio/erro consistentes.

**Critério de aceite:** abrir workspace de um paciente → navegar abas reais sem mocks visíveis.

**Escopo de validação:** dois lados. Arquivos: `sections/workspace/*`,
`workspaceService`, hooks `use-workspace-*`. Backend: `WorkspaceController`.
Evolução/Documentos **não têm backend** → manter ocultos (backlog pós-MVP).

## Fases seguintes (resumo do plano)

- **F6 — Antropometria e gasto energético:** listagem/CRUD de avaliações; cálculo energético via backend (front não calcula TMB/TDEE); `nutritionGoal` opcional.
- **F7 — Plano alimentar:** CRUD de plano, refeições, itens, substitutos, medidas caseiras; esconder somatórios mockados de macros (`buildMockMacros`).
- **F8 — Alimentos:** aba TACO + "meus alimentos"; CRUD só para customizados; grupos alimentares.
- **F9 — Dashboard:** `/api/overview`, estados loading/vazio/erro, KPIs mínimos.
- **F10 — Homologação:** fluxo ponta a ponta; verificar P8 e decisão #1.
