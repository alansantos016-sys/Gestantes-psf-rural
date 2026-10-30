// Backup criptografado no Google Drive (pasta privada appDataFolder).
// O token OAuth fica somente em memória e é solicitado novamente quando necessário.
window.GestantesDrive = (() => {
  const FILE_NAME="gestantes-psf-backup.enc";
  let tokenClient=null, accessToken=null;
  const configured=()=>window.GESTANTES_CONFIG?.googleClientId && !window.GESTANTES_CONFIG.googleClientId.startsWith("COLE_");
  function loadIdentity(){ return new Promise((resolve,reject)=>{
    if(!window.google?.accounts?.oauth2){reject(new Error("Biblioteca de autenticação Google ainda não carregou. Verifique sua conexão."));return;}
    if(!configured()){reject(new Error("Falta configurar o OAuth Client ID do Google. O aplicativo ainda não pode acessar o Drive."));return;}
    tokenClient=window.google.accounts.oauth2.initTokenClient({
      client_id:window.GESTANTES_CONFIG.googleClientId,
      scope:"https://www.googleapis.com/auth/drive.appdata",
      callback:r=>{if(r.error){reject(new Error(r.error_description||r.error));return;}accessToken=r.access_token;resolve(accessToken);}
    });
    tokenClient.requestAccessToken({prompt:accessToken?"":"consent"});
  });}
  async function auth(){ if(accessToken)return accessToken;return loadIdentity(); }
  async function api(url,options={}){const t=await auth();const res=await fetch(url,{...options,headers:{...(options.headers||{}),Authorization:"Bearer "+t}});if(!res.ok)throw new Error("Google Drive respondeu com erro ("+res.status+").");return res;}
  async function findBackup(){const q=encodeURIComponent("name='"+FILE_NAME+"' and 'appDataFolder' in parents and trashed=false");const r=await api("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q="+q);const j=await r.json();return j.files?.[0]||null;}
  async function deriveKey(pass,salt){const enc=new TextEncoder();const material=await crypto.subtle.importKey("raw",enc.encode(pass),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:310000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);}
  async function encrypt(data,pass){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await deriveKey(pass,salt);const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify({version:1,createdAt:new Date().toISOString(),patients:data})));const bytes=new Uint8Array(salt.length+iv.length+cipher.byteLength);bytes.set(salt,0);bytes.set(iv,16);bytes.set(new Uint8Array(cipher),28);return bytes;}
  async function decrypt(bytes,pass){if(bytes.length<45)throw new Error("Arquivo de backup inválido.");const salt=bytes.slice(0,16),iv=bytes.slice(16,28),cipher=bytes.slice(28),key=await deriveKey(pass,salt);let plain;try{plain=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,cipher);}catch{throw new Error("Senha incorreta ou arquivo de backup danificado.");}const obj=JSON.parse(new TextDecoder().decode(plain));if(obj.version!==1||!Array.isArray(obj.patients))throw new Error("Formato de backup não reconhecido.");return obj;}
  async function upload(bytes){const existing=await findBackup();const boundary="gestantes_"+crypto.randomUUID();const meta={name:FILE_NAME,mimeType:"application/octet-stream"};if(!existing)meta.parents=["appDataFolder"];const body=new Blob(["--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n",JSON.stringify(meta),"\r\n--"+boundary+"\r\nContent-Type: application/octet-stream\r\n\r\n",bytes,"\r\n--"+boundary+"--"],{type:"multipart/related; boundary="+boundary});const url=existing?"https://www.googleapis.com/upload/drive/v3/files/"+existing.id+"?uploadType=multipart&fields=id,name,modifiedTime":"https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime";const r=await api(url,{method:existing?"PATCH":"POST",headers:{"Content-Type":"multipart/related; boundary="+boundary},body});return r.json();}
  async function backup(pass){const patients=await PatientStore.all();const bytes=await encrypt(patients,pass);return upload(bytes);}
  async function restore(pass){const file=await findBackup();if(!file)throw new Error("Não foi encontrado backup no Google Drive desta conta.");const r=await api("https://www.googleapis.com/drive/v3/files/"+file.id+"?alt=media");const obj=await decrypt(new Uint8Array(await r.arrayBuffer()),pass);return obj.patients;}
  return {backup,restore,isConfigured:configured};
})();