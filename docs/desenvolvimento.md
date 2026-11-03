# Desenvolvimento e publicação

## Requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js | 22 |
| Java (JDK) | 21, só para compilar o APK localmente |
| Android SDK | API 35, só para compilar o APK localmente |

## Rodar o app no computador

O app é um arquivo só. Para abrir com o service worker funcionando, sirva a pasta `www` por HTTP:

```bash
npx serve www          # ou: python3 -m http.server -d www 8080
```

Abra o endereço mostrado. Sem `window.claude` e sem Capacitor, o app roda em modo aparelho e guarda os dados no `localStorage` do navegador.

## Alterar o app

1. Edite `www/index.html`. Não há build: o arquivo é o app.
2. Rode os testes: `npm test`.
3. Se mudou algum arquivo que o service worker guarda, troque `VERSAO` em `www/sw.js` (`md-v2`, `md-v3`...). Assim quem já instalou recebe a versão nova.
4. Faça commit e push na `main`.

## Testes

```bash
npm ci
npx playwright install chromium
npm test
```

O comando sobe dois servidores locais (portas 8765 e 8766) e roda os três conjuntos. Detalhes em [testes.md](testes.md).

## Publicar uma nova versão

Cada push na `main` dispara `.github/workflows/publicar.yml`:

1. **Testes automáticos.** Se algum falhar, para tudo.
2. **Site.** Publica a pasta `www` no GitHub Pages.
3. **APK.** Compila, assina e cria um *Release* `v1.N` com `meu-dinheiro.apk`.

O link fixo do APK mais recente é:

```
https://github.com/<usuario>/meu-dinheiro/releases/latest/download/meu-dinheiro.apk
```

Também dá para rodar manualmente em **Actions › Publicar app › Run workflow**.

### Configuração inicial do repositório (uma vez)

| Onde | O quê |
| --- | --- |
| Settings › Pages | *Source*: **GitHub Actions** (o fluxo tenta ativar sozinho) |
| Settings › Secrets and variables › Actions | `KEYSTORE_BASE64`: a chave `meu-dinheiro.keystore` em base64 |
| Settings › Secrets and variables › Actions | `KEYSTORE_PASSWORD`: a senha da chave |

Para gerar o base64 da chave:

```bash
base64 -w0 meu-dinheiro.keystore
```

## Compilar o APK no computador

```bash
npm ci
npx cap sync android
cd android
KEYSTORE_PASSWORD='<senha>' ./gradlew assembleRelease
```

Copie antes a chave para `android/app/meu-dinheiro.keystore`. Ela está no `.gitignore` e nunca deve ir para o repositório. O APK sai em `android/app/build/outputs/apk/release/app-release.apk`.

Para abrir no Android Studio: `npx cap open android`.

## Ícones e tela de abertura

| Arquivo | Uso |
| --- | --- |
| `www/icons/*` | Ícones do PWA e do navegador |
| `android/app/src/main/res/mipmap-*/` | Ícone do APK (normal, redondo e adaptativo) |
| `android/app/src/main/res/drawable*/splash.png` | Tela de abertura do APK |
| `android/app/src/main/res/values/ic_launcher_background.xml` | Cor de fundo do ícone adaptativo (`#0B5D4E`) |

## Convenções

- Textos da interface em português do Brasil, frases curtas e diretas.
- Dinheiro sempre em centavos inteiros; formatação só na hora de mostrar.
- Toda cor vem de uma variável CSS com versão clara e escura.
- Uma ação de interface = um `data-act` tratado no manipulador de cliques.
- Lançamentos criados por empréstimos e investimentos levam `vinculo` e só são alterados pela tela de origem.
