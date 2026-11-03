(()=>{ if(location.hash==='#local')return;
 let store; try{store=new Map(JSON.parse(localStorage.getItem('mockdb')||'[]'))}catch(e){store=new Map()}
 const save=()=>localStorage.setItem('mockdb',JSON.stringify([...store]));
 const subs=[]; const notify=()=>subs.forEach(f=>f());
 const snapDoc=p=>({id:p.split('/').pop(),exists:store.has(p),data:()=>store.get(p),metadata:{fromCache:false}});
 const docRef=p=>({id:p.split('/').pop(),path:p,collection:n=>colRef(p+'/'+n),
  set:async d=>{store.set(p,JSON.parse(JSON.stringify(d)));save();setTimeout(notify,5)},
  delete:async()=>{store.delete(p);save();setTimeout(notify,5)},
  onSnapshot:cb=>{const f=()=>cb(snapDoc(p));subs.push(f);setTimeout(f,30);return()=>{}}});
 const colRef=p=>({path:p,doc:id=>docRef(p+'/'+id),onSnapshot:cb=>{const f=()=>{const docs=[...store.keys()].filter(k=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')).sort().map(snapDoc);cb({docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false}})};subs.push(f);setTimeout(f,30);return()=>{}}});
 const db={doc:docRef,collection:colRef};
 window.__saved=[];
 window.claude={use:async n=>n==='db'?db:n==='user'?{id:async()=>'u_test'}:n==='downloads'?{save:async({filename,data})=>{window.__saved.push({filename,text:await data.text()});return 'saved'}}:null};
})();
