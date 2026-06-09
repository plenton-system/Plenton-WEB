# Planejamento Refactor Workspace Meal Plan

## Objetivo
- Tornar a listagem de meal plan um componente compartilhável.
- Remover acoplamento de `mealPlan` com tipos de `workspace`.
- Manter o comportamento atual do Workspace sem regressão.

## Arquitetura adotada
- `mealPlan` passa a ser o domínio de UI compartilhada.
- `workspace` permanece como container/adaptador de dados.
- Extensão é feita por props mínimas no componente compartilhado.

## Contratos criados
- `src/sections/mealPlan/types/meal-plan-list.ts`
  - `MealPlanUiStatus`
  - `MealPlanListItemVM`
  - `MealPlanSortKey`
  - `MealPlanSortState`
  - `MealPlanDrawerModel`

## Componentes
- `src/sections/mealPlan/components/meal-plan-list-card.tsx`
  - API mínima:
    - `title?`
    - `createLabel?`
    - `items`
    - `loading`
    - `error`
    - `sortState?`
    - `defaultSortState?`
    - `onSortChange?`
    - `onCreate`
    - `onEdit`
    - `onRetry?`
    - `headerActions?`
    - `renderStatus?`
    - `renderRowActions?`

- `src/sections/mealPlan/components/meal-plan-detail-drawer.tsx`
  - `plan` desacoplado para `MealPlanDrawerModel | null`.
  - Extensões adicionadas:
    - `onSubmit?`
    - `headerActionsSlot?`
    - `rightPanelSlot?`

## Adapter
- `src/sections/workspace/adapters/workspace-meal-plan-adapter.ts`
  - `toMealPlanListItemVM(workspaceItem)`
  - `toMealPlanDrawerModel(workspaceItem)`

## Integração no Workspace
- `src/sections/workspace/components/form-tabs/workspace-meal-plan-tab.tsx`
  - passa a ser container fino:
    - busca dados via `useWorkspacePlans`
    - mapeia via adapter
    - renderiza `MealPlanListCard`
    - abre `MealPlanDetailDrawer`
  - mantém status e cores via utilitários de `workspace`.

## Escopo fora desta entrega
- Anamnese.
- Mudança de endpoint backend.
- Migração ampla de enums fora do fluxo atual.

## Checklist de validação
- [ ] Lista de meal plan no workspace carrega normalmente.
- [ ] Ordenação de colunas segue funcional.
- [ ] Fluxo de novo/editar continua abrindo drawer.
- [ ] Salvar continua disparando `refetch`.
- [ ] `mealPlan` não depende de tipo de `workspace`.
- [ ] `npm run lint` sem novos erros.
- [ ] `npm run build` concluindo com sucesso.
