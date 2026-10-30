# Gestantes PSF rural

Protótipo de apoio ao acompanhamento pré-natal em uma UBS.

## O que esta versão implementa
- Cadastros persistidos localmente no aparelho por IndexedDB.
- Busca por nome, CPF e CNS.
- Filtros por risco registrado, trimestre e situação.
- Cálculo aproximado da idade gestacional pela DUM ou semanas/dias.
- PWA instalável em dispositivos compatíveis.
- Estrutura de backup e restauração manual no Google Drive.
- O arquivo de backup é criptografado no aparelho com AES-GCM e chave derivada por PBKDF2 antes de ser enviado ao Drive. A senha não é enviada ao Google nem armazenada no aplicativo.

## Configuração do Google Drive
1. Criar um projeto no Google Cloud e ativar a Google Drive API.
2. Configurar a tela de consentimento OAuth.
3. Criar uma credencial OAuth do tipo **Aplicativo da Web**.
4. Adicionar a origem JavaScript autorizada do endereço publicado do app (somente domínio/origem, sem caminho).
5. Colar o OAuth Client ID em `config.js`, substituindo `COLE_SEU_CLIENT_ID_AQUI`.
6. Abrir o aplicativo por HTTPS e testar backup e restauração com dados fictícios em dois dispositivos.

O aplicativo usa o escopo restrito `drive.appdata`: o backup fica na área privada de dados do aplicativo no Drive, não na pasta comum de arquivos. A usuária precisa manter a mesma conta Google e guardar a senha de criptografia. Sem essa senha, o backup não pode ser recuperado. Não há sincronização automática em tempo real: o envio e a restauração são ações manuais.

## Segurança e limites
**Não inserir dados reais de pacientes nesta versão até concluir a configuração e os testes de segurança e obter autorização institucional.** A criptografia protege o arquivo enviado ao Drive, mas não substitui controles de acesso ao aparelho, segurança operacional, auditoria, backup institucional, política de retenção ou análise LGPD. Os dados locais ficam no armazenamento do navegador e dependem da segurança do dispositivo.

O app ainda não é prontuário eletrônico nem sistema oficial da Secretaria de Saúde. O risco obstétrico continua sendo registrado manualmente; não usar para decisões clínicas. A classificação automática exige conferência da Linha Guia Materno Infantil vigente, documentação das regras e validação por profissional responsável.

## Próximas etapas
1. Configurar e testar OAuth e recuperação entre dois aparelhos.
2. Completar cadastro obstétrico e histórico clínico.
3. Implementar consultas, exames, medicamentos, encaminhamentos e relatórios.
4. Implementar motor de estratificação rastreável, com fonte e versão do protocolo.
5. Revisar segurança, LGPD e autorização institucional antes do uso real.

## Execução
Hospedar em HTTPS. A integração OAuth não funciona abrindo o arquivo diretamente como `file://`.
