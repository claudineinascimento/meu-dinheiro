# Segurança e privacidade

## Onde ficam os dados

| Versão | Onde os dados ficam | Quem acessa |
| --- | --- | --- |
| APK (Android) | Armazenamento interno do app no celular | Só o app |
| PWA (site instalado) | Armazenamento do navegador no aparelho | Só o app, naquele navegador |
| Versão no Claude | Banco de dados da página, na área privada da sua conta | Só você, com seu login |

O app **não envia dados para nenhum servidor** nas versões APK e PWA. A única conexão externa é para baixar a fonte de letras (Google Fonts) na primeira abertura. Sem internet, o app usa a fonte do sistema.

Como os dados ficam no aparelho, **o backup é sua responsabilidade**. Desinstalar o app ou limpar os dados do navegador apaga tudo. No Android, o backup automático do Google pode incluir os dados do app quando estiver ativado no celular, mas não conte só com ele.

## PIN

- De 4 a 6 números. PINs fáceis (todos iguais ou em sequência, como `1234` e `9876`) são recusados.
- O PIN **não é guardado**. O app guarda só um resumo criptográfico: PBKDF2 com SHA‑256, 120.000 iterações e um sal aleatório por PIN. Quem copiar os dados não lê o PIN.
- Após 5 erros seguidos, o app pausa as tentativas por 30 segundos, dobrando a cada novo erro até 15 minutos.
- **Bloqueio automático**: ao sair do app (padrão) ou após 1, 5 ou 15 minutos sem uso. O cadeado no topo bloqueia na hora.
- Enquanto bloqueado, o conteúdo fica coberto e inacessível ao toque e ao teclado.

## Digital

| Versão | Como funciona |
| --- | --- |
| APK | Usa o leitor do Android (BiometricPrompt) pelo plugin `@aparajita/capacitor-biometric-auth`. É pedida sozinha ao abrir o app. |
| PWA | Usa o leitor do aparelho pelo padrão WebAuthn, com verificação do usuário obrigatória. |
| Versão no Claude | Depende do navegador liberar o WebAuthn dentro da página. Se não liberar, o app avisa e você usa o PIN. |

A digital é ativada **por aparelho** e fica registrada só nele. O PIN continua valendo como alternativa.

## Esqueci o PIN

Na tela de bloqueio, **Esqueci o PIN** pede para digitar `REDEFINIR` e então remove o PIN e a digital, sem apagar os dados.

## O que o PIN protege, e o que não protege

O PIN protege contra quem pega o celular **já desbloqueado** e abre o app: um curioso, um filho, alguém no trabalho. Ele não substitui a segurança do próprio celular. A opção *Esqueci o PIN* existe para você não perder o acesso aos seus dados, então quem conhece o app consegue tirar o PIN e entrar.

Para proteção forte:

1. Use bloqueio de tela no celular (senha, digital ou rosto).
2. Mantenha o celular atualizado.
3. Guarde os arquivos de backup em local protegido. Eles contêm todos os seus dados financeiros, sem criptografia.

## Assinatura do APK

O APK é assinado com uma chave própria do app. Ela garante que só versões geradas por este projeto instalam por cima da versão atual. A chave fica fora do repositório, nos segredos do GitHub `KEYSTORE_BASE64` e `KEYSTORE_PASSWORD`, com uma cópia guardada pelo dono do projeto. Perder a chave obriga a desinstalar o app (depois de fazer backup) para instalar uma nova versão.

## Permissões do APK

O APK não pede acesso a contatos, localização, câmera ou arquivos. Usa só internet (fontes), biometria e o menu de compartilhar do Android.
