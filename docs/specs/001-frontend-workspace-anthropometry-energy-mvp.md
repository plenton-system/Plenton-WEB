# Spec 001 — Frontend do Workspace de Antropometria + Gasto Energético

**Versão:** 1.0  
**Status:** Proposta  
**Módulo:** Workspace / Anthropometry  
**Dependências:** Backend spec correspondente no projeto `Plenton`

---

## 1. Objetivo

Implementar no frontend do workspace:

- listagem real de avaliações antropométricas;
- detalhe/edição real de avaliação;
- bloco separado de gasto energético;
- cálculo on-the-fly via backend;
- envio unificado do formulário para salvar avaliação e bloco energético.

Importante:

- `AnthropometricEvaluation` e `NutritionGoal` aparecem **juntos na tela**;
- mas o front deve tratá-los como **blocos diferentes de estado e renderização**.
- campos como `% de gordura`, massa magra e massa gorda são apenas exibidos/editados como dados antropométricos;
- o front não deve calcular composição corporal;
- o único cálculo desta entrega é o de gasto energético, sempre delegado ao backend.
- `BodyFatPercentage`, `LeanMass` e `FatMass` são opcionais e não devem bloquear o fluxo.

---

## 2. Estado atual

Arquivos atuais relevantes:

- `src/sections/workspace/components/form-tabs/workspace-anthropometry-tab.tsx`
- `src/sections/workspace/components/form-tabs/workspace-anthropometry-detail-drawer.tsx`
- `src/services/workspace/workspaceAnthropometryService.ts`
- `src/hooks/workspace/use-workspace-anthropometries.ts`
- `src/types/domain/workspace.ts`

Situação atual:

- listagem mockada;
- drawer sem persistência;
- ausência de bloco real de gasto energético;
- ausência de separação adequada entre tipo de listagem, tipo de detalhe e tipo de request.

---

## 3. Direção de UX

O usuário deve conseguir:

1. abrir a aba de antropometria;
2. ver uma lista resumida de avaliações;
3. criar nova avaliação;
4. editar avaliação existente;
5. preencher antropometria;
6. calcular gasto energético sem salvar imediatamente;
7. salvar tudo em uma única ação;
8. reabrir a avaliação com o cálculo persistido.

---

## 4. Contratos consumidos do backend

### 4.1 Listagem

#### `GET /api/patient/{patientId}/evaluations`

**JSON de retorno**
```json
{
  "data": [
    {
      "id": "0a5a2ee4-89b5-49de-a414-0a7f4d2c8db0",
      "evaluationDateUtc": "2026-05-12T14:00:00Z",
      "weight": 72.4,
      "height": 1.7,
      "bmi": 25.05,
      "bodyFatPercentage": 23.5,
      "leanMass": 55.4,
      "abdominalCircumference": 86.0,
      "hipCircumference": 94.0,
      "whr": 0.91,
      "hasNutritionGoal": true,
      "energyProtocol": "MifflinStJeor",
      "tdeeKcal": 2557.5,
      "createdAt": "2026-05-12T14:00:00Z"
    }
  ],
  "isSuccess": true,
  "message": null,
  "messages": [],
  "status": 200
}
```

Uso no front:

- alimentar a tabela do workspace;
- exibir dados resumidos;
- opcionalmente mostrar badge de protocolo e `TDEE`.

### 4.2 Detalhe

#### `GET /api/patient/{patientId}/evaluations/{evaluationId}`

**JSON de retorno**
```json
{
  "data": {
    "id": "0a5a2ee4-89b5-49de-a414-0a7f4d2c8db0",
    "patientId": "f96f0d3e-d15b-46e3-9b8e-88f16f5b595e",
    "evaluationDateUtc": "2026-05-12T14:00:00Z",
    "weight": 72.4,
    "height": 1.7,
    "bmi": 25.05,
    "bodyFatPercentage": 23.5,
    "musclePercentage": 35.2,
    "abdominalCircumference": 86.0,
    "hipCircumference": 94.0,
    "whr": 0.91,
    "leanMass": 55.4,
    "fatMass": 17.0,
    "notes": "Leve retenção. Manter hidratação.",
    "nutritionGoal": {
      "id": "6a1cd4b6-f278-4264-a520-0da56d1d06be",
      "protocol": "MifflinStJeor",
      "activityFactor": 1.55,
      "tmbKcal": 1650.0,
      "tdeeKcal": 2557.5,
      "calculatedAtUtc": "2026-05-12T14:01:10Z"
    },
    "createdAt": "2026-05-12T14:00:00Z",
    "updatedAt": "2026-05-12T14:01:10Z"
  },
  "isSuccess": true,
  "message": null,
  "messages": [],
  "status": 200
}
```

