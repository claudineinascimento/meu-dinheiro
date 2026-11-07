# Testes

Os testes simulam uma pessoa usando o app de verdade num navegador Chromium (Playwright), conferindo os valores na tela a cada passo. São **135 verificações** em três conjuntos. Rodam com `npm test` e, no GitHub, antes de cada publicação.

| Arquivo | Verificações | O que cobre |
| --- | --- | --- |
| `testes/usuario-final.test.js` | 113 | Jornada completa no celular, com banco simulado da versão Claude e também no modo aparelho |
| `testes/pwa.test.js` | 13 | Instalação, funcionamento offline, backup em arquivo, atalho, digital por WebAuthn |
| `testes/android.test.js` | 9 | Caminhos do APK com plugins do Android simulados |

Apoio: `testes/servidor.js` (servidores locais), `testes/mock.js` (banco simulado), `testes/rodar.js` (roda tudo).

## Jornada do usuário final (`usuario-final.test.js`)

Tela de 390 × 844 px, com toque.

| Etapa | Verificações |
| --- | --- |
| Primeira abertura | Abre sem bloqueio; tela vazia orienta o primeiro lançamento |
| Conta | Saldo inicial de R$ 1.000,00 aparece no Início |
| Despesa e receita | R$ 45,90 pago reduz o saldo; receita de `3.500` soma R$ 3.500,00 |
| Parcelado | R$ 600 em 3 vezes: só a 1ª parcela entra paga; 2/3 aparece pendente no mês seguinte |
| Repetição | Aluguel em 12 meses pendente não mexe no saldo e aparece uma vez por mês |
| Pago/pendente | Tocar no círculo desconta do saldo |
| Transferência | Não muda o saldo total; a carteira recebe R$ 100 |
| Edição e exclusão | Editar valor atualiza o saldo; excluir "este e os 11 próximos" remove a série |
| Filtros e busca | Pendentes do mês seguinte; busca "merc" encontra Mercado |
| Empréstimo com juros | R$ 2.000 a 2% em 10× = parcela R$ 222,65; entrada na conta fora da receita; pagar e desfazer parcela |
| Proteção | Lançamento de parcela não pode ser alterado pela lista |
| Me devem | Emprestar R$ 500 e receber 1 parcela; saldo de R$ 400 e pessoa mostra "Te deve" |
| Investimentos | Aporte sai, resgate volta, rendimento soma; aporte fora dos gastos |
| Olho | Oculta saldo e investido separadamente; a escolha continua depois de reabrir; mostra de novo |
| Painel de investimentos | Distribuição, evolução de 12 meses, reserva e liquidez; rendimentos e rentabilidade; recusa resgate maior que o saldo; edita a aplicação |
| Categorias | Nova categoria aparece no lançamento |
| Validação | Valor vazio mostra erro |
| Backup | Aviso de "nunca fez backup" e adiar; data do último backup; "Backup em dia" e ocultar; desligar o lembrete; JSON e CSV gerados; restaurar recupera um lançamento excluído |
| Tema | Botão alterna claro, escuro e automático |
| Layout | Nenhuma tela rola para o lado a 390 px e a 320 px |
| PIN | Recusa PIN fácil e PINs diferentes; cria PIN e mostra o código de recuperação, que não fica guardado em texto; pergunta de segurança pede o PIN atual; bloqueia pelo cadeado; Esc não fecha; PIN errado avisa; PIN certo libera |
| Reabrir | Pede PIN ao abrir; conteúdo inacessível e sem valores na página atrás do bloqueio; teclado físico funciona |
| Tentativas | 5 erros pausam e travam o teclado; após a pausa o PIN certo funciona |
| Digital | Ativar pede o PIN; ativa com autenticador virtual e desbloqueia |
| Bloqueio automático | Bloqueia ao sair do app |
| Esqueci o PIN | Oferece digital, código, pergunta e apagar; não existe atalho sem prova; resposta e código errados não liberam; resposta certa e código certo levam a criar PIN novo; código usado é trocado; PIN antigo deixa de valer; dados preservados |
| Apagar tudo | Exige `APAGAR`; zera os dados e tira o PIN |
| Modo aparelho | Aviso de onde ficam os dados; carregar e apagar exemplos |
| Console | Nenhum erro de JavaScript |

## PWA (`pwa.test.js`)

Service worker ativo · Chrome considera o app instalável · manifesto sem erros · roda em modo aparelho · dados continuam depois de reabrir · aviso de backup · abre sem internet · backup baixa como arquivo · atalho do ícone abre *Novo lançamento* · digital ativa · pede PIN ao abrir · desbloqueia com digital · sem erros.

## APK (`android.test.js`)

Simula `window.Capacitor` com os plugins do Android: não registra service worker · não mostra *Instalar o app* · ativa digital pelo leitor · ao abrir, pede a digital sozinho · ao voltar para o app, bloqueia e pede a digital · backup abre o compartilhar do Android · voltar do compartilhar não bloqueia · backup registra a data · sem erros.

## Limites

- A digital real e o compartilhar do Android são simulados. Teste num celular a cada mudança nessas partes.
- O banco da versão Claude é simulado em `mock.js`, com a mesma interface (`collection`, `doc`, `set`, `delete`, `onSnapshot`).

## Último resultado

135 de 135 verificações passaram em 07/11/2026.
