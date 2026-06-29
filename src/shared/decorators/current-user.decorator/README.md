# @CurrentUser

## Objetivo

Extrair o payload do JWT (`JwtPayload`) de `request.user` e injetá-lo diretamente no parâmetro do método do controller.

---

## Responsabilidades

- Acessar `request.user` (preenchido pelo `JwtStrategy` após validação do token)
- Retornar `JwtPayload: { sub: string; email: string }`
- Eliminar acesso direto a `request.user` nos controllers

---

## Fluxo

```
Request autenticada → JwtStrategy.validate() → request.user = JwtPayload
                   → @CurrentUser() → extrai request.user → parâmetro do método
```

---

## Tipo retornado

```typescript
export interface JwtPayload {
  sub: string;   // UUID do usuário autenticado
  email: string; // email do usuário autenticado
}
```

---

## Como Utilizar

### Em controller de rota protegida

```typescript
@Get('perfil')
async perfil(@CurrentUser() user: JwtPayload) {
  // user.sub   → UUID do usuário
  // user.email → email do usuário
  return this.getProfileUseCase.execute({ userId: user.sub });
}
```

---

## Exemplos

### Extrair ID do usuário para use case

```typescript
@Get('historico')
async historico(@CurrentUser() user: JwtPayload) {
  return this.getHistoricoUseCase.execute({ userId: user.sub });
}
```

### Combinar com @Body()

```typescript
@Post('avaliacao')
async avaliar(
  @Body() dto: AvaliacaoDto,
  @CurrentUser() user: JwtPayload,
) {
  return this.avaliarUseCase.execute({ ...dto, userId: user.sub });
}
```

---

## Observações

- Funciona **apenas em rotas protegidas** — em rotas públicas (`@Public()`), `request.user` é `undefined`
- Nunca acessar `request.user` diretamente no controller — sempre usar `@CurrentUser()`
- `JwtPayload` é definido e exportado neste mesmo arquivo (`current-user.decorator.ts`)

> **Inconsistência atual:** o arquivo `current-user.decorator.ts` está em `shared/decorators/` (não na subpasta `current-user.decorator/`). A estrutura documentada requer a subpasta. Mover quando conveniente.
