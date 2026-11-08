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
const go=async v=>{if(['investimentos','contas','categorias','pessoas','backup','ajuda','sobre'].includes(v)){await p.click('[data-act="ir"][data-v="mais"]');}await p.click(`[data-act="ir"][data-v="${v}"]`);await wait()};
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
await go('contas');await p.click('text=Conta corrente');await wait();await p.click('[data-act="ct-editar"]');await p.fill('#cf-saldo','1.000,00');await p.click('[data-act="cf-salvar"]');await wait(250);
ok(await p.isVisible('.sheet >> text=R$ 1.000,00'),'Depois de salvar, a conta mostra o saldo atualizado');await p.click('[data-act="fechar"]');
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
// pagamento extra (amortização), reduzir parcela e quitação antecipada
await go('emprestimos');await p.click('[data-act="abrir-emp"]');await wait();
await p.click('[data-act="ed-extra"]');await wait();await p.fill('#am-valor','500');await wait(100);
ok((await p.textContent('#am-sim')).includes('Elimina'),'Valor extra mostra o efeito antes de confirmar: '+await p.textContent('#am-sim'));
await p.click('[data-act="am-ok"]');await wait(300);
const antec=await p.locator('.sheet .pill',{hasText:'Antecipada'}).count();ok(antec>=2,'Valor extra reduzindo o prazo antecipa as últimas parcelas: '+antec);
ok(await p.isVisible('text=Pagamentos extras'),'Histórico de pagamentos extras');
await p.click('[data-act="fechar"]');s=await saldo();ok(Math.abs(s-5750)<.001,'Valor extra sai da conta: '+s);
await go('emprestimos');const devedor=money(await p.locator('.row',{hasText:'Banco X'}).locator('.row-end b').textContent());ok(devedor<2226.5-500,'Saldo devedor cai mais que o valor pago (juros economizados): '+devedor);
await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-am-desf"]');await wait(300);await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-6250)<.001,'Desfazer o valor extra devolve o saldo: '+s);
await go('emprestimos');await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-extra"]');await p.click('[data-act="am-modo"][data-v="parcela"]');await p.fill('#am-valor','1000');await wait(100);
const simP=await p.textContent('#am-sim');ok(simP.includes('222,65')&&simP.includes('10 parcelas'),'Reduzir a parcela mostra a parcela nova: '+simP);
await p.click('[data-act="am-ok"]');await wait(300);
const nova=money(await p.locator('.sheet .inst').first().locator('b').textContent());ok(nova>100&&nova<125,'Parcela menor com o mesmo prazo: '+nova);
await p.click('[data-act="ed-am-desf"]');await wait(300);
await p.click('[data-act="ed-quitar"]');await wait();const vq=money(await p.inputValue('#am-valor'));
ok(vq<2226.5&&vq>1900,'Quitação antecipada sai com desconto dos juros: '+vq);ok((await p.textContent('#am-sim')).includes('desconto'),'Quitação mostra o desconto');
await p.click('[data-act="am-ok"]');await wait(300);await p.click('[data-act="fechar"]');
await go('emprestimos');ok(await p.locator('.row',{hasText:'Banco X'}).locator('text=Quitado').count()===1,'Empréstimo aparece quitado');
await p.click('[data-act="abrir-emp"]');await wait();await p.click('[data-act="ed-am-desf"]');await wait(300);await p.click('[data-act="fechar"]');
s=await saldo();ok(Math.abs(s-6250)<.001,'Desfazer a quitação devolve o saldo: '+s);
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
// extrato em PDF
await go('lancamentos');await p.click('[data-act="extrato"]');await wait();
ok(await p.isVisible('text=Modelos prontos'),'Extrato oferece modelos prontos');
ok((await p.textContent('#ex-prev')).includes('lançamento'),'Extrato mostra a prévia do filtro');
await p.click('[data-act="ex-pdf"]');await wait(500);
let sv=await p.evaluate(()=>window.__saved.slice(-1)[0]);ok(sv&&sv.filename.endsWith('.pdf')&&sv.text.startsWith('%PDF-1.4')&&sv.text.includes('Extrato de lan'),'Gera o extrato em PDF: '+(sv&&sv.filename));
ok(sv.text.includes('Desenvolvido por Claudinei Nascimento')&&sv.text.includes('Lan'),'PDF com tabela e assinatura no rodapé');
await p.click('[data-act="extrato"]');await wait();await p.click('[data-act="ex-modelo"][data-v="gastos"]');await wait();
ok(await p.getAttribute('[data-act="ex-tipo"][data-v="despesa"]','aria-pressed')==='true','Modelo "Gastos por categoria" filtra despesas');
await p.selectOption('#ex-conta',{label:'Conta corrente'});await p.click('[data-act="ex-tipo"][data-v="todos"]');await wait();await p.click('[data-act="ex-pdf"]');await wait(500);
sv=await p.evaluate(()=>window.__saved.slice(-1)[0]);ok(sv.text.includes('SALDO ANTERIOR')&&sv.text.includes('SALDO FINAL')&&sv.text.includes('ENTRADAS PAGAS')&&sv.text.includes('Saldo'),'Extrato de uma conta traz saldo anterior, linha a linha e final');
await p.click('[data-act="extrato"]');await wait();await p.selectOption('#ex-per','custom');await p.fill('#ex-de','2001-01-01');await p.fill('#ex-ate','2001-01-31');await wait();await p.click('[data-act="ex-pdf"]');await wait(200);
ok((await p.textContent('#ex-err')).includes('Nenhum'),'Extrato sem lançamentos avisa em vez de gerar');await p.click('[data-act="fechar"]');
// tema
const th=[];for(let i=0;i<3;i++){await p.click('#themebtn');th.push(await p.evaluate(()=>document.documentElement.getAttribute('data-theme')))}
ok(th.join(',')==='light,dark,','Botão único alterna claro, escuro e automático: '+th.join(','));
// overflow em todas as telas
for(const v of ['inicio','lancamentos','emprestimos','investimentos','contas','categorias','pessoas','backup','ajuda','sobre','mais']){await go(v);ok(!(await overflow()),'Sem rolagem lateral em '+v)}
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
// auto bloqueio ao sair (passados 3 s da digital: a primeira volta logo após a leitura não bloqueia)
await wait(3200);await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await wait();ok(await p.isVisible('.lock'),'Bloqueia sozinho ao sair do app');
await wait(1200);ok(!(await p.$('.lock')),'Ao voltar, pede a digital sozinho e libera sem digitar o PIN');
// esqueci: sem atalho que libere o app (bloqueio pelo cadeado não pede a digital sozinho)
await p.click('#lockbtn');await wait(900);ok(await p.isVisible('.lock'),'Bloqueio pelo cadeado não pede a digital sozinho');
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
const codigo2=(await p.textContent('#rc-codigo')).trim();ok(codigo2!==codigo,'Código usado é trocado por um novo');await p.click('[data-act="cod-ok"]');await wait(300);
await p.uncheck('#sg-bio-auto');await wait();ok(await p.evaluate(()=>localStorage.getItem('md_bio_auto'))==='0','Dá para desligar o pedido automático da digital');await p.click('[data-act="fechar"]');
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
// contas e cartões com dados
await p2.click('[data-act="ir"][data-v="mais"]');await p2.click('[data-act="ir"][data-v="contas"]');await p2.click('[data-act="nova-conta"]');await wait();
await p2.fill('#cf-nome','Nubank');await p2.selectOption('#cf-tipo','cartao');await wait(100);
await p2.fill('#cf-saldo','350,00');await p2.selectOption('#cf-band','Mastercard');await p2.fill('#cf-final','12');await p2.fill('#cf-lim','2.000,00');await p2.fill('#cf-fech','3');await p2.fill('#cf-venc','10');
await p2.click('[data-act="cf-salvar"]');await wait();ok((await p2.textContent('#cf-err')).includes('4 últimos'),'Final do cartão pede os 4 últimos números');
await p2.fill('#cf-final','1234');await p2.click('[data-act="cf-salvar"]');await wait(250);
let rowN=await p2.locator('.row',{hasText:'Nubank'}).textContent();ok(rowN.includes('•••• 1234')&&rowN.includes('1.650,00 disponível'),'Cartão mostra final e limite disponível: '+rowN);
await p2.locator('.row',{hasText:'Nubank'}).click();await wait();ok(await p2.isVisible('text=Fatura em aberto')&&await p2.isVisible('[data-act="ct-pagar"]'),'Cartão mostra a fatura e o botão Pagar fatura');
await p2.click('[data-act="ct-pagar"]');await wait();ok((await p2.inputValue('#lf-valor'))==='350,00'&&await p2.getAttribute('[data-act="lf-tipo"][data-v="transferencia"]','aria-pressed')==='true','Pagar fatura abre a transferência com o valor da fatura');
await p2.click('[data-act="lf-salvar"]');await wait(250);await p2.click('[data-act="ir"][data-v="mais"]');await p2.click('[data-act="ir"][data-v="contas"]');
ok((await p2.locator('.row',{hasText:'Nubank'}).textContent()).includes('2.000,00 disponível'),'Fatura paga libera o limite');
await p2.locator('.row',{hasText:'Conta corrente'}).click();await wait();await p2.click('[data-act="ct-editar"]');
await p2.fill('#cf-inst','Banco do Brasil');await p2.fill('#cf-ag','1234-5');await p2.fill('#cf-num','98765-4');await p2.selectOption('#cf-pixt','email');await p2.fill('#cf-pix','eu@exemplo.com');await p2.click('[data-act="cf-salvar"]');await wait(250);
ok(await p2.isVisible('.sheet >> text=eu@exemplo.com')&&await p2.isVisible('[data-act="ct-copiar"]'),'Conta guarda banco, agência, conta e Pix');await p2.click('[data-act="fechar"]');
ok((await p2.locator('.row',{hasText:'Conta corrente'}).textContent()).includes('Ag. 1234-5'),'Lista de contas mostra banco e agência');
// sobre
await p2.click('[data-act="ir"][data-v="mais"]');await p2.click('[data-act="ir"][data-v="sobre"]');await wait();
ok((await p2.textContent('#sobre-versao')).includes(require('../package.json').version),'Sobre mostra a versão do package.json');
ok(await p2.isVisible('text=Desenvolvido por')&&await p2.isVisible('text=Novidades da versão'),'Sobre traz novidades e assinatura');
// restaurar padrão de fábrica com o PIN
await p2.click('[data-act="ir"][data-v="mais"]');await p2.click('[data-act="abrir-seg"]');await p2.fill('#sg-novo','3690');await p2.fill('#sg-conf','3690');await p2.click('[data-act="sg-criar"]');await wait(900);await p2.click('[data-act="cod-ok"]');await wait(300);await p2.click('[data-act="fechar"]');
await p2.click('[data-act="fabrica"]');await wait();await p2.fill('#fb-pin','1111');await p2.click('[data-act="fb-ok"]');await wait(800);
ok((await p2.textContent('#fb-err')).includes('incorreto')&&JSON.parse(await p2.evaluate(()=>localStorage.getItem('md_dados_v1'))).contas.length===3,'Restaurar de fábrica recusa PIN errado e não apaga nada');
await p2.fill('#fb-pin','3690');await p2.click('[data-act="fb-ok"]');await wait(800);
const dl=JSON.parse(await p2.evaluate(()=>localStorage.getItem('md_dados_v1')));ok(dl.contas.length===2&&!dl.lancamentos.length&&!dl.contas.some(c=>c.nome==='Nubank'),'Restaurar de fábrica apaga tudo e volta às contas padrão');
ok(!(await p2.evaluate(()=>localStorage.getItem('md_seg')))&&!(await p2.isVisible('#lockbtn')),'Restaurar de fábrica tira o PIN');
const dk=await b.newPage({viewport:{width:390,height:844},colorScheme:'dark'});await dk.addInitScript({content:fs.readFileSync(__dirname+'/mock.js','utf8')});
ok(errs.length===0,'Sem erros no console: '+JSON.stringify(errs));
console.log(results.join('\n'));console.log(`\n${results.length-fails}/${results.length} passaram`);
await b.close();})().catch(e=>{console.log(results.join('\n'));console.log('ERRO',e.message);process.exit(1)});
