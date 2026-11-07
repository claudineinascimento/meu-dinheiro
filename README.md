# Meu Dinheiro

Aplicativo de controle financeiro pessoal, simples para o dia a dia e com resultado profissional. Registra receitas, despesas fixas e variáveis, compras parceladas, empréstimos que você pegou e que fez para outras pessoas, investimentos e a reserva de emergência. Funciona no celular como app instalado (APK ou PWA), sem internet, com PIN e digital.

Desenvolvido por **Claudinei Nascimento**.

<p>
  <img src="docs/img/inicio.png" width="230" alt="Tela Início">
  <img src="docs/img/emprestimos.png" width="230" alt="Tela Empréstimos">
  <img src="docs/img/bloqueio.png" width="230" alt="Tela de bloqueio com PIN">
</p>

## Instalar

| Onde | Como |
| --- | --- |
| Android (APK) | Baixe [meu-dinheiro.apk](../../releases/latest/download/meu-dinheiro.apk) no celular, abra o arquivo e permita a instalação quando o Android pedir. |
| Android (Chrome) | Abra o site do app (GitHub Pages deste repositório) e toque em **Mais › Instalar o app**. |
| iPhone (Safari) | Abra o site do app, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**. |

Os dados ficam salvos no próprio aparelho. Faça backup em **Mais › Backup** com frequência.

## O que o app faz

- **Lançamentos** de receitas, despesas e transferências em menos de 10 segundos, com categoria, conta, data, pago ou pendente.
- **Fixas x variáveis**, **parcelamento** (divide o valor total) e **repetição mensal** (aluguel, salário, assinaturas).
- **Contas e cartões**: o saldo de cada conta e a fatura do cartão de crédito.
- **Empréstimos** em duas listas, *Eu devo* e *Me devem*, com parcelas, juros pela tabela Price, atrasos e saldo de cada pessoa.
- **Investimentos** com painel: distribuição por tipo, rentabilidade, evolução em 12 meses, meta da reserva de emergência e liquidez.
- **Início** com saldo em contas, resultado do mês, fixas x variáveis, vencimentos dos próximos 7 dias, quem deve a quem e os maiores gastos.
- **Categorias** na regra 50/30/20 (essencial, estilo de vida, financeiro).
- **Segurança**: PIN de 4 a 6 números, digital, bloqueio automático, pausa após 5 erros e recuperação do PIN por código, pergunta de segurança ou digital.
- **Privacidade**: botão de olho para ocultar o saldo e o total investido.
- **Backup** completo em arquivo, exportação para planilha (CSV) e restauração, com a data do último backup e lembrete quando atrasa.
- **Tema** claro, escuro ou automático num único botão.

## Documentação

| Documento | Para quem | Conteúdo |
| --- | --- | --- |
| [Manual do usuário](docs/manual-do-usuario.md) | Quem usa o app | Passo a passo de todas as telas |
| [Regras financeiras](docs/regras-financeiras.md) | Quem quer entender os números | Como cada saldo, total e parcela é calculado |
| [Segurança e privacidade](docs/seguranca.md) | Todos | PIN, digital, onde ficam os dados, limites |
| [Arquitetura](docs/arquitetura.md) | Quem mantém o código | Como o app é organizado e roda em cada plataforma |
| [Modelo de dados](docs/modelo-de-dados.md) | Quem mantém o código | Coleções, campos e formato do backup |
| [Desenvolvimento e publicação](docs/desenvolvimento.md) | Quem mantém o código | Rodar, testar, gerar o APK e publicar versões |
| [Testes](docs/testes.md) | Quem mantém o código | O que os 135 testes automáticos verificam |
| [Histórico de versões](CHANGELOG.md) | Todos | O que mudou em cada versão |

## Estrutura do repositório

```
www/                    o app (index.html, manifesto, service worker, ícones)
android/                projeto Android (Capacitor) que empacota www/ no APK
testes/                 testes automáticos de ponta a ponta (Playwright)
docs/                   documentação e capturas de tela
.github/workflows/      testa, publica o site e gera o APK a cada push na main
```

## Desenvolvimento rápido

```bash
npm ci
npx playwright install chromium
npm test                 # 135 verificações de ponta a ponta
npx cap sync android     # copia www/ para o projeto Android
```

Detalhes em [docs/desenvolvimento.md](docs/desenvolvimento.md).
