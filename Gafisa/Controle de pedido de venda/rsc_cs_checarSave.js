/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/log', 'N/query'], function(log, query) {

    function saveRecord(ctx) {
        var page = ctx.currentRecord;
        var vencimento = page.getValue('custbody_rsc_vcto_seguro_prestamista')
        if (vencimento) {
            return true
        }else{
            alert('O campo vencimento está vazio!')
        }
    }

    return {
        saveRecord: saveRecord
    }
});
