# i18n Plenton — Próximos passos para concluir o plano

Status em 2026-06-17. Idiomas: **pt-BR (base/fallback) + en-US + es**.
Precedência de cultura na API: `Accept-Language` → claim `lang` → `pt-BR`.

---

## 1. Estado atual

### Backend (Plenton-API) — ✅ completo e verificado
- A1 Infra (`AddLocalization`, `RequestLocalization`, `ClaimCultureProvider`, `ILocalizationService`, `FallbackLocalizationService`).
- A2 `PreferredLanguage` em `PreferenceSettings` (+ migration `AddLocalizationPreferences`), endpoint `api/system-settings`, claim `lang` no login, captura no cadastro, settings para paciente.
- A3 Respostas/validações: todos os services, controllers, DataAnnotations (chaves), ModelState, `LocalizedIdentityErrorDescriber`.
- A4 E-mails por idioma + idioma no payload do outbox.
- A5 Notificações (`key + args`, idioma do destinatário).
- A6 PDFs (componentes QuestPDF + `PdfResource`).
- `.resx` pt-BR/en-US/es com **paridade total**; todas as chaves referenciadas existem.
- `dotnet test`: 347/348 (a falha `BrevoEmailSenderTests` é **pré-existente**, não é i18n).

### Frontend (Plenton-WEB) — 🟡 parcial (B5 em andamento)
- B1–B4 (fundação) ✅: `i18next`, locales `src/locales/{pt-BR,en-US,es}/common.json`, `LanguagePopover` funcional, `Accept-Language` no axios.
- B5 migrado: **auth, nav, calendar, notifications, language-popover, patient, appointment, overview, food, mealPlan, anamnesis, public-anamnesis**.
- `tsc --noEmit`: verde.

---

## 2. Pré-requisitos para subir / deploy
1. **Migration**: `dotnet ef database update` (start-up = Plenton.API). Aditiva, default `pt-BR`.
2. **WEB**: `npm install` (novas deps i18n no package.json/lock).
3. Subir em **branch + PR** (não direto na main).
4. Enquanto o B5 não estiver 100%: **esconder o seletor de idioma** (ou marcar en/es como "beta") para evitar telas mistas. pt-BR não é afetado.

---

## 3. Receita de migração de uma tela (padrão já provado)
Referência: [patient-list-view.tsx](src/sections/patient/view/patient-list-view.tsx), [meal-plan-view.tsx](src/sections/mealPlan/view/meal-plan-view.tsx).

1. `import { useTranslation } from 'react-i18next';` e `const { t } = useTranslation();` no componente.
2. Trocar literais por `t('feature.secao.chave')`.
3. Adicionar a seção no `common.json` dos **3 idiomas** (pt-BR é a fonte; en-US/es derivam). Manter paridade de chaves.
4. Casos especiais:
   - **Constantes/arrays em nível de módulo** (labels): mover para dentro do componente OU usar `labelKey` + `as const satisfies ...` e resolver com `t(field.labelKey)` (i18next tem **chaves tipadas** — `t(stringDinâmica)` não compila).
   - **Mapas value→label**: criar mapa `value → 'feature.chave'` `as const` e `t(MAP[value])`.
   - **Pluralização**: chaves `xxx_one` / `xxx_other` com `{{count}}` e `t('...', { count })`.
   - **Funções/validações fora de componente** (ex.: Yup): receber `t: TFunction` por parâmetro (ver [public-anamnesis/validation.ts](src/sections/public-anamnesis/validation.ts)).
   - **Tooltips/labels repetidos**: reutilizar `actions.*` e `common.*` do `common.json`.
5. Validar: `npx tsc --noEmit` + conferir JSON válido nos 3 locales.

---

## 4. Backlog B5 (a fazer) — por feature
Estimativa por heurística; confirme com busca por strings antes de cada lote.

- [ ] **workspace/** (~21 arquivos) — maior frente.
- [ ] **subscription/** (~4) — checkout, status, etc.
- [ ] **landing/** + **institutional/** (~13) — páginas públicas de marketing.
- [ ] **layouts/** (~16) — `dashboard/`, `auth/`, `core/`, `components/` de layout (account-popover, etc.).
- [ ] **components/** (~12) — componentes compartilhados (table toolbars, loading, confirm, etc.).
- [ ] **pages/** (~7) — títulos de página (`<title>`/headers) e `error`/404.
- [ ] **enums/** e **constants/** restantes — rótulos exibidos (mapear por chave/`labelKey`).
- [ ] **contexts/notifications-context.tsx** e toasts — preferir mensagens da API (já localizadas) com fallback local traduzido.

Comando para listar candidatos em uma pasta:
```
rg -l "\"[A-ZÀ-Ú][a-zà-ú]{2,}|'[A-ZÀ-Ú][a-zà-ú]{2,}|>[A-ZÀ-Ú][a-zà-ú]{2,}[ <]|label=|placeholder=|title=" src/sections/workspace
```

---

## 5. B6 — Formatação por locale
- [ ] Datas/números via `Intl` (ou utilitário central em `src/utils/format-time.ts` / `format-number`).
- [ ] **FullCalendar**: passar o locale ativo (já existem locales nativos pt-br/en/es em node_modules).
- [ ] Revisar `toLocaleString()` espalhados para usar o locale do i18next.

---

## 6. A7 — Termo LGPD (tradução jurídica)
- Backend: `Plenton.Application/Shared/AnamnesisConsentText.cs` está versionado (`Version = "pt-BR/1.0"`) — **só pt-BR de propósito**.
- [ ] Obter **tradução jurídica revisada por humano** para en-US e es.
- [ ] Adicionar variantes versionadas (`en-US/1.0`, `es/1.0`) e registrar, no aceite, qual idioma/versão foi exibido.
- Até lá, o termo aparece em pt-BR mesmo para en/es (aceitável e auditável).

---

## 7. Checklist de verificação final (QA)
- [ ] `Accept-Language: en-US` → respostas da API em inglês; sem header e sem preferência → pt-BR; `PreferredLanguage=es` no perfil → es.
- [ ] Trocar idioma no `LanguagePopover` → UI muda, persiste após reload (localStorage), perfil é atualizado, novas requests enviam `Accept-Language`.
- [ ] E-mail/Notificação no idioma do **destinatário** (nutricionista pt-BR convida paciente en-US → e-mail em inglês).
- [ ] PDF (plano alimentar / anamnese) em cada idioma; marca "Plenton" intacta.
- [ ] Paridade de chaves: nenhuma chave "crua" aparecendo na UI nas 3 línguas.
- [ ] `dotnet build` + `dotnet test`; `npm run build` (tsc + vite) + `npm run lint` na WEB.

---

## 8. Observações / pendências fora do escopo i18n
- **Teste `BrevoEmailSenderTests.SendAsync_ShouldSendPostRequestWithCorrectHeadersAndPayload`** já falhava antes desta iniciativa — corrigir/ajustar separadamente (não bloquear o i18n por causa dele, mas convém deixar o CI verde).
- **Marca/slogan** ("Plenton", "gestão nutricional, por completo.") mantidos no original; traduzir o slogan só se houver versão oficial.
- **Seletor de idioma**: decidir se entra como "beta" ou só após B5 100%.
