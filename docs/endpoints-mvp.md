# Endpoints obrigatórios do backend — MVP

Mapeamento dos endpoints que o frontend consome, por domínio/fase do MVP.
Base URL configurada em `VITE_BASE_URL` (ver README). Todas as rotas
autenticadas enviam `Authorization: Bearer <token>`
(ver [src/services/api/index.ts](../src/services/api/index.ts)), e o tenant
é extraído a partir deste token pelo backend.

Coluna "Back": `OK` = controller correspondente existe em `Plenton-Back`;
`—` = não verificado/sem controller dedicado.

## Fase 1 — Autenticação (`authService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Cadastro de nutricionista | OK |
| POST | `/api/auth/login` | Login | OK |
| POST | `/api/auth/refresh` | Renovação de token (cookie httpOnly) | OK |
| POST | `/api/auth/logout` | Logout | OK |
| POST | `/api/auth/forgot-password` | Solicitar redefinição | OK |
| POST | `/api/auth/reset-password` | Redefinir senha | OK |
| POST | `/api/auth/change-password` | Trocar senha no perfil | OK |
| GET  | `/api/auth/profile` | Perfil do usuário logado | OK |

## Fase 2 — Pacientes (`patientService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/patient/get-all-patients` | Listagem/paginação | OK |
| GET  | `/api/patient/{id}` | Detalhe | OK |
| POST | `/api/patient/create-patient` | Criar | OK |
| PUT  | `/api/patient/{id}` | Editar | OK |
| DELETE | `/api/patient/{id}` | Excluir | OK |

## Fase 3 — Agenda / Consultas (`appointmentService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/appointment/get-events` | Eventos do calendário | OK |
| GET  | `/api/appointment/{id}` | Detalhe da consulta | OK |
| POST | `/api/appointment/create-schedule` | Criar consulta | OK |
| PUT  | `/api/appointment/{id}` | Editar/mover (drag&drop) | OK |
| DELETE | `/api/appointment/{id}` | Excluir | OK |

## Fase 4 — Anamnese (`anamnesisService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/anamnesis/get-all-anamnesis` | Listagem de templates | OK |
| GET  | `/api/anamnesis/{id}` | Detalhe do template | OK |
| POST | `/api/anamnesis` | Criar template | OK |
| PUT  | `/api/anamnesis/{id}` | Editar template | OK |
| DELETE | `/api/anamnesis/{id}` | Excluir template | OK |
| POST | `/api/anamnesis/{id}/send-public` | Gerar link público | OK |
| POST | `/api/anamnesis/{id}/send-public-email` | Enviar por e-mail | OK |
| GET  | `/api/anamnesis/by-patient/{patientId}` | Anamneses do paciente | OK |
| GET  | `/api/anamnesis/responses/{responseId}` | Detalhe da resposta | OK |

### Anamnese pública (`publicAnamnesisService.ts`) — sem auth

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/public/{tenantId}/anamnesis/{token}` | Carregar formulário | OK |
| POST | `/api/public/{tenantId}/anamnesis/{token}/consent` | Consentimento | OK |
| POST | `/api/public/{tenantId}/anamnesis/{token}/answers` | Salvar respostas | OK |
| POST | `/api/public/{tenantId}/anamnesis/{token}/submit` | Submissão final | OK |

## Fase 5 — Workspace (`workspaceService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/Workspace/patients` | Lista de pacientes do workspace | OK |

> Abas `evolução` e `documentos` **não têm endpoint** no backend (sem
> controller). Mantidas ocultas no MVP — ver decisão na análise de fases.

## Fase 6 — Antropometria e gasto energético (`workspaceAnthropometryService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/patient/{patientId}/evaluations` | Listar avaliações | OK |
| GET  | `/api/patient/{patientId}/evaluations/{evaluationId}` | Detalhe | OK |
| POST | `/api/patient/{patientId}/evaluations` | Criar avaliação | OK |
| PUT  | `/api/patient/{patientId}/evaluations/{evaluationId}` | Editar | OK |
| POST | `/api/patient/{patientId}/evaluations/calculate-energy` | Cálculo TMB/TDEE (backend) | OK |

## Fase 7 — Plano alimentar (`mealPlanService.ts`, `homemadeMeasureService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/MealPlan/get-meal-plan-by-patient-paged` | Planos por paciente | OK |
| GET  | `/api/MealPlan/get-meal-plan/{id}` | Detalhe do plano | OK |
| POST | `/api/MealPlan/create-meal-plan` | Criar plano | OK |
| POST | `/api/MealPlan/edit-meal-plan` | Editar plano | OK |
| GET  | `/api/homemade-measures` | Listar medidas caseiras | OK |
| POST | `/api/homemade-measures` | Criar medida caseira | OK |

## Fase 8 — Alimentos (`foodService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/Food/by-table` | Listagem (TACO) | OK |
| GET  | `/api/Food/search` | Busca de alimentos | OK |
| GET  | `/api/Food/{id}` | Detalhe | OK |
| POST | `/api/Food` | Criar alimento customizado | OK |
| PUT  | `/api/Food/{id}` | Editar customizado | OK |
| DELETE | `/api/Food/{id}` | Excluir customizado | OK |
| GET  | `/api/food-groups` | Grupos alimentares | OK |

## Fase 9 — Dashboard (`overviewService.ts`)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/overview` | KPIs do dashboard | OK |

## Suporte (perfil / configurações)

| Método | Rota | Uso | Back |
| --- | --- | --- | --- |
| GET  | `/api/nutritionist/get-by-userId/{userId}` | Dados do nutricionista | OK |
| PUT  | `/api/Nutritionist/edit` | Editar nutricionista | OK |
| GET  | `/api/system-settings?userId={userId}` | Configurações do usuário | OK |
| PUT  | `/api/system-settings` | Salvar configurações | OK |

---

## Riscos / observações

1. **Inconsistência de casing nas rotas**: o frontend mistura
   `/api/Workspace`, `/api/Food`, `/api/MealPlan`, `/api/Nutritionist`
   (PascalCase) com `/api/patient`, `/api/auth`, `/api/anamnesis`,
   `/api/system-settings` (lowercase). O roteamento do ASP.NET Core é
   case-insensitive por padrão, então funciona, mas convém padronizar para
   evitar problemas com proxies/CDN sensíveis a caixa.
2. **Sem endpoints de evolução e documentos** — confirmar no backlog
   pós-MVP (fases dedicadas, back + front).
3. **`nutritionistId` (Fase 2)**: confirmar no backend se o vínculo usa
   `user.id` ou `user.profile.id` antes de validar o CRUD de pacientes.
