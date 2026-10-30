# Gestantes PSF rural

Aplicativo PWA em desenvolvimento para apoiar o acompanhamento pré-natal de uma unidade de saúde.

## Funcionalidades implementadas
- Cadastro de identificação e contato.
- Dados obstétricos iniciais: DUM, DPP, gestações, partos, abortos, prematuridade prévia e gestação múltipla.
- Histórico clínico: condições preexistentes, cirurgias/internações, medicamentos relatados, alergias e histórico familiar.
- Armazenamento persistente local com IndexedDB.
- Busca por nome, CPF, CNS e comunidade.
- Filtros por risco registrado, trimestre e situação.
- Cálculo aproximado da idade gestacional pela DUM ou semanas/dias.
- Ficha individual com resumo e histórico.
- Registro de consultas, exames, medicamentos e encaminhamentos.
- Interface responsiva e estrutura PWA.

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
