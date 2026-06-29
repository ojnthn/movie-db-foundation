# CONTEXT — {NomeInterceptor}

## Responsabilidade

`{NomeInterceptor}` observa o fluxo de execução de {todas as rotas / rotas específicas} para {finalidade — ex: logar tempo de resposta, transformar output}.

---

## Escopo

### Dentro do escopo

- {Ação de observação ou transformação no fluxo de requisição/resposta}

### Fora do escopo

- Lógica de negócio — interceptors são transversais e sem domínio
- Autenticação ou autorização — responsabilidade de guards
- Tratamento de exceções — responsabilidade do `GlobalExceptionFilter`

---

## Limites

- Não acessa banco de dados ou serviços externos
- Não lança exceções
- Nunca loga dados sensíveis: tokens JWT, hashes de senha, body completo da requisição
- Efeitos colaterais permitidos: logs, métricas — sem alterar estado de negócio

---

## Regras Obrigatórias

- Registrado globalmente via `APP_INTERCEPTOR` em `AppModule`
- Usa `tap` (rxjs) para observar sem alterar o fluxo da resposta
- Instancia `Logger` com o nome da própria classe: `new Logger({NomeInterceptor}.name)`
- Formato de log: `{METHOD} /{path} — {Xms}`

---

## O que é Proibido

- Logar corpo da requisição ou da resposta (pode conter dados pessoais)
- Logar headers `Authorization` ou qualquer token
- Lançar exceções dentro do interceptor
- Modificar o valor da resposta (use `map` apenas se explicitamente necessário e documentado)
- Acessar repositórios, use cases ou serviços

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `Logger` (NestJS) | Log estruturado |
| `Observable`, `tap` (rxjs) | Observação do fluxo sem alteração |
| `ExecutionContext` | Acesso ao contexto HTTP |
| `@nestjs/common` | `Injectable`, `NestInterceptor`, `CallHandler` |

---

## Dependências Proibidas

- Repositórios, use cases, services
- `@prisma/client`
- Qualquer lib de negócio ou de módulo específico

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Interceptor | `shared/interceptors/{nome}/{nome}.interceptor.ts` | `{Nome}Interceptor` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `AppModule` | Registra via `APP_INTERCEPTOR` |
| `GlobalExceptionFilter` | Captura exceções lançadas pelo handler — interceptor não interfere nisso |
| Todos os controllers | Interceptor observa toda requisição que passa por eles |

---

## Evolução Futura

- Se necessário transformar o corpo da resposta globalmente, adicionar operador `map` — documentar o motivo
- {Extensão prevista}
