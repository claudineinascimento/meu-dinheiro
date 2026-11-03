# Meu Dinheiro

Controle financeiro pessoal: receitas, despesas fixas e variáveis, parcelamentos, empréstimos (eu devo / me devem), investimentos, backup, PIN e digital.

Desenvolvido por **Claudinei Nascimento**.

## Instalar

- **Android (APK):** baixe [meu-dinheiro.apk](../../releases/latest/download/meu-dinheiro.apk), abra o arquivo e permita a instalação quando o Android pedir.
- **Android ou iPhone (app web):** abra o site do GitHub Pages deste repositório e use *Instalar app* (Chrome) ou *Compartilhar › Adicionar à Tela de Início* (Safari).

Os dados ficam salvos no próprio aparelho. Faça backup em **Mais › Backup**.

## Estrutura

- `www/` – o app (HTML, manifesto, service worker, ícones).
- `android/` – projeto Android (Capacitor) que empacota `www/` no APK.
- `.github/workflows/publicar.yml` – a cada push na `main`, publica o site e gera o APK em *Releases*.

O APK é assinado com a chave guardada nos segredos `KEYSTORE_BASE64` e `KEYSTORE_PASSWORD` do repositório.
