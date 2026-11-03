// Roda todos os testes: node testes/rodar.js
const {spawn,spawnSync}=require('child_process');const path=require('path');
const srv=spawn(process.execPath,[path.join(__dirname,'servidor.js')],{stdio:'ignore'});
setTimeout(()=>{let falhou=false;
 for(const t of ['usuario-final.test.js','pwa.test.js','android.test.js']){console.log('\n== '+t);const r=spawnSync(process.execPath,[path.join(__dirname,t)],{stdio:'inherit'});if(r.status!==0)falhou=true}
 srv.kill();process.exit(falhou?1:0)},800);
