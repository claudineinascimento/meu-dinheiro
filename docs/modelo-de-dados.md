# Modelo de dados

O app tem 6 coleções e um documento de configuração de segurança. Todo registro tem `id` (texto aleatório de 20 caracteres), `criadoEm` e `atualizadoEm` (milissegundos). **Valores em dinheiro são inteiros em centavos** e **datas são texto `AAAA-MM-DD`**.

```
contas ─┐
        ├─< lancamentos >── categorias
        │        ▲
        │        │ vinculo
        ├── emprestimos (parcelas embutidas) ── pessoas (pelo nome)
        └── investimentos (movimentos embutidos)
```

## contas

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `nome` | texto | Ex.: *Nubank* |
| `tipo` | `corrente` \| `poupanca` \| `carteira` \| `cartao` | Tipo da conta |
| `saldoInicial` | centavos | Saldo no dia em que começou a usar o app (negativo = fatura do cartão) |
| `ativa` | booleano | `false` = arquivada |

## categorias

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `nome` | texto | Ex.: *Mercado* |
| `tipo` | `receita` \| `despesa` | |
| `grupo` | `receita` \| `essencial` \| `estilo` \| `financeiro` | Grupo da regra 50/30/20 |
| `icone` | texto | Nome do ícone (`cart`, `home`...) |
| `cor` | texto | Cor do grupo |
| `chave` | texto ou `null` | Chave fixa das categorias usadas pelo app |
| `sistema` | booleano | `true` = não pode ser excluída nem ocultada |
| `oculta` | booleano | Some das listas de escolha |

Chaves de sistema: `salario`, `receb_emprestimo`, `emprestimo_recebido`, `resgate`, `parcela_emprestimo`, `emprestimo_terceiros`, `aporte`.

## lancamentos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `tipo` | `receita` \| `despesa` \| `transferencia` | |
| `valor` | centavos | Sempre positivo |
| `data` | data | Dia do pagamento ou vencimento |
| `contaId` | id | Conta (origem, na transferência) |
| `contaDestinoId` | id ou `null` | Só em transferência |
| `categoriaId` | id ou `null` | Vazio em transferência |
| `natureza` | `fixo` \| `variavel` \| `null` | Só em despesa |
| `status` | `pago` \| `pendente` | Só `pago` mexe no saldo |
| `descricao` | texto | |
| `grupoId` | id ou ausente | Liga lançamentos de uma série (repetição ou parcelamento) |
| `parcela` | texto ou `null` | Ex.: `2/3` |
| `mov` | `emprestimo` \| `investimento` \| `null` | Movimento fora do resultado do mês |
| `vinculo` | id ou ausente | Empréstimo ou investimento que criou o lançamento |
| `exemplo` | booleano | Dado de exemplo |

## pessoas

| Campo | Tipo |
| --- | --- |
| `nome` | texto |
| `telefone` | texto |
| `obs` | texto |

## emprestimos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `direcao` | `devo` \| `medevem` | Quem deve a quem |
| `contraparte` | texto | Nome da pessoa ou instituição |
| `principal` | centavos | Valor emprestado |
| `taxa` | número | Juros ao mês, em % |
| `nParcelas` | inteiro | |
| `valorParcela` | centavos | |
| `dataInicio` | data | Dia do empréstimo |
| `contaId` | id | Conta usada |
| `finalidade` | texto | |
| `lancInicialId` | id ou ausente | Lançamento da entrada/saída do dinheiro |
| `parcelas` | lista | Ver abaixo |

Cada item de `parcelas`:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `n` | inteiro | Número da parcela |
| `venc` | data | Vencimento |
| `valor` | centavos | Valor previsto |
| `pagoEm` | data ou ausente | Preenchido quando paga |
| `valorPago` | centavos ou ausente | |
| `lancId` | id ou ausente | Lançamento criado no pagamento |

## investimentos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `nome` | texto | |
| `tipo` | `reserva` \| `rendafixa` \| `tesouro` \| `acoes` \| `fundos` \| `previdencia` \| `cripto` \| `outros` | |
| `instituicao` | texto | |
| `liquidez` | `diaria` \| `vencimento` | |
| `movimentos` | lista | `{id, tipo: inicial \| aporte \| resgate \| rendimento, valor, data, contaId?, lancId?}` |

## Segurança (`config/seguranca`)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `pinHash` | texto hex | PBKDF2‑SHA256, 120.000 iterações, 32 bytes |
| `pinSalt` | texto | Sal aleatório |
| `pinLen` | inteiro | 4 a 6 |
| `autoLock` | inteiro | Minutos sem uso; `0` = ao sair do app |

## Chaves no aparelho (`localStorage`)

| Chave | Conteúdo |
| --- | --- |
| `md_dados_v1` | Todas as coleções (modo aparelho: PWA e APK) |
| `md_seg` | Configuração de segurança (modo aparelho) |
| `md_seg_cache` | Cópia da configuração de segurança para bloquear antes de carregar |
| `md_bio` | Registro da digital deste aparelho |
| `md_tent` | Tentativas erradas de PIN e fim da pausa |
| `md_tema` | `auto`, `claro` ou `escuro` |

## Formato do backup

```json
{
  "app": "meu-dinheiro",
  "versao": 1,
  "geradoEm": "2026-11-03T15:00:00.000Z",
  "dados": {
    "contas": [], "categorias": [], "lancamentos": [],
    "pessoas": [], "emprestimos": [], "investimentos": []
  }
}
```

A restauração confere o campo `app` e as 6 listas antes de substituir os dados. O PIN não vai no backup.

## Exportação CSV

Separador `;`, codificação UTF‑8 com BOM (abre direto no Excel). Colunas: Data, Tipo, Descrição, Categoria, Grupo, Conta, Conta destino, Valor (despesas negativas, vírgula decimal), Natureza, Status, Parcela.
