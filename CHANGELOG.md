# Histórico de versões

## 1.2 (novembro de 2026)

### Novidades

- **Digital ou PIN**: com a digital ativa, o app pede a digital sozinho ao abrir e ao voltar para o app, no APK e no PWA. Basta encostar o dedo: o PIN fica como reserva para quando a digital falhar. A tela de bloqueio ganhou o botão **Entrar com a digital** em destaque. Bloqueando pelo cadeado, o app espera você tocar no botão. O pedido automático pode ser desligado em *Segurança*.
- **Empréstimos com pagamento extra**: pague (ou receba) qualquer valor e escolha **reduzir o prazo** (elimina as últimas parcelas, o que mais economiza juros) ou **reduzir a parcela** (mantém o prazo e diminui cada parcela). **Quitar** paga tudo pelo valor de hoje, com desconto dos juros do tempo que falta (CDC, art. 52, § 2º). O app mostra antes o efeito e a economia, guarda o histórico de pagamentos extras e permite desfazer o último. O topo do empréstimo mostra quanto custa quitar hoje.
- **Extratos em PDF** na tela Lançamentos: por período (mês, mês anterior, 3, 6 ou 12 meses, este ano, ano passado ou datas livres), tipo, situação, conta e categoria. Modelos prontos: extrato do mês, gastos por categoria, contas a pagar nos próximos 30 dias, rendimentos do ano passado para o IR e fatura do cartão. Com uma conta, o PDF traz saldo anterior, saldo linha a linha e saldo final, como o extrato do banco. Cabeçalho, resumo, subtotais por mês, resumo por categoria, número das páginas e assinatura. O mesmo filtro sai em planilha (CSV). O PDF é gerado no aparelho, sem internet.
- **Contas e cartões com dados**: banco, agência, número, titular e chave Pix, com *Copiar dados*. Cartão com banco emissor, bandeira, 4 últimos números, limite, dia de fechamento e de vencimento e conta que paga a fatura. A tela mostra o total em contas, as faturas abertas e o limite disponível. **Pagar fatura** preenche a transferência com o valor da fatura. Cada conta tem seu **Extrato**.
- **Restaurar padrão de fábrica** em *Mais*, confirmando com o seu PIN (sem PIN, digitando `RESTAURAR`). Oferece fazer backup antes.
- **Tela Sobre** com versão, onde o app está rodando, novidades desta e das versões anteriores, links para versões novas e para o código-fonte e a assinatura *Desenvolvido por Claudinei Nascimento*.
- **Ajuda revisada**, com extrato, contas e Pix, pagamento extra, digital e restaurar de fábrica.

### Interface

- Menu *Mais* em grupos (*Minhas finanças* e *Aplicativo*), com *Restaurar padrão de fábrica* separado no fim.
- Contas separadas de cartões, com resumo no topo e detalhe de cada uma.
- Empréstimo com *Pagar extra* e *Quitar* no topo e parcelas antecipadas identificadas.
- Lançamentos com botão *Extrato* ao lado da busca. A busca também encontra conta e valor.
- Novo lançamento: *Quantas vezes* só aparece ao escolher repetir ou parcelar, com dica para cada opção.
- A versão aparece na assinatura do app.

### Correções

- **Digital no Android em loop**: o leitor de digital abre uma tela do sistema por cima do app. Ao fechar, o app achava que você tinha saído, bloqueava de novo e pedia a digital outra vez. Agora a volta logo após a leitura não bloqueia.
- No PWA, a digital ativa não era pedida ao abrir: era preciso achar o ícone pequeno no teclado.
- Ao trocar *Eu devo* / *Me devem* no novo empréstimo, o exemplo do campo não mudava.
- Uma conta usada só por empréstimos podia ser excluída.

### Publicação e documentação

- Versão 1.2.0 no `package.json` e no app (tela Sobre); cache do PWA `md-v3`.
- Manual, regras financeiras (fórmulas de valor presente, amortização e extrato), modelo de dados (campos novos de contas e empréstimos), segurança, arquitetura e testes atualizados. Capturas novas: contas, cartão, pagamento extra, extrato, PDF e Sobre.
- 174 testes automáticos (eram 135), incluindo o loop da digital no Android, pagamento extra, quitação, extrato em PDF, cartões e restaurar de fábrica.

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

### Publicação e documentação

- O APK passa a mostrar a versão do `package.json` (1.1.0) em vez do número da execução. O Release se chama *Meu Dinheiro 1.1.0* (tag `v1.1.0`) e traz o texto desta seção do histórico.
- Um Release novo só é criado quando a versão muda. Pushes sem mudar a versão atualizam o site e deixam o APK como artefato.
- Pull requests rodam os testes e geram um APK assinado para testar antes do merge.
- Cada APK vem com o arquivo `.sha256` para conferir o download.
- `.gitignore` reforçado para nunca enviar a chave de assinatura, senhas ou APKs ao repositório.
- README reescrito com instalação do APK e do PWA, funcionalidades, segurança, backup e capturas de tela.
- Capturas de tela refeitas para a versão 1.1, com telas novas (olho, aviso de backup, painel de investimentos, código de recuperação e *Esqueci o PIN*), geradas por `npm run capturas`.
- Licença MIT.

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
