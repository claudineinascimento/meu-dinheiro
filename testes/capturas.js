// Gera as capturas de tela de docs/img/: npm run capturas
// Usa os dados de exemplo do app, num celular de 390 x 844 px (imagens em 2x) e num computador de 1280 x 800 px.
const {chromium}=require('playwright');const path=require('path');const {spawn}=require('child_process');
const URL='http://localhost:8766/';
const SAIDA=path.join(__dirname,'..','docs','img');
const srv=spawn(process.execPath,[path.join(__dirname,'servidor.js')],{stdio:'ignore'});

(async()=>{
await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch({args:['--lang=pt-BR']});
const novo=async(opc)=>{const ctx=await b.newContext({locale:'pt-BR',timezoneId:'America/Sao_Paulo',...opc});const p=await ctx.newPage();await p.goto(URL);await p.waitForTimeout(600);
  await p.addStyleTag({content:'#toast-root{display:none!important}'});return {ctx,p}};
// Marca um backup feito agora, para a tela Início mostrar "Backup em dia".
const backupFeito=async p=>{await p.evaluate(()=>localStorage.setItem('md_bk_em',String(Date.now())));await p.reload();await espera(p,700);await p.addStyleTag({content:'#toast-root{display:none!important}'})};
const topo=p=>p.evaluate(()=>window.scrollTo(0,0));
const espera=(p,ms=300)=>p.waitForTimeout(ms);
const foto=async(p,nome)=>{await espera(p,350);await p.screenshot({path:path.join(SAIDA,nome+'.png')});console.log('ok',nome)};
const ir=async(p,v)=>{if(['investimentos','contas','categorias','pessoas','backup','ajuda','seguranca'].includes(v)){await p.click('[data-act="ir"][data-v="mais"]');await espera(p,150)}await p.click(`[data-act="ir"][data-v="${v}"]`);await espera(p)};
const exemplo=async p=>{await p.click('[data-act="carregar-exemplo"]');await espera(p,800);const ok=await p.$('[data-act="confirmar"],.modal .btn.primary');if(ok&&await ok.isVisible()){await ok.click();await espera(p,800)}};

const celular={viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,colorScheme:'light'};

// Celular, tema claro
{const {ctx,p}=await novo(celular);await exemplo(p);
 await ir(p,'inicio');await topo(p);await foto(p,'aviso-backup');
 await backupFeito(p);await ir(p,'inicio');await topo(p);await foto(p,'inicio');
 await p.click('[data-act="olho"][data-v="saldo"]');await espera(p);await topo(p);await foto(p,'olho');
 await p.click('[data-act="olho"][data-v="saldo"]');await espera(p);
 await ir(p,'lancamentos');await foto(p,'lancamentos');
 await p.click('.fab');await espera(p);await p.fill('#lf-valor','45,90');await p.fill('#lf-desc','Mercado da semana');await foto(p,'novo-lancamento');
 await p.click('[data-act="fechar"]').catch(()=>p.keyboard.press('Escape'));await espera(p);
 await ir(p,'emprestimos');await foto(p,'emprestimos');
 await p.click('[data-act="abrir-emp"]');await espera(p);await foto(p,'emprestimo-parcelas');
 await p.click('[data-act="fechar"]').catch(()=>p.keyboard.press('Escape'));await espera(p);
 await ir(p,'investimentos');await foto(p,'investimentos');
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await foto(p,'investimentos-painel');
 await ir(p,'mais');await foto(p,'mais');
 await ir(p,'backup');await foto(p,'backup');
 // PIN: criar, ver o código de recuperação, bloquear e abrir "Esqueci o PIN"
 await ir(p,'mais');await p.click('[data-act="abrir-seg"]');await espera(p);
 await p.fill('#sg-novo','2580');await p.fill('#sg-conf','2580');await p.click('[data-act="sg-criar"]');await espera(p,900);
 await foto(p,'codigo-recuperacao');
 await p.click('[data-act="cod-ok"]');await espera(p);
 await p.fill('#sg-perg','Qual o nome do seu primeiro animal de estimação?');await p.fill('#sg-resp','Totó');await p.fill('#sg-rpin','2580');await p.click('[data-act="sg-perg-salvar"]');await espera(p,1300);
 await p.evaluate(()=>{const s=document.querySelector('.sheet .body,.sheet');if(s)s.scrollTop=0});await foto(p,'seguranca');
 await p.click('[data-act="fechar"]');await espera(p);
 await p.click('#lockbtn');await espera(p,500);await foto(p,'bloqueio');
 await p.click('[data-act="pin-esqueci"]');await espera(p,400);await foto(p,'esqueci-pin');
 await ctx.close()}

// Celular, tema escuro
{const {ctx,p}=await novo({...celular,colorScheme:'dark'});await exemplo(p);await backupFeito(p);await ir(p,'inicio');await foto(p,'inicio-escuro');await ctx.close()}

// Computador
{const {ctx,p}=await novo({viewport:{width:1280,height:800},colorScheme:'light'});await exemplo(p);await backupFeito(p);await ir(p,'inicio');await foto(p,'computador');await ctx.close()}

await b.close();srv.kill();
})().catch(e=>{console.error(e);srv.kill();process.exit(1)});
