const {chromium}=require('playwright');const fs=require('fs');
const URL='http://localhost:8765/app.html';
const results=[];let fails=0;
const ok=(cond,msg)=>{results.push((cond?'PASS ':'FAIL ')+msg);if(!cond)fails++};
const money=s=>{s=(s||'').replace(/[^\d,\-−]/g,'').replace('−','-').replace(',','.');return Number(s)};
(async()=>{
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true});
await ctx.addInitScript({content:fs.readFileSync(__dirname+'/mock.js','utf8')});
const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const wait=(ms=150)=>p.waitForTimeout(ms);
const saldo=async()=>{await p.click('[data-act="ir"][data-v="inicio"]');await wait();return money(await p.textContent('.hero .big'))};
const go=async v=>{if(['investimentos','contas','categorias','pessoas','backup','ajuda'].includes(v)){await p.click('[data-act="ir"][data-v="mais"]');}await p.click(`[data-act="ir"][data-v="${v}"]`);await wait()};
const overflow=async()=>p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
const novoLanc=async({tipo='despesa',valor,cat,conta='Conta corrente',dest,pago=true,rep,n,desc,fixo})=>{
  await p.click('.fab');await wait();
  if(tipo!=='despesa'){await p.click(`[data-act="lf-tipo"][data-v="${tipo}"]`);await wait(80)}
  await p.fill('#lf-valor',valor);if(desc)await p.fill('#lf-desc',desc);
  if(cat)await p.selectOption('#lf-cat',{label:cat});
  await p.selectOption('#lf-conta',{label:conta});if(dest)await p.selectOption('#lf-dest',{label:dest});
  if(fixo)await p.click('[data-act="lf-nat"][data-v="fixo"]');
  if(!pago)await p.uncheck('#lf-pago');
  if(rep){await p.selectOption('#lf-rep',rep);await p.fill('#lf-n',String(n))}
  await p.click('[data-act="lf-salvar"]');await wait(250);
};
await p.goto(URL);await wait(600);
ok(!(await p.$('.lock')),'Abre sem bloqueio quando não há PIN');
ok(await p.isVisible('text=Comece pelo seu primeiro lançamento'),'Tela inicial vazia orienta o primeiro lançamento');
// conta com saldo inicial
await go('contas');await p.click('text=Conta corrente');await p.fill('#cf-saldo','1.000,00');await p.click('[data-act="cf-salvar"]');await wait(250);
let s=await saldo();ok(s===1000,'Saldo inicial da conta: '+s);
await novoLanc({valor:'45,90',cat:'Mercado',desc:'Mercado'});s=await saldo();ok(Math.abs(s-954.10)<.001,'Despesa paga reduz o saldo: '+s);
await novoLanc({tipo:'receita',valor:'3.500',cat:'Salário'});s=await saldo();ok(Math.abs(s-4454.10)<.001,'Receita aumenta o saldo: '+s);
await novoLanc({valor:'600',cat:'Compras e vestuário',desc:'Tênis',rep:'parcelar',n:3});s=await saldo();ok(Math.abs(s-4254.10)<.001,'Parcelado: só a 1ª parcela entra paga: '+s);
let cnt=await p.evaluate(()=>0);
await novoLanc({valor:'1200',cat:'Moradia',desc:'Aluguel',pago:false,rep:'mensal',n:12});s=await saldo();ok(Math.abs(s-4254.10)<.001,'Repetição pendente não mexe no saldo: '+s);
const heroDes=money((await p.textContent('.hero-row div:nth-child(2) b')));ok(Math.abs(heroDes-(45.9+200+1200))<.001,'Despesas do mês somam previstas: '+heroDes);
await go('lancamentos');
ok(await p.locator('.row',{hasText:'Aluguel'}).count()===1,'Aluguel aparece uma vez no mês');
await p.locator('.row',{hasText:'Aluguel'}).locator('[data-act="toggle-pago"]').click();await wait(200);
s=await saldo();ok(Math.abs(s-3054.10)<.001,'Marcar como pago desconta do saldo: '+s);
await novoLanc({tipo:'transferencia',valor:'100',conta:'Conta corrente',dest:'Carteira'});s=await saldo();ok(Math.abs(s-3054.10)<.001,'Transferência não muda o saldo total: '+s);
await go('contas');const cart=money(await p.locator('.row',{hasText:'Carteira'}).locator('.row-end b').textContent());ok(cart===100,'Carteira recebeu a transferência: '+cart);
// editar
await go('lancamentos');await p.locator('.row',{hasText:'Mercado'}).first().locator('.row-main').click();await wait();await p.fill('#lf-valor','50');await p.click('[data-act="lf-salvar"]');await wait(250);
s=await saldo();ok(Math.abs(s-3050)<.001,'Editar valor atualiza o saldo: '+s);
// excluir série
await go('lancamentos');await p.locator('.row',{hasText:'Aluguel'}).locator('.row-main').click();await wait();await p.click('[data-act="lf-excluir"]');await wait();
ok(await p.isVisible('text=Este e os 11 próximos'),'Oferece excluir a série inteira');
await p.click('[data-act="lf-del-todos"]');await wait(250);
s=await saldo();ok(Math.abs(s-4250)<.001,'Excluir série devolve o saldo: '+s);
// próximo mês e filtros
await go('lancamentos');await p.click('[data-act="mes-prox"]');await wait();await p.click('[data-act="filtro"][data-v="pendente"]');await wait();
ok(await p.locator('.row',{hasText:'2/3'}).count()===1,'Parcela 2/3 pendente no mês seguinte');
ok(await p.locator('.row',{hasText:'Aluguel'}).count()===0,'Série de aluguel excluída nos meses seguintes');
await p.click('[data-act="mes-ant"]');await p.click('[data-act="filtro"][data-v="todos"]');await p.fill('#busca','merc');await wait();
ok(await p.locator('#view .row').count()===1,'Busca encontra "Mercado"');
await p.fill('#busca','');
// empréstimo devo com juros
await go('emprestimos');await p.click('[data-act="novo-emp"]');await wait();await p.fill('#ef-cp','Banco X');await p.fill('#ef-valor','2000');await p.fill('#ef-taxa','2');await wait(80);
ok((await p.inputValue('#ef-parc'))==='222,65','Parcela pela tabela Price: '+await p.inputValue('#ef-parc'));
await p.selectOption('#ef-conta',{label:'Conta corrente'});await p.click('[data-act="ef-salvar"]');await wait(300);
s=await saldo();ok(Math.abs(s-6250)<.001,'Dinheiro do empréstimo entra na conta: '+s);
ok(Math.abs(money(await p.textContent('.hero-row div:nth-child(1) b'))-3500)<.001,'Empréstimo recebido não conta como receita');
await go('emprestimos');await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-pagar"] >> nth=0');await wait();await p.click('[data-act="ed-confirmar"]');await wait(300);
ok(await p.isVisible('text=Paga em'),'Parcela marcada como paga');await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-(6250-222.65))<.001,'Pagar parcela desconta: '+s);
await go('lancamentos');await p.locator('.row',{hasText:'Parcela Banco X'}).locator('[data-act="toggle-pago"]').click();await wait();
ok(await p.isVisible('text=Lançamento automático'),'Lançamento de parcela não é alterado por fora do empréstimo');await p.click('[data-act="fechar"]');
await go('emprestimos');await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-desfazer"]');await p.click('[data-act="ed-desfazer-ok"]');await wait(300);await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-6250)<.001,'Desfazer pagamento devolve o saldo: '+s);
// me devem
await go('emprestimos');await p.click('[data-act="emp-aba"][data-v="medevem"]');await p.click('[data-act="novo-emp"]');await wait();await p.fill('#ef-cp','João');await p.fill('#ef-valor','500');await p.fill('#ef-n','5');await wait(50);
await p.selectOption('#ef-conta',{label:'Conta corrente'});await p.click('[data-act="ef-salvar"]');await wait(300);
await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-pagar"] >> nth=0');await p.click('[data-act="ed-confirmar"]');await wait(300);await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-5850)<.001,'Emprestar e receber 1 parcela: '+s);
const medevem=money(await p.locator('.card.stat',{hasText:'Me devem'}).locator('b').textContent());ok(medevem===400,'Me devem: '+medevem);
await go('pessoas');ok(await p.isVisible('text=Te deve R$ 400,00'),'Pessoa João mostra o saldo devido');
// investimentos
await go('investimentos');await p.click('[data-act="novo-inv"]');await p.fill('#if-nome','Reserva');await p.selectOption('#if-tipo','reserva');await p.click('[data-act="if-salvar"]');await wait(250);
await p.click('[data-act="abrir-inv"]');await wait();await p.fill('#im-valor','300');await p.selectOption('#im-conta',{label:'Conta corrente'});await p.click('[data-act="im-salvar"]');await wait(250);
await p.click('[data-act="im-tipo"][data-v="resgate"]');await p.fill('#im-valor','100');await p.selectOption('#im-conta',{label:'Conta corrente'});await p.click('[data-act="im-salvar"]');await wait(250);
await p.click('[data-act="im-tipo"][data-v="rendimento"]');await p.fill('#im-valor','5');await p.click('[data-act="im-salvar"]');await wait(250);await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-5650)<.001,'Aporte sai e resgate volta para a conta: '+s);
const inv=money(await p.locator('.card.stat',{hasText:'Investido'}).locator('b').textContent());ok(inv===205,'Total investido com rendimento: '+inv);
ok(Math.abs(money(await p.textContent('.hero-row div:nth-child(2) b'))-(50+200))<.001,'Aporte não conta como gasto');
// olho: ocultar saldo e investido
await p.click('.hero [data-act="olho"]');await wait();ok((await p.textContent('.hero .big')).includes('••••'),'Olho oculta o saldo');
ok(!(await p.locator('.card.stat',{hasText:'Investido'}).locator('b').textContent()).includes('••••'),'Saldo oculto não esconde o investido');
await p.locator('.inv-card [data-act="olho"]').click();await wait();ok((await p.locator('.card.stat',{hasText:'Investido'}).locator('b').textContent()).includes('••••'),'Olho oculta o total investido');
await p.reload();await wait(600);ok((await p.textContent('.hero .big')).includes('••••'),'Preferência do olho fica salva');
await go('investimentos');ok((await p.textContent('.hero .big')).includes('••••'),'Investimentos também ficam ocultos');
await p.click('.hero [data-act="olho"]');await wait();ok(!(await p.textContent('.hero .big')).includes('••••'),'Olho mostra de novo o investido');
await go('inicio');await p.click('.hero [data-act="olho"]');await wait();ok(money(await p.textContent('.hero .big'))===5650,'Olho mostra de novo o saldo');
// painel de investimentos
await go('investimentos');
ok(await p.isVisible('text=Distribuição')&&await p.isVisible('text=Evolução')&&await p.isVisible('text=Reserva de emergência')&&await p.isVisible('text=Liquidez'),'Painel mostra distribuição, evolução, reserva e liquidez');
ok(money(await p.textContent('.hero-row div:nth-child(2) b'))===5,'Painel soma os rendimentos');
ok((await p.textContent('.hero-row div:nth-child(3) b')).includes('1,7%'),'Rentabilidade sobre o aplicado: '+await p.textContent('.hero-row div:nth-child(3) b'));
ok(await p.locator('.evo button').count()===12,'Gráfico de evolução com 12 meses');
await p.click('[data-act="abrir-inv"]');await wait();await p.click('[data-act="im-tipo"][data-v="resgate"]');await p.fill('#im-valor','999');await p.selectOption('#im-conta',{label:'Conta corrente'});await p.click('[data-act="im-salvar"]');await wait(200);
ok((await p.textContent('#toast-root')).includes('maior que o saldo'),'Não deixa resgatar mais que o saldo');
await p.click('[data-act="im-editar"]');await wait();await p.fill('#if-nome','Reserva Nubank');await p.click('[data-act="if-salvar"]');await wait(250);await p.click('[data-act="fechar"]');
ok(await p.isVisible('text=Reserva Nubank'),'Editar aplicação muda o nome');
// categoria
await go('categorias');await p.click('[data-act="nova-cat"]');await p.fill('#cg-nome','Farmácia');await p.selectOption('#cg-grupo','essencial');await p.click('[data-act="cg-ico"][data-v="heart"]');await p.click('[data-act="cg-salvar"]');await wait(200);
await p.click('.fab');await wait();ok((await p.locator('#lf-cat option',{hasText:'Farmácia'}).count())===1,'Nova categoria aparece no lançamento');await p.click('[data-act="fechar"]');
// validação
await p.click('.fab');await wait();await p.click('[data-act="lf-salvar"]');ok((await p.textContent('#lf-err')).includes('valor'),'Valida valor vazio');await p.click('[data-act="fechar"]');
// backup
await go('inicio');ok(await p.isVisible('text=Você ainda não fez backup'),'Início avisa que nunca fez backup');
await p.click('[data-act="bk-adiar"]');await wait();ok(!(await p.isVisible('text=Você ainda não fez backup')),'Aviso de backup pode ser adiado');
await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('md_bk_pref'));o.adiarAte=0;localStorage.setItem('md_bk_pref',JSON.stringify(o))});
await go('backup');ok(await p.isVisible('text=Nenhum backup feito'),'Backup mostra que nunca foi feito');await p.click('[data-act="exp-json"]');await wait(200);await p.click('[data-act="exp-csv"]');await wait(200);
ok(await p.isVisible('text=Último backup:'),'Backup mostra a data do último backup');
await go('inicio');ok(await p.isVisible('text=Backup em dia'),'Início mostra backup em dia');
await p.click('[data-act="bk-ocultar"]');await wait();ok(!(await p.isVisible('text=Backup em dia')),'Informação de backup pode ser ocultada');
await go('backup');await p.uncheck('#bk-mostrar');await wait();ok(JSON.parse(await p.evaluate(()=>localStorage.getItem('md_bk_pref'))).mostrar===false,'Lembrete de backup pode ser desligado');await p.check('#bk-mostrar');
const saved=await p.evaluate(()=>window.__saved);ok(saved.length===2&&saved[0].filename.endsWith('.json')&&saved[1].text.includes('Mercado'),'Backup JSON e CSV gerados');
const before=await p.evaluate(()=>JSON.parse(window.__saved[0].text).dados.lancamentos.length);
await go('lancamentos');await p.locator('.row',{hasText:'Mercado'}).first().locator('.row-main').click();await p.click('[data-act="lf-excluir"]');await p.click('[data-act="lf-del-um"]');await wait(200);
await go('backup');fs.writeFileSync(require('os').tmpdir()+'/bk.json',saved[0].text);await p.setInputFiles('#imp-file',require('os').tmpdir()+'/bk.json');await wait(200);await p.click('[data-act="imp-ok"]');await wait(500);
s=await saldo();ok(Math.abs(s-5650)<.001,'Restaurar backup recupera os dados: '+s);
// tema
const th=[];for(let i=0;i<3;i++){await p.click('#themebtn');th.push(await p.evaluate(()=>document.documentElement.getAttribute('data-theme')))}
ok(th.join(',')==='light,dark,','Botão único alterna claro, escuro e automático: '+th.join(','));
// overflow em todas as telas
for(const v of ['inicio','lancamentos','emprestimos','investimentos','contas','categorias','pessoas','backup','ajuda','mais']){await go(v);ok(!(await overflow()),'Sem rolagem lateral em '+v)}
// ---------- PIN ----------
await go('mais');await p.click('[data-act="abrir-seg"]');await wait();
await p.fill('#sg-novo','1234');await p.fill('#sg-conf','1234');await p.click('[data-act="sg-criar"]');await wait(300);ok((await p.textContent('#sg-err')).includes('fácil'),'Recusa PIN fácil');
await p.fill('#sg-novo','2580');await p.fill('#sg-conf','2581');await p.click('[data-act="sg-criar"]');await wait(300);ok((await p.textContent('#sg-err')).includes('iguais'),'Recusa PINs diferentes');
await p.fill('#sg-novo','2580');await p.fill('#sg-conf','2580');await p.click('[data-act="sg-criar"]');await wait(800);
const codigo=(await p.textContent('#rc-codigo')).trim();ok(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(codigo),'Criar PIN mostra o código de recuperação: '+codigo);
ok(!(await p.evaluate(()=>localStorage.getItem('mockdb'))).includes(codigo.replace(/-/g,'')),'Código não é guardado em texto');
await p.click('[data-act="cod-ok"]');await wait(300);ok(await p.isVisible('text=PIN ativo'),'PIN criado');
await p.fill('#sg-perg','Qual o nome do seu primeiro animal de estimação?');await p.fill('#sg-resp','Totó');await p.click('[data-act="sg-perg-salvar"]');await wait(800);
ok((await p.textContent('#sg-rec-err')).includes('PIN atual'),'Mudar a recuperação pede o PIN atual');
await p.fill('#sg-rpin','2580');await p.click('[data-act="sg-perg-salvar"]');await wait(1200);ok(await p.isVisible('text=Trocar a pergunta'),'Pergunta de segurança salva');
await p.click('[data-act="fechar"]');ok(await p.isVisible('#lockbtn'),'Cadeado aparece no topo');
await p.click('#lockbtn');await wait();ok(await p.isVisible('.lock'),'Bloquear agora mostra a tela de PIN');
await p.keyboard.press('Escape');ok(await p.isVisible('.lock'),'Esc não fecha o bloqueio');
for(const d of '1111')await p.click(`[data-act="pin-key"][data-v="${d}"]`);await wait(700);
ok((await p.textContent('#pin-msg')).includes('incorreto'),'PIN errado avisa');
for(const d of '2580')await p.click(`[data-act="pin-key"][data-v="${d}"]`);await wait(700);ok(!(await p.$('.lock')),'PIN certo desbloqueia');
await p.screenshot({path:require('os').tmpdir()+'/e2e-home.png'});
await p.reload();await wait(300);ok(await p.isVisible('.lock'),'Ao abrir de novo, pede o PIN');
ok(await p.evaluate(()=>document.getElementById('view').hasAttribute('inert')),'Conteúdo fica inacessível atrás do bloqueio');
ok(await p.evaluate(()=>document.getElementById('view').innerHTML==='' ),'Valores não ficam na página enquanto bloqueado');
await p.screenshot({path:require('os').tmpdir()+'/e2e-lock.png'});
await p.keyboard.type('2580');await wait(800);ok(!(await p.$('.lock')),'Desbloqueia pelo teclado físico');
// tentativas
await p.click('#lockbtn');for(let i=0;i<5;i++){for(const d of '0000')await p.click(`[data-act="pin-key"][data-v="${d}"]`);await wait(600)}
ok((await p.textContent('#pin-msg')).includes('Aguarde'),'5 erros pausam as tentativas');
ok(await p.isDisabled('[data-act="pin-key"][data-v="2"]'),'Teclado travado durante a pausa');
await p.evaluate(()=>localStorage.setItem('md_tent',JSON.stringify({n:5,ate:Date.now()-1})));await wait(1200);
for(const d of '2580')await p.click(`[data-act="pin-key"][data-v="${d}"]`);await wait(800);ok(!(await p.$('.lock')),'Depois da pausa, o PIN certo funciona');
// digital (autenticador virtual)
const cdp=await ctx.newCDPSession(p);await cdp.send('WebAuthn.enable');
await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true}});
await p.reload();await wait(300);await p.keyboard.type('2580');await wait(800);
await go('mais');await p.click('[data-act="abrir-seg"]');await wait(300);
ok(await p.isVisible('[data-act="sg-bio-on"]'),'Oferece ativar digital quando o aparelho suporta');
await p.click('[data-act="sg-bio-on"]');await wait(600);ok((await p.textContent('#sg-bio-msg')).includes('PIN atual'),'Ativar a digital pede o PIN');
await p.fill('#sg-bio-pin','2580');await p.click('[data-act="sg-bio-on"]');await wait(800);ok(await p.isVisible('text=Ativa neste aparelho'),'Digital ativada');
await p.click('[data-act="fechar"]');await p.click('#lockbtn');await wait();ok(await p.isVisible('[data-act="pin-bio"]'),'Botão de digital na tela de bloqueio');
await p.click('[data-act="pin-bio"]');await wait(800);ok(!(await p.$('.lock')),'Desbloqueia com a digital');
// auto bloqueio ao sair
await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await wait();ok(await p.isVisible('.lock'),'Bloqueia sozinho ao sair do app');
// esqueci: sem atalho que libere o app
await p.click('[data-act="pin-esqueci"]');await wait();
ok(await p.isVisible('[data-act="rc-bio"]')&&await p.isVisible('[data-act="rc-ir-codigo"]')&&await p.isVisible('[data-act="rc-ir-pergunta"]')&&await p.isVisible('[data-act="rc-ir-apagar"]'),'Esqueci o PIN oferece digital, código, pergunta e apagar');
ok(!(await p.isVisible('text=REDEFINIR')),'Não existe mais o atalho que tirava o PIN sem provar quem é');
await p.click('[data-act="rc-ir-pergunta"]');await p.fill('#rc-input','rex');await p.click('[data-act="rc-confirmar"]');await wait(800);
ok((await p.textContent('#pin-msg')).includes('incorreta')&&await p.isVisible('.lock'),'Resposta errada não libera');
await p.fill('#rc-input','  TOTO ');await p.click('[data-act="rc-confirmar"]');await wait(800);
ok(!(await p.$('.lock'))&&await p.isVisible('text=Criar um PIN novo'),'Resposta certa (sem acento e maiúsculas) leva a criar PIN novo');
await p.click('[data-act="fechar"]');await p.click('#lockbtn');await wait();
await p.click('[data-act="pin-esqueci"]');await p.click('[data-act="rc-ir-codigo"]');await p.fill('#rc-input','AAAA-BBBB-CCCC');await p.keyboard.press('Enter');await wait(800);
ok((await p.textContent('#pin-msg')).includes('incorreto'),'Código errado não libera');
await p.fill('#rc-input',codigo.toLowerCase().replace(/-/g,' '));await p.click('[data-act="rc-confirmar"]');await wait(800);
ok(!(await p.$('.lock'))&&await p.isVisible('text=Código confirmado'),'Código de recuperação libera para criar PIN novo');
await p.fill('#sg-novo','1470');await p.fill('#sg-conf','1470');await p.click('[data-act="sg-redef"]');await wait(1200);
const codigo2=(await p.textContent('#rc-codigo')).trim();ok(codigo2!==codigo,'Código usado é trocado por um novo');await p.click('[data-act="cod-ok"]');await wait(300);await p.click('[data-act="fechar"]');
await p.reload();await wait(600);ok(await p.isVisible('.lock'),'PIN continua ativo depois da recuperação');
await p.keyboard.type('2580');await wait(800);ok(await p.isVisible('.lock'),'PIN antigo não vale mais');
await p.keyboard.type('1470');await wait(800);ok(!(await p.$('.lock')),'PIN novo desbloqueia');
s=await saldo();ok(Math.abs(s-5650)<.001,'Dados preservados depois de recuperar o PIN: '+s);
// apagar tudo
await p.click('#lockbtn');await p.click('[data-act="pin-esqueci"]');await p.click('[data-act="rc-ir-apagar"]');await p.fill('#rc-input','x');await p.click('[data-act="rc-apagar"]');
ok((await p.textContent('#rc-err')).includes('APAGAR')&&await p.isVisible('.lock'),'Apagar exige digitar APAGAR');
await p.fill('#rc-input','apagar');await p.click('[data-act="rc-apagar"]');await wait(600);ok(!(await p.$('.lock')),'Apagar tudo libera o app');
s=await saldo();ok(s===0,'Apagar tudo zera os dados: '+s);
await p.reload();await wait(600);ok(!(await p.$('.lock')),'Sem PIN depois de apagar tudo');
// telas estreitas e escuro
await p.setViewportSize({width:320,height:640});for(const v of ['inicio','lancamentos','emprestimos']){await go(v);ok(!(await overflow()),'Sem rolagem lateral a 320px em '+v)}
// modo local
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push('local: '+e.message));await p2.goto(URL+'#local');await wait(600);
await p2.click('[data-act="ir"][data-v="mais"]');ok(await p2.isVisible('text=salvos só neste aparelho'),'Modo local avisa onde ficam os dados');await p2.click('[data-act="ir"][data-v="inicio"]');
await p2.click('[data-act="carregar-exemplo"]');await wait(300);ok(await p2.isVisible('text=dados de exemplo'),'Exemplo carrega no modo local');
await p2.click('[data-act="apagar-exemplo"]');await wait(200);ok(!(await p2.isVisible('text=dados de exemplo')),'Apagar exemplos funciona');
const dk=await b.newPage({viewport:{width:390,height:844},colorScheme:'dark'});await dk.addInitScript({content:fs.readFileSync(__dirname+'/mock.js','utf8')});
ok(errs.length===0,'Sem erros no console: '+JSON.stringify(errs));
console.log(results.join('\n'));console.log(`\n${results.length-fails}/${results.length} passaram`);
await b.close();})().catch(e=>{console.log(results.join('\n'));console.log('ERRO',e.message);process.exit(1)});
