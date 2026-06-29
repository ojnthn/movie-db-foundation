# Prompt — Commit, Merge e Push para Main

## Objetivo

Preparar o projeto para publicação, revisar todas as alterações, gerar um commit de qualidade e realizar o merge para a branch `main`.

A prioridade é preservar a arquitetura, manter a documentação consistente e garantir que nenhuma alteração quebre os padrões do projeto.

---

# Antes de iniciar

Leia obrigatoriamente:

1. `CONTEXT.md`
2. `.ai/manifest.md`
3. `.ai/contexts/*`
4. `.ai/template-registry.md`

Esses documentos representam a fonte de verdade do projeto.

---

# Etapa 1 — Revisão

Antes de qualquer commit:

* revisar todo o código alterado;
* verificar aderência ao SOLID;
* verificar aderência à Clean Architecture;
* verificar responsabilidades;
* verificar nomenclatura;
* verificar duplicação;
* verificar dependências desnecessárias;
* remover código morto;
* remover logs temporários;
* remover comentários temporários.

---

# Etapa 2 — Documentação

Verificar se todos os novos componentes possuem:

* README.md
* CONTEXT.md

Caso não existam:

* gerar utilizando os templates oficiais.

Nunca criar documentação manualmente.

---

# Etapa 3 — Validação

Garantir que:

* o projeto compila;
* os testes existentes passam;
* não existem arquivos temporários;
* não existem conflitos de merge;
* a documentação está sincronizada.

---

# Etapa 4 — Commit

Gerar uma mensagem de commit seguindo o padrão Conventional Commits.

Exemplos:

feat(auth): add refresh token support

fix(users): prevent duplicate email registration

refactor(logging): simplify interceptor

docs(ai): update template registry

chore(ci): update github actions

A mensagem deve refletir exatamente as alterações realizadas.

---

# Etapa 5 — Git

Executar os seguintes comandos:

```bash
git status

git add .

git commit -m "<mensagem gerada>"

git checkout main

git pull origin main

git merge -

git push origin main
```

Caso exista conflito de merge:

* interromper o processo;
* listar todos os conflitos;
* sugerir a resolução;
* nunca escolher automaticamente uma versão.

---

# Etapa 6 — Pós Merge

Após o push:

Verificar:

* branch sincronizada;
* repositório limpo;
* nenhuma alteração pendente.

---

# Etapa 7 — Resumo

Apresentar um relatório contendo:

## Alterações

* ...

## Arquivos adicionados

* ...

## Arquivos modificados

* ...

## Arquivos removidos

* ...

## Commit

feat(...): ...

## Branch

main

## Status

Merge realizado com sucesso.

---

# Regras

Nunca:

* utilizar `git push --force`;
* sobrescrever histórico;
* ignorar conflitos;
* realizar commit sem revisão;
* realizar merge sem atualizar a branch main.

Sempre:

* preservar histórico;
* utilizar Conventional Commits;
* respeitar a arquitetura;
* respeitar a documentação;
* validar o projeto antes do merge.

---

# Critério de Aceitação

O processo somente é considerado concluído quando:

* todas as verificações forem aprovadas;
* o commit estiver criado;
* o merge para `main` for concluído;
* o push para o repositório remoto for realizado com sucesso;
* o repositório estiver limpo (`git status` sem alterações pendentes).
