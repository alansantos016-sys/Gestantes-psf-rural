(() => {
  const $ = selector => document.querySelector(selector);
  const message = (text, kind = "") => {
    const el = $("#driveMessage");
    el.textContent = text;
    el.className = "drive-message" + (kind ? " " + kind : "");
  };
  const dateText = value => value ? new Date(value).toLocaleString("pt-BR") : "data não informada";

  async function connect() {
    $("#driveStatus").textContent = "Conectando…";
    message("Aguardando autorização da conta Google…");
    try {
      await DriveBackup.authorize();
      const file = await DriveBackup.status();
      $("#driveStatus").textContent = "Conectado";
      message(file ? "Backup encontrado. Última atualização: " + dateText(file.modifiedTime) + "." : "Conta autorizada. Ainda não existe backup no Drive.", "success");
    } catch (error) {
      $("#driveStatus").textContent = "Não conectado";
      message(error.message + " Se o Google informar acesso negado, adicione sua conta como usuário de teste na tela de permissão OAuth.", "error");
    }
  }

  async function backup() {
    try {
      const patients = PatientApp.getPatients();
      if (!patients.length && !confirm("Não há gestantes cadastradas. Deseja enviar um backup vazio?")) return;
      await DriveBackup.authorize();
      const existing = await DriveBackup.status();
      if (existing && !confirm("Já existe um backup no Drive, atualizado em " + dateText(existing.modifiedTime) + ". O novo arquivo substituirá o anterior. Deseja continuar?")) return;
      const pass = prompt("Crie uma senha de criptografia com pelo menos 12 caracteres. Guarde-a em local seguro. Ela será necessária para restaurar o backup em qualquer aparelho.");
      if (!pass) return;
      if (pass.length < 12) { alert("A senha precisa ter pelo menos 12 caracteres."); return; }
      const repeated = prompt("Digite novamente a senha para confirmar.");
      if (pass !== repeated) { alert("As senhas não coincidem. Nenhum backup foi enviado."); return; }
      message("Criptografando e enviando o backup…");
      const result = await DriveBackup.upload(patients, pass, PatientApp.getBackupSettings());
      $("#driveStatus").textContent = "Conectado";
      message("Backup criptografado enviado em " + dateText(result.file.modifiedTime) + ". Guarde a senha: ela não fica salva no aplicativo.", "success");
    } catch (error) {
      message(error.message + " Se houver acesso negado, confira a lista de usuários de teste do OAuth.", "error");
    }
  }

  async function restore() {
    try {
      await DriveBackup.authorize();
      const file = await DriveBackup.status();
      if (!file) { message("Nenhum backup encontrado no Google Drive desta conta.", "error"); return; }
      if (!confirm("O backup foi atualizado em " + dateText(file.modifiedTime) + ". A restauração substituirá todos os cadastros locais deste aparelho. Deseja continuar?")) return;
      const pass = prompt("Informe a senha usada para criptografar o backup.");
      if (!pass) return;
      message("Baixando e verificando o backup criptografado…");
      const result = await DriveBackup.restore(pass);
      if (!confirm("Backup válido com " + result.payload.patients.length + " gestante(s). Confirma substituir os dados locais por esse conteúdo?")) return;
      await PatientApp.restoreAll(result.payload);
      $("#driveStatus").textContent = "Conectado";
      message("Restauração concluída. Backup criado em " + dateText(result.payload.exportedAt) + ".", "success");
    } catch (error) {
      message(error.message, "error");
    }
  }

  $("#driveConnectBtn").addEventListener("click", connect);
  $("#driveBackupBtn").addEventListener("click", backup);
  $("#driveRestoreBtn").addEventListener("click", restore);
})();