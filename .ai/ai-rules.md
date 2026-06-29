# Regras para IA

## Antes de gerar código

Sempre considere todas as regras dos arquivos presentes em `.ai/contexts`.

Nunca invente uma arquitetura diferente da documentada.

Se existir dúvida, mantenha o padrão já utilizado no projeto.

---

## Ao criar código

- Não altere arquivos não solicitados.
- Não renomeie classes existentes.
- Não remova comentários.
- Não mude contratos públicos.
- Não crie dependências desnecessárias.
- Não utilize bibliotecas sem justificativa.

---

## Ao criar novos módulos

Sempre siga esta estrutura:

modules/
    └── {MODULE-NAME}/
        ├── CONTEXT.md             # contexto do módulo (regras, use cases, fluxo) para IA
        ├── README.md              # Explicar o módulo, como ele funciona e como usá-lo para um desenvolvedor humano
        ├── domain/
        │   ├── entities/          # user.entity.ts
        │   ├── repositories/      # user.repository.interface.ts
        │   └── value-objects/     # email.vo.ts, password.vo.ts
        ├── application/
        │   ├── use-cases/         # {MODULE-NAME}.use-case.ts, register.use-case.ts
        │   └── dtos/              # {MODULE-NAME}.dto.ts, register.dto.ts
        ├── infrastructure/
        │   ├── repositories/      # prisma-user.repository.ts
        │   ├── guards/            # jwt-auth.guard.ts
        │   └── strategies/        # jwt.strategy.ts
        ├── presentation/
        │   └── controllers/       # {MODULE-NAME}.controller.ts
        └── {MODULE-NAME}.module.ts

## Antes de finalizar

Verifique:

- O código compila?
- Está seguindo Clean Architecture?
- Há duplicação de código?
- Todos os nomes seguem o padrão?
- O código está consistente com o restante do projeto?