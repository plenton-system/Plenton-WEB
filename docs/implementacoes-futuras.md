## Futuras implementações
### 1. Agenda/Agendamento
   - Criar legendas para facilitar a visualização.

### 2. Plano Alimentar
   - Criar tela para mostrar dados completos de macro/micronutrientes.
   - Criar tela para criação de cardápios/plano alimentar modelos.

### 3. Refatorar classes relacionadas aos alimentos *(implementado)*
   - Criar uma classe para macronutrientes, terá FK classe Food, cardinalidade 1 para n
        - membros da classe:
           - Carboidratos (g)
           - Proteínas (g)
           - Gorduras (lipídios) (g)
   - Criar uma classe para micronutrientes, terá FK classe Food, cardinalidade 1 para n
        - membros da classe:
           - Açucar (g)
           - Vitamina A (mcg) 
           - Vitamina C (mcg)
           - Vitamina D (mcg)
           - Vitamina E (mcg)
           - Vitamina K (mcg)
           - B1 (tiamina) (mg)
           - B2 (riboflavina) (mg)
           - B3 (niacina) (mg)
           - B5 (ácido pantotênico) (mg)
           - B6 (piridoxina) (mg)
           - B7 (biotina) (mg)
           - B9 (folato/ácido fólico) (mg)
           - B12 (cobalamina) (mg)
           - Cálcio (mg)
           - Fósforo (mg)
           - Magnésio (mg)
           - Sódio (mg)
           - Potássio (mg)
           - Ferro (mg)
           - Zinco (mg)
           - Cobre (mg)
           - Manganês (mg)
           - Selênio (mcg)
           - Colesterol (mg)
      - Ajustar a IFoodRepository para atender esses novos campos
      - Criar configuração para IEntityConfiguration

### 4. Refatoração e incremento na rotina de alimentos *(backend em andamento)*
1. Criar um tela de CRUD para criar seus próprios alimentos, seguindo padrão das outras telas desenvolvidas
   1. Tela de listagem com busca e filtros, nessa tela precisa ter a representação em "abas" igual a de paciente e workspace, onde mostra os cadastros: Meus alimentos, TACO, IBGE e etc. Por enquanto implementar somente para Meus alimentos e TACO
   2. Tela de criação/edição, os ampos irão ser representados pelas classes de alimentos, grupo, macro, micro e medidas caseiras
   
2. Cria CRUD no backend:
   1. criar enum para o TableType: TACO, IBGE e CUSTOM
   2. refatorar interface e class IRepositoryBase<MealPlan> para herdar de IRepositoryBase
   3. criar dtos para inputs e modelViews para retorno ao front-end
   4. ajustar método existente de buscar com filtro SearchByDescriptionAsync da classe FoodService, com os tipos esperado igual ao enum de TableType: TACO, IBGE e etc... > obs: tableType padrão será custom e esperar o tenantId como parâmetro
   5. criar o restante dos métodos de crud, atenção: só pode apagar dados com TableType CUSTOM e ser o dono do cadastro controlado por TenantId  
   6. criar todos os endpoints para atender a demanda.
   7. documente os métodos conforme o padrão adotado no sistema.
   8. Homologar migração para converter TableType string existente para os valores do enum.
   9. Não tratei medidas caseiras além do DTO (não havia navegação/repo para persistir junto); se precisar persistir, seguimos no próximo passo.
   ```obs: incrementar a service IFoodService```
   ```esse depende da tarefa 3```

### 5. Feature receita culinária
1. classe receita:
   - membros da classe irá herdar de Entity:
      - título(nome)
      - porções
      - modo de preparo (texto livre)
      - tags
2. classe ingredientes
   - membros da classe:
      - descrição
      - proteína (g)
      - carboidrato (g)
      - lipídeos (g)
      - calorias 
      - quantidade
      - fk com a classe receita	

3. Criar um CRUD para criação de receitas culinárias
   1. Tela de listagem com busca e filtros
   2. Tela de criação/edição
```obs: depende da implementação anterior: 1 e 2```

### 6. Feauture planner nutricionista
   1. classe PlannerTask
      - membros da classe e irá herder de Entity:
         - Título/assunto da tarefa (string)
         - Descrição (texto)
         - PacienteId (guid/null) — FK opcional
         - Data de início (datetime/null)
         - Prazo (datetime/null)
         - Status (enum: A_Fazer, Em_Andamento, Concluido, Bloqueado)
         - Prioridade (enum: Baixa, Media, Alta)
         - Tags (lista<string>)
         - Lembrete (datetime/null)
         - Checklist (lista<ChecklistItem>)
         - Anexos (lista<Anexo>)
         - Ordem (int)
         - CriadoEm / AtualizadoEm (datetime)
   2. Tela com forma de to do list
   3. Tela de criação/edição

4. Criar CRUD para criação de prontuário para receitar medicamentos/suplementos e etc...
   1. Definir campos
   2. Tela de listagem com busca e filtros
   3. Tela de criação/edição
