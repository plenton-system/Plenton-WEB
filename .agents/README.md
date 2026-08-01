# Plenton Web agent team

Este diretório define os agentes especializados no frontend do Plenton.

## Agentes

- `frontend-techlead-agent`: orquestra demanda, arquitetura, implementação, revisão e fechamento.
- `frontend-dev-agent`: implementa React/TypeScript com os padrões existentes do projeto.
- `frontend-reviewer-agent`: revisa comportamento, UX, acessibilidade, segurança e qualidade.

## Fluxo recomendado

1. O tech lead lê demanda, OpenSpec, worktree e padrões existentes.
2. Define critérios de aceite e delega a implementação ao dev.
3. O dev implementa e devolve arquivos alterados e evidências.
4. O tech lead inspeciona o resultado e chama o reviewer.
5. O reviewer classifica achados como `blocker`, `major`, `minor` ou `note`.
6. O dev corrige bloqueadores delegados; o reviewer revalida.
7. O tech lead fecha com validações, riscos, limitações e status da spec.

## Skills Codex

- `.codex/skills/frontend-techlead-agent/SKILL.md`
- `.codex/skills/frontend-dev-agent/SKILL.md`
- `.codex/skills/frontend-reviewer-agent/SKILL.md`

Exemplo:

```text
Use $frontend-techlead-agent com $openspec-apply-change na change <nome>.
```

Uma demanda só está pronta com aderência aos critérios, estados de UI avaliados, build e verificações estáticas executados (ou impossibilidade justificada), revisão de acessibilidade/responsividade e lacunas de testes declaradas.

Commit, push, instalação de dependências e deploy não são implícitos.
