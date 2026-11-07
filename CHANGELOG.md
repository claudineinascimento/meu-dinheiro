# Histórico de versões

## 1.1 (novembro de 2026)

### Novidades

- **Olho para ocultar valores**: um olho esconde o saldo em contas (Início e Contas) e outro esconde o total investido (Início e Investimentos). A escolha fica salva.
- **Recuperação do PIN**: código de recuperação mostrado ao criar o PIN, pergunta de segurança opcional e digital. Na tela de bloqueio, *Esqueci o PIN* oferece essas opções e, como último recurso, *Apagar tudo e começar de novo*.
- **Painel de investimentos**: total aplicado, rendimentos e rentabilidade; distribuição por tipo; evolução dos últimos 12 meses; meta da reserva de emergência (6 meses de despesas essenciais); liquidez; peso e rendimento de cada aplicação.
- **Aplicações editáveis**: nome, tipo, instituição e liquidez.
- **Situação do backup**: data do último backup, aviso quando passa do prazo (7, 15 ou 30 dias), botão *Fazer backup agora*, adiar por 3 dias, ocultar ou desligar o lembrete. Substitui o aviso fixo "dados salvos só neste aparelho".

### Segurança

- *Esqueci o PIN* não tira mais o PIN só com a palavra `REDEFINIR`. Era possível qualquer pessoa entrar no app assim.
- Ativar a digital e mudar a recuperação passam a pedir o PIN atual.
- Enquanto o app está bloqueado, os valores não ficam desenhados na página.
- Erros no código e na resposta de recuperação contam nas tentativas e levam à mesma pausa do PIN.

### Correções

- Com o bloqueio "ao sair do app", compartilhar o backup no Android ou escolher o arquivo para restaurar bloqueava o app no meio da ação.
- Era possível resgatar mais do que o saldo da aplicação, deixando o investimento negativo.
- Não havia como editar uma aplicação depois de criada.
- Saldo inicial negativo ao criar aplicação era aceito.

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
