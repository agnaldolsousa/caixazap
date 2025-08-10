# 📲 Caixazap – Gestão de Caixa via WhatsApp

## ✅ Status
Em desenvolvimento – interface base criada, tela de entradas funcionando, rotas de saídas em construção, layout em progresso.

---

## 🎯 Objetivo
Facilitar a **gestão financeira de pequenos negócios** pelo WhatsApp. O usuário registra entradas e saídas sem precisar de planilhas ou sistemas complicados.

---

## 📦 Estrutura do Banco de Dados – Supabase

| Tabela                | Descrição                                      | Status        |
|------------------------|------------------------------------------------|----------------|
| `entradas`             | Registro de entradas financeiras                | ✅ Feito       |
| `saida`                | Registro de saídas financeiras                  | ✅ Em progresso|
| `formas_recebimento`  | Formas de recebimento (Pix, dinheiro...)        | ✅ Feito       |
| `motoboys`             | Cadastro e controle dos entregadores            | ⬜ A Fazer     |
| `custos_fixos`         | Custos recorrentes fixos                        | ⬜ A Fazer     |
| `faturamento_mensal`  | Resumo mensal de faturamento                    | ⬜ A Fazer     |
| `contas_a_pagar`      | Contas pendentes com data de vencimento         | ⬜ A Fazer     |

---

## 🚧 Próximas Etapas

- [x] Página de Saídas (formulário + listagem)
- [ ] Tela de Dashboard mensal
- [ ] Controle de Motoboys
- [ ] Autenticação com Supabase
- [ ] Deploy na Vercel

---

## 📁 Estrutura de Pastas – Next.js App Router

```
src/
├── app/
│   ├── saidas/
│   │   ├── page.tsx           ← tela de listagem das saídas
│   │   ├── nova/page.tsx      ← formulário de nova saída
├── components/
│   └── SaidaForm.tsx         ← componente com o formulário de saída
├── lib/
│   └── supabase.ts           ← conexão com o Supabase
```

---

## 🔮 Recursos Planejados

- Integração com OCR para leitura de notas via imagem (foto)
- Dashboard com gráficos (Recharts)
- Select dinâmico com formas de pagamento
- Sistema de planos com Stripe (Grátis, Pro, Empresa)

---

## ✉️ Contato

Criado por **Agnaldo Sousa** – 2025
