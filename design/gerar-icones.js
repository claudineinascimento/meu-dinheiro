// Gera todos os ícones do app a partir de design/icone.svg: node design/gerar-icones.js
// PWA (www/icons), APK (mipmaps, fundo adaptativo e telas de abertura).
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const R=p=>path.join(__dirname,'..',p);
const fonte=fs.readFileSync(path.join(__dirname,'icone.svg'),'utf8');
const defs=fonte.match(/<defs>[\s\S]*?<\/defs>/)[0];
const marca=fonte.match(/<g id="marca">[\s\S]*<\/g>\s*<\/svg>/)[0].replace(/<\/svg>\s*$/,'');
const brilho='<rect width="512" height="512" fill="url(#brilho)"/>';
// fundo: 'squircle' (cantos arredondados), 'cheio' (quadrado inteiro), 'circulo' ou 'nenhum'; k: escala da marca
function svg(fundo,k){
  const f={squircle:'<rect width="512" height="512" rx="116" fill="url(#fundo)"/><rect width="512" height="512" rx="116" fill="url(#brilho)"/>',
    cheio:'<rect width="512" height="512" fill="url(#fundo)"/>'+brilho,
    circulo:'<circle cx="256" cy="256" r="256" fill="url(#fundo)"/><circle cx="256" cy="256" r="256" fill="url(#brilho)"/>',nenhum:''}[fundo];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${f}<g transform="translate(256 256) scale(${k}) translate(-262 -250)">${marca}</g></svg>`;
}
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();
  const png=async(svgTxt,w,h,arq,fundoCor)=>{h=h||w;
    await p.setViewportSize({width:w,height:h});
    await p.setContent(`<html><body style="margin:0;background:${fundoCor||'transparent'};width:${w}px;height:${h}px;display:grid;place-items:center;overflow:hidden">${svgTxt}</body></html>`);
    await p.screenshot({path:R(arq),omitBackground:!fundoCor,clip:{x:0,y:0,width:w,height:h}});console.log('ok',arq,w+'x'+h)};
  const tam=(s,w)=>s.replace('<svg ',`<svg width="${w}" height="${w}" `);
  // PWA
  for(const [arq,w] of [['icon-512',512],['icon-192',192]])await png(tam(svg('squircle',1),w),w,w,'www/icons/'+arq+'.png');
  await png(tam(svg('squircle',1.08),32),32,32,'www/icons/favicon-32.png');
  await png(tam(svg('cheio',.92),180),180,180,'www/icons/apple-touch-icon.png','#0B5D4E');
  await png(tam(svg('cheio',.74),512),512,512,'www/icons/maskable-512.png','#0B5D4E');
  fs.writeFileSync(R('www/icons/icone.svg'),svg('squircle',1));
  // Android
  const dens={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
  for(const [d,f] of Object.entries(dens)){const dir='android/app/src/main/res/mipmap-'+d+'/';
    await png(tam(svg('squircle',1),48*f),48*f,48*f,dir+'ic_launcher.png');
    await png(tam(svg('circulo',.9),48*f),48*f,48*f,dir+'ic_launcher_round.png');
    await png(tam(svg('nenhum',.64),108*f),108*f,108*f,dir+'ic_launcher_foreground.png');}
  // Telas de abertura: fundo verde, ícone no centro
  const splash=(w,h)=>{const s=Math.round(Math.min(w,h)*.32);return `<div style="width:${w}px;height:${h}px;display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#14A383,#0B5D4E 55%,#06362D)">${tam(svg('nenhum',1.05),s)}</div>`};
  const sp={'drawable':[480,320],'drawable-land-mdpi':[480,320],'drawable-land-hdpi':[800,480],'drawable-land-xhdpi':[1280,720],'drawable-land-xxhdpi':[1600,960],'drawable-land-xxxhdpi':[1920,1280],
    'drawable-port-mdpi':[320,480],'drawable-port-hdpi':[480,800],'drawable-port-xhdpi':[720,1280],'drawable-port-xxhdpi':[960,1600],'drawable-port-xxxhdpi':[1280,1920]};
  for(const [d,[w,h]] of Object.entries(sp))await png(splash(w,h),w,h,'android/app/src/main/res/'+d+'/splash.png','#0B5D4E');
  await b.close();
})();
