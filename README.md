# Gestantes PSF rural

Aplicativo PWA em desenvolvimento para apoiar o acompanhamento pré-natal de uma unidade de saúde.

## Funcionalidades implementadas
- Cadastro de identificação e contato.
- Edição dos dados cadastrais da gestante, preservando o histórico de consultas, exames, medicamentos e encaminhamentos.
- Dados obstétricos iniciais: DUM, DPP, gestações, partos, abortos, prematuridade prévia e gestação múltipla.
- Histórico clínico: condições preexistentes, cirurgias/internações, medicamentos relatados, alergias e histórico familiar.
- Armazenamento persistente local com IndexedDB.
- Busca por nome, CPF, CNS e comunidade.
- Filtros por risco registrado, trimestre e situação.
- Cálculo aproximado da idade gestacional pela DUM ou semanas/dias.
- Ficha individual com resumo e histórico.
- Histórico de consultas, incluindo agendamentos e situação.
- Edição de consultas, exames, medicamentos e encaminhamentos já registrados.
- Exportação de relatório CSV com filtro por período de datas, considerando consultas realizadas ou agendadas no intervalo.
- Registro de exames e sinalização dos que estão pendentes.
- Registro de medicamentos conforme prescrição informada, sem sugerir ou alterar doses.
- Registro de encaminhamentos e situação do atendimento.
- Painel de alertas para consultas próximas/atrasadas, exames e encaminhamentos pendentes.
- Agenda futura de pré-natal por dia semanal de atendimento da UBS, com visualização dos próximos 30 dias, semana atual ou todas as previsões.
- Calendário mensal com contagem de consultas previstas por dia e filtro da lista ao selecionar uma data.
- Cadastro local de exceções de funcionamento da UBS (feriados, férias, reuniões ou outros dias sem atendimento), com exclusão e ajuste automático da previsão para a próxima ocorrência do dia semanal configurado.
- Identificação de consultas agendadas em atraso e reagendamento com preservação do histórico da data anterior. As datas são previsões para conferência profissional e não substituem o agendamento clínico.
- Exportação de relatório geral em CSV.
- Registro de consultas, exames, medicamentos, encaminhamentos, parto e acompanhamento puerperal.
- Registro do tipo e local do parto, idade gestacional e informações do desfecho.
- Registro de visita domiciliar e consultas puerperais, com alertas administrativos baseados nos prazos descritos na Linha Guia estadual.
- Interface responsiva e estrutura PWA.

## Agenda de pré-natal
A agenda utiliza a data da última consulta registrada como realizada; se não houver consulta realizada, usa a data atual como referência. Para o cálculo, considera intervalos mensais (28 dias), quinzenais (14 dias) e semanais (7 dias), alinhados ao calendário nacional de acompanhamento pré-natal. A Linha Guia do Paraná disponível na página estadual informa mínimo de sete consultas, com distribuição de pelo menos duas no primeiro trimestre, duas no segundo e três no terceiro, e orienta reavaliação de risco em todos os atendimentos. As datas geradas são sugestões operacionais e devem ser confirmadas pela enfermeira, considerando risco, avaliação clínica, feriados, disponibilidade e pactuações locais. A configuração do dia de atendimento fica salva no navegador/dispositivo e precisa ser refeita em outro aparelho.

## Limites clínicos
O risco obstétrico ainda é registrado manualmente. Não existe motor automático de estratificação nesta versão. Não utilizar o aplicativo para decidir condutas clínicas. A implementação automática depende da conferência integral dos critérios estaduais vigentes, documentação de exceções e validação por profissional responsável.

Referência estadual inicial: Linha de Cuidado Materno Infantil do Paraná, Linha Guia Atenção Materno Infantil – Gestação, 8ª edição, versão 4 revisada em 01/07/2022. A SESA-PR informa a estratificação como parte do cuidado e recomenda reavaliação nos atendimentos e quando novos fatores forem identificados. Verificar sempre se há atualização ou pactuação regional aplicável.

## Segurança e uso
**Usar apenas dados fictícios durante o desenvolvimento.** O armazenamento local não substitui autenticação, criptografia dos dados em repouso, controle de acesso, auditoria, backup institucional ou análise de conformidade com a LGPD. Antes de inserir dados reais, é necessário concluir a revisão de segurança e obter autorização institucional apropriada.

O aplicativo não é prontuário eletrônico oficial nem sistema da Secretaria Municipal ou Estadual de Saúde.

## Próximas etapas
1. Alertas para consultas e exames pendentes.
2. Relatórios por período e situação.
3. Registro de parto e acompanhamento puerperal.
4. Motor de estratificação de risco com regras versionadas, fontes e justificativas.
5. Revisão de segurança e testes.
6. Integração Google Drive, a ser realizada em etapa posterior.

## Execução
Hospedar em HTTPS. O PWA utiliza IndexedDB no navegador do dispositivo. Limpar os dados do navegador pode apagar os registros locais; a rotina de backup será desenvolvida em etapa posterior.


## Google Drive: configuração e limites
A integração usa o cliente OAuth Web configurado no Google Cloud e o escopo `drive.appdata`, limitado à área privada deste aplicativo no Drive. O token de acesso permanece apenas em memória e pode precisar ser autorizado novamente após recarregar a página ou expirar.

O envio e a restauração são manuais. O arquivo enviado é criptografado antes de sair do navegador. A senha de criptografia deve ter pelo menos 12 caracteres, precisa ser guardada fora do aplicativo e não pode ser recuperada pelo sistema. Use a mesma senha em todos os aparelhos. Se a senha for perdida, o backup não poderá ser descriptografado.

A restauração substitui os registros locais do dispositivo atual. Não existe mesclagem automática de alterações entre aparelhos nem sincronização em tempo real nesta versão. Antes de restaurar, faça backup do aparelho se houver dados locais que queira preservar. A primeira autorização exige que a conta Google esteja cadastrada como usuário de teste na seção Público do Google Auth Platform enquanto o app estiver em modo de teste.

A criptografia do backup no Drive não protege os dados que permanecem no IndexedDB do navegador. Portanto, mantenha o aviso de uso com dados fictícios até implementar autenticação local, criptografia em repouso, auditoria, recuperação de acesso e validação institucional/LGPD.
