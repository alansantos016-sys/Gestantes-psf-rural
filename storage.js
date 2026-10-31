// Armazenamento local persistente (IndexedDB). Os dados não são enviados automaticamente.
window.PatientStore = (() => {
  const DB_NAME = "gestantes-psf-rural";
  const STORE = "patients";
  function openDb() {
    return new Promise((resolve,reject) => {
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:"id"}); };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }
  async function transaction(mode, action) {
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      let tx;
      try {
        tx=db.transaction(STORE,mode);
        const store=tx.objectStore(STORE);
        let result;
        tx.oncomplete=()=>{db.close();resolve(result);};
        tx.onerror=()=>{db.close();reject(tx.error||new Error("Falha na gravação do banco de dados."));};
        tx.onabort=()=>{db.close();reject(tx.error||new Error("A gravação no banco de dados foi cancelada."));};
        result=action(store);
      } catch(e) {
        try { if(tx && tx.readyState!=="done") tx.abort(); } catch {}
        db.close();
        reject(e);
      }
    });
  }
  return {
    async all(){ const db=await openDb(); return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>{db.close();resolve(r.result||[])};r.onerror=()=>{db.close();reject(r.error)}}); },
    put(patient){ return transaction("readwrite",s=>s.put(patient)); },
    replaceAll(items){ return transaction("readwrite",s=>{s.clear();items.forEach(p=>s.put(p));}); },
    clear(){ return transaction("readwrite",s=>s.clear()); }
  };
})();