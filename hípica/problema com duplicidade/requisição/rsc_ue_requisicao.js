/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record'], function (record) {

    function beforeLoad(context) {

        if (context.type === 'view') {

            var form = context.form
           	form.removeButton('createpo')
            var recordType = context.newRecord
            var cotacaoCreate = recordType.getValue({ fieldId: 'custbody_rsc_cotation_create' })
            if (cotacaoCreate == true) return
            var cotacao = recordType.getValue({ fieldId: 'custbody_rsc_requisicao_cotacao_criada' })
            // log.debug('cotacaoCreate', cotacaoCreate)

            log.audit('cotacao', cotacao)

            if (!cotacao && recordType.getValue({ fieldId: 'status' }) != 'Rejeitado' && !recordType.getValue({ fieldId: 'custbody_rsc_transacao_criada'}) && cotacaoCreate == false) {
                form.addButton({
                    id: 'custpage_criar_cotacao',
                    label: 'Criar Cotação',
                    functionName: 'criar_cotacao'
                })
                form.clientScriptModulePath = './rsc_client_requisicao.js' 
                
            }
            return form
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});