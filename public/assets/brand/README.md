# Plenton — Brand assets

> **Plenton** — _gestão nutricional, por completo._

Identidade visual do Plenton (ícone "P1 clássico": anel de plenitude + ponto + folha).

## Nome e slogan
- **Nome:** Plenton
- **Slogan principal:** _gestão nutricional, por completo._
- **Alternativos:**
  - _Tudo o que sua clínica de nutrição precisa, num só lugar._
  - _Plenton — mais tempo para cuidar, menos para gerenciar._

## Arquivos
| Arquivo | Uso |
|---|---|
| `plenton-icon.svg` | Ícone principal (app/loja), 512×512, fundo gradiente |
| `plenton-icon-dark.svg` | Ícone para UI escura (fundo quase-preto, anel claro) |
| `plenton-icon-mono.svg` | Monocromático (usa `currentColor`) — 1 cor, fundo transparente |
| `plenton-logo.svg` | Lockup horizontal (marca + wordmark) p/ fundo claro |
| `plenton-logo-dark.svg` | Lockup horizontal p/ fundo escuro |
| `plenton-favicon.svg` | Favicon simplificado (traços grossos, legível a 16–32px) |

## Paleta
- Teal `#0F766E`
- Verde `#22C55E`
- Menta (folha) `#BBF7D0`
- Texto wordmark `#0E2E2A`
- Fundo dark `#0B1F1C`

## Tipografia
Wordmark em **Poppins 700** (fallback: Montserrat / Segoe UI). Para renderização
idêntica em qualquer ambiente, converta o texto em curvas/outline no editor antes
de exportar.

## Observações
- O ícone monocromático usa `currentColor`: ao usar inline no React/HTML, a cor segue
  o `color` do CSS (default `#0F766E`).
- Para gerar PNG/ICO a partir dos SVGs (favicon, lojas de app), ver instruções no chat.
