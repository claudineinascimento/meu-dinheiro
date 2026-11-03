# Regras financeiras

Esta página explica como o app calcula cada número. Todos os valores são guardados em **centavos inteiros** para não haver erro de arredondamento.

## Saldo de uma conta

```
saldo = saldo inicial
      + receitas pagas na conta
      − despesas pagas na conta
      − transferências que saíram da conta
      + transferências que entraram na conta
```

Lançamentos **pendentes** não mexem no saldo. No cartão de crédito, um saldo negativo é a fatura em aberto.

**Saldo em contas** (tela Início) é a soma dos saldos das contas ativas.

## Resultado do mês

Um lançamento entra no mês pela sua **data** (regime de caixa). Para compras no cartão, use a data da fatura se quiser ver o gasto no mês em que paga.

```
receitas do mês  = soma das receitas do mês (pagas e pendentes)
despesas do mês  = soma das despesas do mês (pagas e pendentes)
resultado        = receitas − despesas
```

Alguns movimentos mudam o saldo da conta mas **não são renda nem gasto**, por isso ficam fora do resultado:

| Movimento | Saldo da conta | Resultado do mês |
| --- | --- | --- |
| Dinheiro recebido de um empréstimo que você pegou | Entra | Fora |
| Dinheiro que você emprestou para alguém | Sai | Fora |
| Parcela recebida de quem te deve | Entra | Fora (é o seu dinheiro voltando) |
| Parcela que você paga de um empréstimo | Sai | **Conta como despesa** (categoria *Parcela de empréstimo*, fixa) |
| Aporte em investimento | Sai | Fora (é dinheiro guardado) |
| Resgate de investimento | Entra | Fora |
| Transferência entre contas | Move | Fora |

## Fixas x variáveis

Cada despesa é marcada como **fixa** ou **variável**. Lançamentos de *Repetir todo mês* e parcelas de empréstimo são fixos.

- **% fixas** = despesas fixas ÷ despesas do mês.
- **Fixas comprometem X% da receita** = despesas fixas ÷ receitas do mês. Referência saudável: até 50%.

## Regra 50/30/20

As categorias de despesa estão em três grupos, com a meta de cada um sobre a renda:

| Grupo | Meta | Exemplos |
| --- | --- | --- |
| Essencial | até 50% | Moradia, contas de casa, mercado, transporte, saúde, educação |
| Estilo de vida | até 30% | Restaurantes, lazer, viagens, compras, assinaturas |
| Financeiro | pelo menos 20% | Parcelas de empréstimo, juros e tarifas, aportes |

## Parcelamento

Ao parcelar um valor total `V` em `n` vezes, cada parcela vale `V ÷ n` arredondado para baixo em centavos, e a última recebe a diferença para a soma bater exatamente com `V`. Exemplo: R$ 100,00 em 3 vezes = 33,33 + 33,33 + 33,34.

As parcelas caem no mesmo dia dos meses seguintes. Se o mês não tem esse dia (31 em fevereiro, por exemplo), a parcela cai no último dia do mês.

## Empréstimos: tabela Price

Com juros mensais `i` (em decimal), valor `P` e `n` parcelas, a parcela fixa é:

```
parcela = P × i ÷ (1 − (1 + i)^−n)
```

Sem juros, a parcela é `P ÷ n`, com o ajuste de centavos na última.

Exemplo verificado nos testes: R$ 2.000,00 a 2% ao mês em 10 vezes dá parcela de **R$ 222,65**, total de R$ 2.226,50 e R$ 226,50 de juros.

| Indicador | Cálculo |
| --- | --- |
| Saldo devedor (ou a receber) | Soma das parcelas ainda não pagas |
| Em atraso | Soma das parcelas não pagas com vencimento antes de hoje |
| Próxima parcela | A parcela em aberto com o vencimento mais próximo |
| Quitado | Todas as parcelas pagas |

## Investimentos

```
saldo do investimento = saldo inicial + aportes + rendimentos − resgates
```

**Investido** (tela Início) é a soma dos saldos de todas as aplicações.

## Vencimentos

O bloco **A vencer em 7 dias** lista lançamentos pendentes e parcelas em aberto com data até hoje + 7 dias, incluindo os já atrasados, em ordem de data.

## Valores digitados

| Digitado | Entendido como |
| --- | --- |
| `45,90` | R$ 45,90 |
| `3.500` | R$ 3.500,00 (ponto de milhar) |
| `1.234,56` | R$ 1.234,56 |
| `12.5` | R$ 12,50 |
| `-350,00` (saldo de cartão) | R$ −350,00 |