Uso no front:

- preencher o drawer de edição;
- preencher o bloco energético com cálculo salvo;
- manter separação de estado entre antropometria e resultado energético.

### 4.3 Cálculo temporário

#### `POST /api/patient/{patientId}/evaluations/calculate-energy`

**JSON enviado**
```json
{
  "weight": 72.4,
  "height": 1.7,
  "ageYears": 30,
  "gender": "Male",
  "protocol": "MifflinStJeor",
  "activityFactor": 1.55
}
```

**JSON de retorno**
```json
{
  "data": {
    "protocol": "MifflinStJeor",
    "weight": 72.4,
    "height": 1.7,
    "ageYears": 30,
    "gender": "Male",
    "activityFactor": 1.55,
    "tmbKcal": 1650.0,
    "tdeeKcal": 2557.5
  },
  "isSuccess": true,
  "message": null,
  "messages": [],
  "status": 200
}
```

Uso no front:

- cálculo on-the-fly;
- exibição temporária;
- não persistir diretamente esse retorno.

### 4.4 Criação

#### `POST /api/patient/{patientId}/evaluations`

**JSON enviado**
```json
{
  "evaluationDateUtc": "2026-05-12T14:00:00Z",
  "weight": 72.4,
  "height": 1.7,
  "bodyFatPercentage": 23.5,
  "musclePercentage": 35.2,
  "abdominalCircumference": 86.0,
  "hipCircumference": 94.0,
  "whr": 0.91,
  "leanMass": 55.4,
  "fatMass": 17.0,
  "notes": "Leve retenção. Manter hidratação.",
  "nutritionGoal": {
    "protocol": "MifflinStJeor",
    "activityFactor": 1.55
  }
}
```

### 4.5 Atualização

#### `PUT /api/patient/{patientId}/evaluations/{evaluationId}`

**JSON enviado**
```json
{
  "evaluationDateUtc": "2026-05-13T09:30:00Z",
  "weight": 71.8,
  "height": 1.7,
  "bodyFatPercentage": 22.9,
  "musclePercentage": 35.6,
  "abdominalCircumference": 85.0,
  "hipCircumference": 93.5,
  "whr": 0.91,
  "leanMass": 55.4,
  "fatMass": 16.4,
  "notes": "Boa evolução clínica.",
  "nutritionGoal": {
    "protocol": "HarrisBenedict",
    "activityFactor": 1.55
  }
}
```

---

## 5. Componentização obrigatória

Evitar um drawer monolítico com formulário, regra de cálculo, requests e renderização misturados.

Estrutura sugerida:

- `WorkspaceAnthropometryTab`
- `WorkspaceAnthropometryDetailDrawer`
- `AnthropometryFormSection`
- `EnergyExpenditureSection`
- `EnergyExpenditureResultCard`

---

## 6. Tipos TypeScript

### 6.1 Listagem

```ts
export type WorkspaceAnthropometryListItem = {
  id: string;
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  leanMass?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  whr?: number | null;
  hasNutritionGoal: boolean;
  energyProtocol?: 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms' | null;
  tdeeKcal?: number | null;
  createdAt: string;
};
```

### 6.2 Detalhe

```ts
export type WorkspaceAnthropometryDetail = {
  id: string;
  patientId: string;
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  whr?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  notes?: string | null;
  nutritionGoal?: {
    id: string;
    protocol: 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms';
    activityFactor: number;
    tmbKcal: number;
    tdeeKcal: number;
    calculatedAtUtc: string;
  } | null;
  createdAt: string;
  updatedAt?: string | null;
};
```

