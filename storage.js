// Armazenamento local persistente (IndexedDB). Os dados não são enviados automaticamente.
window.PatientStore = (() => {
  const DB_NAME = "gestantes-psf-rural";
  const STORE = "patients";
  function openDb() {
    return new Promise((resolve,reject) => {
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:"id"}); };
      req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
      req.onerror=()=>reject(req.error||new Error("Não foi possível abrir o banco local."));
      req.onblocked=()=>reject(new Error("O banco local está ocupado por outra aba. Feche outras abas do aplicativo e tente novamente."));
    });
  }
  async function transaction(mode, action) {
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      let tx, result, settled=false;
      const fail=error=>{if(settled)return;settled=true;db.close();reject(error||new Error("Falha na transação do banco local."));};
      try {
        tx=db.transaction(STORE,mode);
        tx.oncomplete=()=>{if(settled)return;settled=true;db.close();resolve(result);};
        tx.onerror=()=>fail(tx.error);
        tx.onabort=()=>fail(tx.error||new Error("A transação do banco local foi cancelada."));
        result=action(tx.objectStore(STORE));
      } catch(error) {
        try { if(tx)tx.abort(); } catch {}
        fail(error);
      }
    });
  }
  async function all(){
    const db=await openDb();
    return new Promise((resolve,reject)=>{
      let tx;
      const close=()=>db.close();
      try {
        tx=db.transaction(STORE,"readonly");
        const request=tx.objectStore(STORE).getAll();
        request.onsuccess=()=>resolve(request.result||[]);
        request.onerror=()=>reject(request.error||new Error("Não foi possível ler os cadastros locais."));
        tx.oncomplete=close;
        tx.onerror=()=>{close();reject(tx.error||new Error("Falha ao ler o banco local."));};
        tx.onabort=()=>{close();reject(tx.error||new Error("A leitura do banco local foi cancelada."));};
      } catch(error) { close();reject(error); }
    });
  }
  return {
    all,
    put(patient){return transaction("readwrite",store=>store.put(patient));},
    replaceAll(items){return transaction("readwrite",store=>{store.clear();items.forEach(patient=>store.put(patient));});},
    clear(){return transaction("readwrite",store=>store.clear());}
  };
})();