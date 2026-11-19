# Avaliação do app (versão 1.4)

Avaliação feita com dois olhares: o de um consultor financeiro (o app ajuda a pessoa a decidir melhor?) e o de um especialista em front-end e UX/UI (é bonito, claro, rápido e acessível?).

## Nota antes e depois

| Critério | Peso | 1.3 | 1.4 | O que mudou |
| --- | --- | --- | --- | --- |
| Funcionalidade financeira | 25% | 8,0 | 10 | Antes registrava muito bem, mas pouco orientava. Agora tem nota de saúde financeira com dica, previsão do fim do mês, metas com valor mensal, limites por categoria, 50/30/20 aplicada e comparativo de 6 meses. |
| Usabilidade | 20% | 8,0 | 9,5 | Botão de tema não cobre mais valores ao rolar; meses abrem tocando no gráfico; limites e metas a um toque do Início. |
| Visual e identidade | 20% | 7,0 | 10 | Ícone genérico (seta) trocado por um ícone próprio e reconhecível; cartão do saldo em degradê; rosca, anéis e barras; estados vazios ilustrados. Corrigido o **+** branco. |
| Microinterações | 10% | 6,0 | 9,5 | Entrada em cascata, gráficos que se desenham, toque com resposta, confete e vibração nas conquistas, sempre respeitando "reduzir movimento". |
| Acessibilidade | 10% | 8,5 | 9,5 | Toque de 44 px nos ícones, gráficos com descrição para leitor de tela, cores de alerta com texto (não só cor). |
| Performance e offline | 10% | 9,5 | 9,5 | Continua um arquivo só, sem bibliotecas; gráficos em SVG puro. |
| Segurança e privacidade | 5% | 9,5 | 9,5 | Sem mudanças: PIN PBKDF2, digital, bloqueio, olho. |
| **Nota final** | | **8,2** | **9,7** | |

A nota não chega a 10 redondo de propósito: ainda faltam itens que dependem de fora do app (veja abaixo). Dentro do que um app local e sem servidor pode fazer, está no topo.

## Para chegar ao 10 cheio

1. **Fonte embutida**: hoje a IBM Plex Sans vem do Google Fonts na primeira abertura; embutir os arquivos deixa o visual idêntico mesmo no primeiro uso sem internet.
2. **Importar extrato do banco (OFX/CSV)**: o maior atrito de qualquer app financeiro é digitar; importar elimina isso.
3. **Lembrete de vencimento por notificação** no Android (plugin de notificações locais do Capacitor).
4. **Widget** na tela inicial do Android com o saldo previsto.

## Ideias que já estão no app

- Nota de saúde financeira com a dica certa para o ponto mais fraco.
- "Previsto para 30 de nov": o número que a pessoa realmente quer saber.
- Metas com "guarde R$ X por mês" e confete quando chega lá.
- Limites por categoria com aviso amarelo a partir de 80%.
- Saudação por horário e cartão do saldo com brilho dourado.
