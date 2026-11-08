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
| Valor extra ou quitação de um empréstimo que você pegou | Sai | **Conta como despesa** (categoria *Parcela de empréstimo*, variável) |
| Valor extra recebido de quem te deve | Entra | Fora |
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

## Pagamento extra e quitação antecipada

Com juros, cada parcela em aberto vale **hoje** o seu valor presente. É a regra do Código de Defesa do Consumidor (art. 52, § 2º): quem antecipa paga sem os juros do tempo que falta.

```
meses até o vencimento  k = dias entre a data do pagamento e o vencimento ÷ 30 (0 se já venceu)
valor presente da parcela = valor ÷ (1 + i)^k
para quitar hoje          = soma dos valores presentes das parcelas em aberto
desconto de juros         = soma das parcelas em aberto − para quitar hoje
```

Parcelas atrasadas valem o valor cheio (o app não calcula multa nem juros de atraso).

| Opção | Como o valor `V` é aplicado |
| --- | --- |
| **Reduzir prazo** | Começa pela **última** parcela: se `V` cobre o valor presente dela, a parcela é marcada como antecipada e o resto segue para a anterior. O que sobrar abate a próxima parcela, que passa a valer `valor − sobra × (1 + i)^k`. |
| **Reduzir parcela** | O saldo das parcelas que ainda vão vencer, a valor presente, menos `V`, é dividido de novo nas mesmas datas e com a mesma taxa: `parcela nova = (VP − V) ÷ Σ 1/(1 + i)^k`. Sem juros, `(saldo − V) ÷ parcelas`, com ajuste de centavos na última. |
| **Quitar** | `V` = para quitar hoje. Todas as parcelas em aberto são marcadas como antecipadas. |

```
economia de juros = parcelas em aberto antes − parcelas em aberto depois − V
```

Sem juros, o valor presente é o próprio valor e não há economia: o valor extra abate direto do saldo. O app não aceita um valor maior que o necessário para quitar.

Exemplo (com os dados de exemplo do app): R$ 6.000,00 a 1,9% ao mês em 12 vezes, parcela de R$ 563,88, com 3 pagas. Um valor extra de R$ 1.500,00 reduzindo o prazo elimina as 2 últimas parcelas, diminui a 10ª e economiza cerca de R$ 214 de juros. O mesmo valor reduzindo a parcela leva as 9 restantes de R$ 563,88 para cerca de R$ 384.

Cada pagamento extra guarda uma cópia das parcelas de antes. **Desfazer** (só o último) devolve as parcelas e apaga o lançamento, desde que nenhuma parcela tenha sido paga depois.

## Extrato

| Item | Cálculo |
| --- | --- |
| Lançamentos | Data entre *de* e *até*, mais os filtros de tipo, situação, conta e categoria. Ordem por data. |
| Entradas e saídas (sem conta escolhida) | Receitas e despesas da lista, pagas e pendentes. Transferências ficam de fora. |
| Com uma conta escolhida | Receitas e transferências que **entram** na conta são entradas; despesas e transferências que **saem** são saídas. |
| Saldo anterior | Saldo da conta no fim do dia anterior ao início do período (só pagos). |
| Entradas pagas e saídas pagas | Só os lançamentos pagos, para fechar a conta: saldo anterior + entradas pagas − saídas pagas = saldo final. |
| Saldo linha a linha | Aparece com uma conta escolhida, tipo *Todos*, sem categoria e sem o filtro *Pendentes*. Pendentes ficam sem saldo. |
| Subtotais por mês | Quando o período tem mais de um mês. |
| Resumo por categoria | Soma, quantidade e participação (%) de cada categoria, para despesas e para receitas. |

## Cartão de crédito

```
fatura em aberto   = −saldo do cartão (quando negativo)
limite disponível  = limite − fatura em aberto
próximo vencimento = próxima data com o dia de vencimento, a partir de hoje
```

## Investimentos

```
saldo do investimento = saldo inicial + aportes + rendimentos − resgates
```

**Investido** (tela Início) é a soma dos saldos de todas as aplicações.

| Indicador do painel | Cálculo |
| --- | --- |
| Aplicado | saldo inicial + aportes − resgates |
| Rendimentos | soma dos movimentos *Rendimento* |
| Rentabilidade | rendimentos ÷ (saldo inicial + aportes) |
| Distribuição | saldo de cada tipo ÷ soma dos tipos com saldo positivo |
| Evolução | para cada um dos últimos 12 meses, soma de todos os movimentos com data até o fim do mês |
| Meta da reserva | 6 × média mensal das despesas essenciais (grupo *Essencial*, sem empréstimos e aportes) nos últimos 3 meses que tiveram despesa essencial |
| Meses cobertos | saldo das aplicações do tipo *Reserva de emergência* ÷ média mensal das despesas essenciais |
| Liquidez | aplicações com liquidez diária x no vencimento |

Um resgate maior que o saldo da aplicação é recusado.

## Vencimentos

O bloco **A vencer em 7 dias** lista lançamentos pendentes e parcelas em aberto com data até hoje + 7 dias, incluindo os já atrasados, em ordem de data.

## Valores digitados

| Digitado | Entendido como |
| --- | --- |
| `45,90` | R$ 45,90 |
| `3.500` | R$ 3.500,00 (ponto de milhar) |
| `1.234,56` | R$ 1.234,56 |
| `12.5` | R$ 12,50 |
| `-350,00` (saldo de conta) | R$ −350,00 |
| `350,00` (fatura do cartão) | Fatura de R$ 350,00, guardada como saldo −350,00 |
