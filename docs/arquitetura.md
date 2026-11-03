# Arquitetura

O Meu Dinheiro é um único arquivo web (`www/index.html`) com HTML, CSS e JavaScript puro, sem framework e sem etapa de build. O mesmo código roda em três lugares, e detecta sozinho onde está.

```
                   www/index.html  (app inteiro: telas, regras, segurança)
                          │
        ┌─────────────────┼──────────────────────┐
        ▼                 ▼                      ▼
   Versão Claude      PWA (site)            APK Android
   banco "db" da      localStorage +        WebView do Capacitor
   página (nuvem)     service worker        + plugins nativos
```

## Onde o app roda

| Plataforma | Como é detectada | Armazenamento | Digital | Backup |
| --- | --- | --- | --- | --- |
| Versão no Claude | `window.claude.use('db')` responde | Banco da página, em `data/users/<id>/app/...` (privado por usuário) | WebAuthn, se liberado | Capacidade `downloads` |
| PWA | Sem `window.claude` e sem Capacitor | `localStorage` (`md_dados_v1`) | WebAuthn | Link de download |
| APK | `Capacitor.isNativePlatform()` | `localStorage` da WebView | Plugin `BiometricAuthNative` | Plugins `Filesystem` + `Share` |

Se o banco da versão Claude não responder, o app cai para o modo aparelho (`localStorage`) e mostra um aviso.

## Organização do código

Tudo está dentro de uma função anônima em `www/index.html`, nesta ordem:

| Bloco | Responsabilidade |
| --- | --- |
| Ícones (`P`, `ic`) | Ícones SVG desenhados para o app, no estilo traço |
| Utilidades | Formatação em reais, datas, `parseMoney`, `addMonths`, `uid` |
| Categorias padrão | As 29 categorias iniciais, com grupo 50/30/20, ícone e chave de sistema |
| Estado e armazenamento | Objeto `S` com as coleções, `put`/`del`, fila de escrita por documento, `boot`, `localMode` |
| Cálculos | Saldo de conta, resumo do mês, situação do empréstimo, saldo do investimento, tabela Price |
| Tema | Botão único automático › claro › escuro, guardado em `md_tema` |
| Navegação e telas | `renderNav` e uma função por tela (`vInicio`, `vLancamentos`, `vEmprestimos`...) |
| Folhas (formulários) | `openSheet` e os formulários de lançamento, empréstimo, investimento, conta, categoria, pessoa |
| Exemplo e backup | Dados de exemplo marcados `exemplo:true`, exportação JSON/CSV, importação |
| Segurança | PIN (PBKDF2), digital (WebAuthn ou nativa), tela de bloqueio, bloqueio automático |
| Eventos | Delegação de cliques por `data-act`, teclado, visibilidade, `pause`/`resume` do Android |

### Fluxo de uma alteração

1. A tela chama `put(colecao, objeto)` ou `del(colecao, id)`.
2. O estado em memória (`S`) muda e a tela é redesenhada na hora.
3. A escrita vai para o armazenamento: no modo aparelho, `localStorage` inteiro; na versão Claude, o documento é enviado ao banco numa fila por documento, uma escrita por vez.
4. Na versão Claude, cada coleção é ouvida com `onSnapshot`. Mudanças feitas em outro aparelho chegam e redesenham a tela.

### Telas e folhas

As telas são strings HTML geradas a partir do estado e trocadas inteiras em `#view`. Formulários abrem numa folha inferior (`#sheet-root`) com seus próprios manipuladores em `sheetHandlers`. A tela de bloqueio fica em `#lock-root`, acima de tudo, e marca o conteúdo como `inert` enquanto bloqueado.

## Visual

- Cores como variáveis CSS em `:root`, redefinidas para o tema escuro por `prefers-color-scheme` e por `data-theme`.
- Uma única família de fonte (IBM Plex Sans), com números tabulares para alinhar valores.
- Layout de celular com barra inferior; a partir de 900 px de largura, menu lateral.
- Respeita as áreas seguras do celular (`env(safe-area-inset-*)`).

## PWA

| Arquivo | Função |
| --- | --- |
| `www/manifest.webmanifest` | Nome, cores, ícones (inclui ícone *maskable*) e atalho *Novo lançamento* |
| `www/sw.js` | Guarda o app em cache para abrir sem internet. Navegação: rede primeiro, cache se offline. Arquivos do app: cache primeiro. Fontes: cache com atualização em segundo plano |
| `www/icons/` | Ícones 32, 180, 192, 512 e maskable 512 |

No APK, o service worker não é registrado: os arquivos já estão dentro do aplicativo.

## APK (Capacitor 7)

- `capacitor.config.json`: `appId` `br.com.claudinei.meudinheiro`, nome *Meu Dinheiro*, pasta web `www`.
- `android/`: projeto Android gerado pelo Capacitor, com ícones adaptativos e tela de abertura do app.
- Plugins: `@capacitor/filesystem` e `@capacitor/share` (backup), `@aparajita/capacitor-biometric-auth` (digital).
- O app acessa os plugins por `window.Capacitor.Plugins`, sem bundler.
- Versão do APK: `versionCode` = número da execução do GitHub Actions, `versionName` = `1.<número>`.

## Publicação

O fluxo `.github/workflows/publicar.yml` roda a cada push na `main`:

```
testes (95 verificações) ──► site no GitHub Pages (pasta www)
                         └─► APK assinado ──► Release "Meu Dinheiro 1.N" com meu-dinheiro.apk
```

Se algum teste falhar, nada é publicado.
