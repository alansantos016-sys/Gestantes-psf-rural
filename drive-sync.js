// Backup criptografado no espaço privado do aplicativo no Google Drive.
// O token OAuth permanece somente em memória; a senha nunca é armazenada.
(() => {
  const CLIENT_ID = "841479598634-v7lrtp21r74kfnqhl5svf9tmhv9666kg.apps.googleusercontent.com";
  const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
  const BACKUP_NAME = "gestantes-psf-rural-backup.enc";
  const ITERATIONS = 310000;
  let accessToken = null;
  let tokenExpiresAt = 0;
  let gisPromise = null;

  function loadGoogleIdentity() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (gisPromise) return gisPromise;
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => window.google?.accounts?.oauth2 ? resolve() : reject(new Error("Não foi possível carregar a autenticação do Google."));
      script.onerror = () => reject(new Error("Falha ao carregar a autenticação do Google. Verifique a conexão."));
      document.head.appendChild(script);
    });
    return gisPromise;
  }

  async function authorize() {
    if (accessToken && Date.now() < tokenExpiresAt - 60000) return accessToken;
    await loadGoogleIdentity();
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: response => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error_description || response.error || "Autorização não concluída."));
            return;
          }
          accessToken = response.access_token;
          tokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000;
          resolve(accessToken);
        },
        error_callback: error => reject(new Error(error?.message || "A janela de autorização foi fechada ou bloqueada."))
      });
      client.requestAccessToken();
    });
  }

  async function driveRequest(url, options = {}, raw = false) {
    const token = await authorize();
    const response = await fetch(url, {
      ...options,
      headers: { Authorization: "Bearer " + token, ...(options.headers || {}) }
    });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json()).error?.message || ""; } catch {}
      if (response.status === 401) { accessToken = null; tokenExpiresAt = 0; }
      throw new Error(detail || "O Google Drive respondeu com erro HTTP " + response.status + ".");
    }
    if (response.status === 204) return null;
    return raw ? response.text() : response.json();
  }

  async function findBackup() {
    const q = encodeURIComponent("name='" + BACKUP_NAME + "' and trashed=false");
    const data = await driveRequest("https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=" + q + "&pageSize=10&fields=files(id,name,modifiedTime,size)");
    return (data.files || []).sort((a, b) => (b.modifiedTime || "").localeCompare(a.modifiedTime || ""))[0] || null;
  }

  function toBase64(bytes) {
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function fromBase64(value) {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }

  async function deriveKey(passphrase, salt) {
    const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptBackup(patients, passphrase, settings = {}) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const payload = { format: "gestantes-psf-rural-backup", version: 1, exportedAt: new Date().toISOString(), patients, settings };
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
    return JSON.stringify({
      format: "gestantes-psf-rural-encrypted",
      version: 1,
      algorithm: "AES-GCM",
      kdf: "PBKDF2-SHA-256",
      iterations: ITERATIONS,
      salt: toBase64(salt),
      iv: toBase64(iv),
      ciphertext: toBase64(new Uint8Array(encrypted))
    });
  }

  async function decryptBackup(text, passphrase) {
    let envelope;
    try { envelope = JSON.parse(text); } catch { throw new Error("O arquivo do Drive não é um backup reconhecido."); }
    if (envelope.format !== "gestantes-psf-rural-encrypted" || envelope.version !== 1 || !envelope.salt || !envelope.iv || !envelope.ciphertext) {
      throw new Error("Formato de backup não reconhecido ou incompatível.");
    }
    let plain;
    try {
      const key = await deriveKey(passphrase, fromBase64(envelope.salt));
      plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.ciphertext));
    } catch {
      throw new Error("Não foi possível abrir o backup. Confira a senha de criptografia.");
    }
    let payload;
    try { payload = JSON.parse(new TextDecoder().decode(plain)); } catch { throw new Error("O conteúdo descriptografado está inválido."); }
    if (payload.format !== "gestantes-psf-rural-backup" || !Array.isArray(payload.patients)) throw new Error("O conteúdo do backup não tem a estrutura esperada.");
    if (!payload.patients.every(p => p && typeof p.id === "string" && typeof p.name === "string")) throw new Error("O backup contém registros inválidos.");
    return payload;
  }

  async function upload(patients, passphrase) {
    const content = await encryptBackup(patients, passphrase);
    const existing = await findBackup();
    const boundary = "gestantesBackup" + crypto.randomUUID().replace(/-/g, "");
    const metadata = existing ? {} : { name: BACKUP_NAME, parents: ["appDataFolder"], mimeType: "application/json" };
    const body = [
      "--" + boundary,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      "--" + boundary,
      "Content-Type: application/json; charset=UTF-8",
      "",
      content,
      "--" + boundary + "--",
      ""
    ].join("\r\n");
    const url = existing
      ? "https://www.googleapis.com/upload/drive/v3/files/" + encodeURIComponent(existing.id) + "?uploadType=multipart&fields=id,name,modifiedTime,size"
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size";
    const file = await driveRequest(url, {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "multipart/related; boundary=" + boundary },
      body
    });
    return { file, replaced: !!existing };
  }

  async function restore(passphrase) {
    const file = await findBackup();
    if (!file) throw new Error("Ainda não existe backup no Google Drive deste aplicativo.");
    const content = await driveRequest("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(file.id) + "?alt=media", {}, true);
    const payload = await decryptBackup(content, passphrase);
    return { file, payload };
  }

  async function status() {
    return findBackup();
  }

  loadGoogleIdentity().catch(() => {});
  window.DriveBackup = { authorize, upload, restore, status };
})();