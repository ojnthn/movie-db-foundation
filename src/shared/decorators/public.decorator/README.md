# @Public

## Objetivo

Marcar uma rota como pública, isentando-a da verificação do `JwtAuthGuard` global.

---

## Responsabilidades

- Adicionar metadado `isPublic: true` ao handler ou classe via `SetMetadata`
- Permitir que o `JwtAuthGuard` identifique e libere rotas públicas sem verificar token

---

## Fluxo

```
@Public() na rota → SetMetadata('isPublic', true)
    → JwtAuthGuard.canActivate()
    → Reflector.getAllAndOverride('isPublic', [handler, class])
    → [true]  → retorna true (libera sem validar token)
    → [false] → super.canActivate() (valida JWT normalmente)
```

---

## Metadado produzido

| Chave | Valor | Consumido por |
|---|---|---|
| `IS_PUBLIC_KEY` (`'isPublic'`) | `true` | `JwtAuthGuard` |

---

## Como Utilizar

### Em método de controller

```typescript
import { Public } from '../../../../shared/decorators/public.decorator';

@Public()
@Post()
@HttpCode(HttpStatus.OK)
async login(@Body() dto: AuthDto) {
  return this.authUseCase.execute(dto);
}
```

### Em classe inteira (todas as rotas do controller)

```typescript
@Public()
@Controller('health')
export class HealthController { ... }
```

---

## Exemplos

### Rotas que usam @Public() no projeto

```typescript
// auth.controller.ts
@Public()
@Post()
async login(@Body() dto: AuthDto) { ... }   // POST /auth

@Public()
@Post('register')
async register(@Body() dto: RegisterDto) { ... }  // POST /auth/register
```

---

## Observações

- O padrão é **todas as rotas protegidas** — `@Public()` é a exceção explícita
- Nunca usar `@Public()` em rotas que retornam dados sensíveis do usuário
- `IS_PUBLIC_KEY` é exportado para uso pelo `JwtAuthGuard` — não redefinir em outros arquivos

> **Inconsistência atual:** o arquivo `public.decorator.ts` está em `shared/decorators/` (não na subpasta `public.decorator/`). A estrutura documentada requer a subpasta.
