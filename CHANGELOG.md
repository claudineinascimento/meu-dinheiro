# Histórico de versões

## 1.0 (novembro de 2026)

Primeira versão publicada.

### Funções

- Lançamentos de receitas, despesas e transferências, com pago/pendente, fixo/variável, parcelamento e repetição mensal.
- Contas e cartões com saldo inicial e arquivamento.
- 29 categorias na regra 50/30/20, editáveis, com ícones.
- Empréstimos *Eu devo* e *Me devem*, com tabela Price, parcelas, atrasos, pagamento e desfazer.
- Investimentos com aportes, resgates, rendimentos e saldo inicial.
- Início com saldo, resultado, fixas x variáveis, vencimentos em 7 dias, dívidas e maiores gastos.
- Pessoas com saldo de empréstimos.
- Backup JSON, exportação CSV e restauração.
- Dados de exemplo para conhecer o app.
- Tema automático, claro e escuro num único botão.
- PIN com PBKDF2, digital (WebAuthn e Android), bloqueio automático e pausa após 5 erros.
- Ajuda dentro do app e assinatura *Desenvolvido por Claudinei Nascimento*.
- PWA instalável e offline; APK Android com Capacitor.

### Correções feitas nos testes

- Valores como `3.500` eram lidos como R$ 3,50. Agora o ponto de milhar é reconhecido.
- Lançamentos criados por empréstimos podiam ser alterados pela lista, desencontrando as parcelas. Agora só a tela do empréstimo altera.
- Contas e categorias apareciam fora de ordem. Agora seguem a ordem de criação.
