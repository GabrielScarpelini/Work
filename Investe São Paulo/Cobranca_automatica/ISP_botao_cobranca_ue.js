/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/log'], function(ui, log) {

    function beforeLoad(ctx) {
        var page = ctx.newRecord
        var status = page.getValue('status')
        if(status === "Aprovação do supervisor pendente"){
            var form = ctx.form
            form.addButton({
                id: 'custpage_button_finaliza',
                label: 'Finalizar Cobrança',
                functionName: 'finalizar_cobranca'
            })
            form.clientScriptModulePath = './ISP_finalizarCobranca_cs.js' 
        }
    }

    function beforeSubmit(ctx) {
        
    }

    function afterSubmit(ctx) {
        
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
