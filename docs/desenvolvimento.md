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
4. Abra um pull request; ao fazer o merge na `main`, o app é publicado.

## Testes

```bash
npm ci
npx playwright install chromium
npm test
```

O comando sobe dois servidores locais (portas 8765 e 8766) e roda os três conjuntos. Detalhes em [testes.md](testes.md).

## Publicar uma nova versão

O fluxo `.github/workflows/publicar.yml` faz tudo sozinho:

| Quando | Testes | Site (GitHub Pages) | APK assinado | Release |
| --- | --- | --- | --- | --- |
| Push na `main` | Sim | Publica `www/` | Sim | Só se a versão ainda não foi publicada |
| Pull request para a `main` | Sim | Não | Sim, como artefato para teste | Não |
| *Run workflow* manual | Sim | Se rodar na `main` | Sim | Igual ao push |

Se algum teste falhar, nada é publicado.

### Passo a passo de uma versão

1. Altere o app e rode `npm test`.
2. Troque `VERSAO` em `www/sw.js` (`md-v3`, `md-v4`...) para quem usa o PWA receber a versão nova.
3. Aumente `"version"` no `package.json` (ex.: `1.1.0` › `1.2.0`) e rode `npm install` para atualizar o `package-lock.json`.
4. Escreva a seção `## 1.2 (mês de ano)` no topo do `CHANGELOG.md`. Ela vira o texto do Release.
5. Abra um pull request. O fluxo testa e gera o APK; baixe e instale no celular para conferir (veja abaixo).
6. Faça o merge na `main`. O fluxo publica o site e cria o Release `v1.2.0` com `meu-dinheiro.apk`.

### Número da versão

| Campo | De onde vem | Exemplo |
| --- | --- | --- |
| `versionName` (o que a pessoa vê) | `"version"` do `package.json` | `1.1.0` |
| `versionCode` (o que o Android compara) | Número da execução do GitHub Actions, sempre maior que o anterior | `5` |
| Tag e Release | `v` + `versionName` | `v1.1.0`, *Meu Dinheiro 1.1.0* |

Um push na `main` sem mudar a versão atualiza o site, gera o APK como artefato e avisa que a versão já foi publicada, sem criar outro Release. O primeiro Release, `v1.4`, foi gerado antes desta regra e corresponde à versão 1.0.

### Baixar o APK

| O quê | Onde |
| --- | --- |
| Versão publicada mais recente | `https://github.com/claudineinascimento/meu-dinheiro/releases/latest/download/meu-dinheiro.apk` |
| Todas as versões | Aba **Releases** do repositório |
| APK de teste de um pull request ou push | **Actions** › execução do *Publicar app* › seção **Artifacts** › `meu-dinheiro-X.Y.Z-apk` (um `.zip` com o APK e o `.sha256`; precisa estar logado no GitHub) |

Cada APK vem com `meu-dinheiro.apk.sha256`. Para conferir o arquivo: `sha256sum -c meu-dinheiro.apk.sha256`.

Instalar por cima mantém os dados, desde que o APK seja assinado com a mesma chave. Todos os APKs deste fluxo são.

### Chave de assinatura e segredos

A chave (`meu-dinheiro.keystore`) e a senha **nunca vão para o repositório**. O `.gitignore` bloqueia `*.keystore`, `*.jks` e os arquivos `KEYSTORE_*.txt`. O fluxo lê a chave dos *Secrets* do GitHub, monta o arquivo só durante a compilação e não mostra a senha nos logs.

| Segredo (Settings › Secrets and variables › Actions) | Conteúdo |
| --- | --- |
| `KEYSTORE_BASE64` | A chave `meu-dinheiro.keystore` em base64, numa linha só |
| `KEYSTORE_PASSWORD` | A senha da chave (a mesma para o arquivo e para o alias `meudinheiro`) |

Para gerar o base64 da chave:

```bash
base64 -w0 meu-dinheiro.keystore > KEYSTORE_BASE64.txt     # Linux
base64 -i meu-dinheiro.keystore | tr -d '\n' > KEYSTORE_BASE64.txt   # macOS
```

Sem os segredos, o fluxo roda os testes e o site, mas avisa que o APK não foi gerado. Se o base64 ou a senha estiverem errados, o passo *Chave de assinatura* para com uma mensagem dizendo qual dos dois conferir.

Guarde a chave e a senha em dois lugares seguros fora do GitHub (por exemplo, um gerenciador de senhas e um pendrive). **Se a chave for perdida**, um APK novo terá outra assinatura e o Android não deixa instalar por cima: cada pessoa terá de fazer backup, desinstalar, instalar e restaurar.

Pull requests vindos de *forks* não recebem os segredos, então não geram APK. Os do próprio repositório geram.

### Configuração inicial do repositório (uma vez)

| Onde | O quê |
| --- | --- |
| Settings › Pages | *Source*: **GitHub Actions** (o fluxo tenta ativar sozinho) |
| Settings › Secrets and variables › Actions | `KEYSTORE_BASE64` e `KEYSTORE_PASSWORD`, como acima |

## Compilar o APK no computador

```bash
npm ci
npx cap sync android
cp /caminho/seguro/meu-dinheiro.keystore android/app/
cd android
KEYSTORE_PASSWORD='<senha>' VERSION_NAME=1.1.0 VERSION_CODE=1000 ./gradlew assembleRelease
```

A chave copiada para `android/app/` está no `.gitignore`; apague depois de compilar. O APK sai em `android/app/build/outputs/apk/release/app-release.apk`. Sem `VERSION_NAME`, a versão fica `0.0.0-local`. Use um `VERSION_CODE` maior que o do APK instalado, senão o Android recusa a atualização.

Para abrir no Android Studio: `npx cap open android`.

## Capturas de tela

As imagens de `docs/img/` são geradas pelo próprio app, com os dados de exemplo:

```bash
npm run capturas
```

O script `testes/capturas.js` abre o app num celular de 390 × 844 px (imagens em 2x) e num computador de 1280 × 800 px e salva 16 telas. Rode de novo sempre que uma tela mudar.

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