### 6.3 Request de save

```ts
export type SaveAnthropometryRequest = {
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  whr?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  notes?: string | null;
  nutritionGoal?: {
    protocol: 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms';
    activityFactor: number;
  } | null;
};
```

### 6.4 Request de cálculo

```ts
export type CalculateEnergyRequest = {
  weight: number;
  height: number;
  ageYears: number;
  gender: 'Male' | 'Female';
  protocol: 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms';
  activityFactor: number;
};
```

### 6.5 Resultado temporário do cálculo

```ts
export type EnergyCalculationResult = {
  protocol: 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms';
  weight: number;
  height: number;
  ageYears: number;
  gender: 'Male' | 'Female';
  activityFactor: number;
  tmbKcal: number;
  tdeeKcal: number;
};
```

---

## 7. Serviços e hooks

### 7.1 Service

`workspaceAnthropometryService`

Métodos esperados:

- `getAll(patientId)`
- `getById(patientId, evaluationId)`
- `getLatest(patientId)`
- `create(patientId, dto)`
- `update(patientId, evaluationId, dto)`
- `calculateEnergy(patientId, dto)`

### 7.2 Hooks sugeridos

- `useWorkspaceAnthropometries(patientId)`
- `useWorkspaceAnthropometryDetail(patientId, evaluationId, open)`
- `useEnergyExpenditureCalculation(patientId)`

---

## 8. Regras de implementação no front

- não duplicar fórmulas de cálculo em TypeScript;
- não persistir `TmbKcal` e `TdeeKcal` manualmente;
- não calcular `% de gordura`, massa magra ou massa gorda no browser;
- tratar `nutritionGoal` como bloco opcional;
- tratar `BodyFatPercentage`, `LeanMass` e `FatMass` como campos opcionais;
- usar tipos separados para listagem, detalhe, request de save e cálculo;
- separar estado de formulário clínico do estado de cálculo temporário;
- ao abrir edição, popular o bloco energético a partir de `nutritionGoal` persistido;
- ao recalcular, atualizar apenas o estado temporário até o save;
- ao salvar com sucesso, usar a resposta do backend como fonte de verdade.

---

## 9. Fluxos de tela

### 9.1 Novo registro

1. usuário abre drawer;
2. preenche antropometria;
3. opcionalmente preenche protocolo e fator de atividade;
4. clica em `Calcular`;
5. front chama `POST /calculate-energy`;
6. renderiza `TMB/TDEE`;
7. usuário clica em `Salvar`;
8. front chama `POST /evaluations`.

### 9.2 Edição

1. usuário abre item existente;
2. front chama `GET /evaluations/{id}`;
3. popula formulário e bloco energético;
4. usuário altera dados;
5. se necessário, recalcula;
6. front chama `PUT /evaluations/{id}`.

---

## 10. Fora do escopo

- histórico visual de múltiplos cálculos por avaliação;
- gráfico de evolução de gasto energético;
- edição manual do valor de `TMB/TDEE`;
- cálculos locais no browser;
- cálculo de `% de gordura` por protocolos antropométricos;
- PDF;
- macros, água e fibras.

---

## 11. Testes obrigatórios

- render da lista vazia;
- render da lista com cálculo salvo;
- abertura de detalhe sem `nutritionGoal`;
- abertura de detalhe com `nutritionGoal`;
- cálculo temporário bem-sucedido;
- save de novo registro;
- update de registro existente;
- componentização preservada sem concentrar tudo no drawer.

---

## 12. Critérios de aceite

| # | Critério |
|---|---|
| CA-S001-FE-001 | A listagem de antropometria consome dados reais do backend. |
| CA-S001-FE-002 | O detalhe da avaliação exibe o bloco energético quando houver `nutritionGoal`. |
| CA-S001-FE-003 | O cálculo energético pode ser feito sem persistir a avaliação. |
| CA-S001-FE-004 | O save envia um payload único com avaliação e bloco energético opcional. |
| CA-S001-FE-005 | A implementação é componentizada e não concentra toda a lógica em um único componente. |
