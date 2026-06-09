# Plano de Execução — Plano Alimentar no Workspace

## Objetivo
Alinhar status e integrar listagem de planos alimentares do workspace ao backend.

## Checklist de execução
- [ ] Tarefa 1: Ajustar status da listagem principal do workspace para ACTIVE/INACTIVE/SUSPENDED (0/1/2) com labels Ativo/Inativo/Suspenso.
- [ ] Tarefa 2: Ajustar coluna Status da listagem de plano alimentar do workspace com o mesmo mapeamento.
- [ ] Tarefa 3: Integrar endpoint POST /api/MealPlan/get-meal-plan-by-patient com payload padrão definido.
- [ ] Tarefa 4: Consolidar WorkspaceStatus e atualizar todos os pontos do contexto workspace.

## Contratos fechados
- Retorno do endpoint de planos: PagedResult.
- nutritionistId: authStorage.getUser()?.id.
- Filtro padrão da aba: status null/omit, dayOfWeek -1, onlyToday false.
- Toolbar principal: ocultar filtro de status nesta etapa.

## Critérios de aceite
- [ ] Status da listagem principal exibe Ativo/Inativo/Suspenso corretamente para 0/1/2.
- [ ] Status nulo não quebra UI e aparece como "-".
- [ ] Aba de planos do workspace deixa de usar mock e carrega do backend.
- [ ] Coluna Status da aba de planos usa mapeamento pt-BR correto.
- [ ] Build e lint sem erros após alterações.

## Pontos para decisão posterior
- [ ] Migrar enum global de meal-plan (`FINISHED`) para `SUSPENDED` e valores 0/1/2.
