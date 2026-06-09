# Variáveis de ambiente — Plenton Web

> Documento de referência das variáveis de ambiente do **frontend**.
> **Nenhum valor real, segredo, token ou URL privada é versionado aqui** — apenas
> nomes, propósito e exemplos com placeholders. Os valores reais ficam em
> arquivos `.env*` locais (não versionados) e nas configurações do provedor de
> deploy.

---

## 1. Como o Vite lê variáveis de ambiente

- Apenas variáveis com o prefixo **`VITE_`** são expostas ao código do cliente
  (`import.meta.env.VITE_*`). Variáveis sem esse prefixo **não** ficam
  disponíveis no bundle.
- ⚠️ **Tudo que tem prefixo `VITE_` vai para o bundle do navegador e é público.**
  Nunca coloque segredos (chaves de API privadas, senhas, tokens de servidor)
  em variáveis `VITE_`.
- Arquivos de ambiente reconhecidos pelo Vite (raiz do projeto), em ordem de
  precedência crescente para o modo de desenvolvimento:
  - `.env`
  - `.env.local`
  - `.env.development` / `.env.production`
  - `.env.development.local` / `.env.production.local`
- Os arquivos `*.local` **não devem ser versionados** (devem estar no
  `.gitignore`).

### Estratégia adotada neste projeto

O projeto usa **apenas dois arquivos**, sem variações por modo:

| Arquivo | Versionado? | Para quê |
| --- | --- | --- |
| `.env` | ❌ Não (gitignored) | Rodar localmente. Contém `VITE_BASE_URL=http://localhost:7259`. |
| `.env.example` | ✅ Sim | Modelo versionado. Copie para `.env` (`cp .env.example .env`) e ajuste. |

Produção **não** usa arquivo `.env`: a `VITE_BASE_URL` é definida no painel de
variáveis do **Vercel** (`https://api.plenton.com.br`). Assim não há URL de
infraestrutura comitada no repositório.

---

## 2. Variáveis utilizadas

### `VITE_BASE_URL`

| Atributo | Valor |
| --- | --- |
| **Nome** | `VITE_BASE_URL` |
| **Para que serve** | URL base da API do back-end (`Plenton-Back`). Define o `baseURL` da instância axios usada por toda a camada de serviços. |
| **Obrigatória?** | Tecnicamente **opcional** (há fallback no código), mas **recomenda-se sempre definir** (no `.env` local e no Vercel) para não apontar para a URL errada. |
| **Fallback no código** | `http://localhost:5226` (se a variável não for definida) |
| **Ambiente** | **Ambos** — local via `.env`; produção via Vercel |
| **Onde é consumida** | `src/services/api/index.ts` — única referência no código |
| **Tipo / formato** | URL absoluta com esquema (`http://` ou `https://`), **sem** barra final |

Comportamento especial: se a URL contiver `ngrok-free.app`, a aplicação adiciona
automaticamente o header `ngrok-skip-browser-warning: true` em todas as
requisições (suporte a túneis ngrok em desenvolvimento). Ver
`src/services/api/index.ts`.

**Exemplos seguros (placeholders):**

```env
# Local — no arquivo .env (backend rodando localmente)
VITE_BASE_URL=http://localhost:7259

# Produção — no painel do Vercel
VITE_BASE_URL=https://api.plenton.com.br

# Túnel ngrok (opcional, em dev)
VITE_BASE_URL=https://SEU-SUBDOMINIO.ngrok-free.app
```

---

## 3. Arquivos de ambiente no repositório

| Arquivo | Versionado? | Propósito |
| --- | --- | --- |
| `.env` | ❌ Não (gitignored) | Rodar localmente. Contém `VITE_BASE_URL=http://localhost:7259`. |
| `.env.example` | ✅ Sim | Modelo versionado. Ponto de partida para criar o `.env`. |

Para começar: `cp .env.example .env` e ajuste o valor se necessário. A produção
é configurada no **Vercel** (sem arquivo `.env`). O fallback `5226` no código é
apenas rede de segurança; não se depende dele.

---

## 4. `.env.example` (versionado)

O repositório possui um `.env.example` na raiz (somente referência/placeholder,
seguro para versionar):

```env
# Modelo de variáveis de ambiente do frontend.
# Copie para `.env` e ajuste os valores: `cp .env.example .env`
#
# URL base da API do Plenton-Back. Sem barra final. Esquema http/https obrigatório.
# Em produção, esta variável é configurada no painel do Vercel.
# Fallback no código (se a variável não existir): http://localhost:5226
# (ver src/services/api/index.ts).
VITE_BASE_URL=http://localhost:7259
```

---

## 5. Auditoria de variáveis

### 5.1 Variáveis usadas no código

| Variável | Definida? | Usada no código? | Situação |
| --- | --- | --- | --- |
| `VITE_BASE_URL` | ✅ Local (`.env`) + Prod (Vercel) | ✅ Sim (`src/services/api/index.ts`) | OK — definida no `.env` local e no Vercel (ver §1 e §3) |

### 5.2 Variáveis no `.env` sem uso no código

Nenhuma. O `.env` contém somente `VITE_BASE_URL`, que é utilizada.

### 5.3 Variáveis usadas no código e ausentes do `.env` local

Nenhuma. A única variável consumida (`VITE_BASE_URL`) está presente.

> Observação: valores de domínio/contato (`siteUrl`, `contactEmail`, `appName`)
> ficam **fixos** em `src/config-global.ts`, **não** em variáveis de ambiente.
> Se no futuro precisarem variar por ambiente, devem ser migrados para `VITE_*`.

---

## 6. Boas práticas

1. Sempre defina `VITE_BASE_URL` explicitamente; não dependa do fallback.
   **(Adotado:** `.env` local + Vercel em produção.)
2. Nunca versione o `.env` com valores reais; mantenha-o no `.gitignore`.
   Versione apenas o `.env.example`.
3. Nunca coloque segredos em variáveis `VITE_*` — elas são embarcadas no bundle
   e ficam públicas.
4. Em produção (Vercel), configure `VITE_BASE_URL` (`https://api.plenton.com.br`)
   nas variáveis de ambiente do projeto, **não** em arquivo versionado. Após
   alterar, é necessário um novo deploy/build para o valor entrar no bundle.
5. Após alterar qualquer `.env`, **reinicie o dev server** (Vite só lê env na
   inicialização).
