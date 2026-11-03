// Servidores locais para os testes: 8765 = app com banco simulado (app.html), 8766 = pasta www (PWA/APK).
const http=require('http'),fs=require('fs'),path=require('path');
const WWW=path.join(__dirname,'..','www');
const tipos={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const enviar=(res,arq)=>fs.readFile(arq,(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':tipos[path.extname(arq)]||'application/octet-stream'});res.end(d)});
http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split(/[?#]/)[0]);
  if(u==='/app.html')return enviar(res,path.join(WWW,'index.html'));
  enviar(res,path.join(WWW,u==='/'?'index.html':u));}).listen(8765);
http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split(/[?#]/)[0]);enviar(res,path.join(WWW,u==='/'?'index.html':u))}).listen(8766);
console.log('Servidores de teste em http://localhost:8765 e http://localhost:8766');
