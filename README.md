# Gestantes PSF rural

Protótipo inicial de interface para apoio ao acompanhamento pré-natal em uma UBS.

## O que já funciona
- Painel com contadores.
- Cadastro temporário em memória durante a sessão.
- Busca por nome, CPF e CNS.
- Filtros por classificação registrada, trimestre e situação.
- Cálculo aproximado da idade gestacional pela DUM ou por semanas/dias informados.
- Estrutura inicial de PWA para instalação em dispositivos compatíveis.

## Limites importantes
Esta versão é somente um protótipo de interface. **Não cadastre dados reais de pacientes.** Os registros ficam apenas na memória da página e desaparecem ao atualizar ou fechar. Não há autenticação, banco de dados, criptografia, backup ou controle de acesso.

O campo de risco é manual e não representa estratificação clínica automatizada. Não utilizar o protótipo para orientar condutas ou decisões assistenciais.

## Próximas etapas
1. Conferir e documentar a versão vigente da Linha Guia Materno Infantil e dos critérios estaduais de estratificação de risco.
2. Implementar regras clínicas rastreáveis, com versão, fonte, data de vigência e justificativas, após validação por profissional responsável.
3. Projetar backend com autenticação, autorização, trilha de auditoria, criptografia, backup e política de retenção.
4. Revisar requisitos institucionais, LGPD e segurança antes de inserir dados identificáveis.
5. Implementar consultas, exames, medicamentos, encaminhamentos e relatórios.

## Execução
Abra `index.html` em um servidor estático local ou publique a interface em hospedagem autorizada. Para uso real com dados de saúde, a hospedagem estática isolada não é suficiente.