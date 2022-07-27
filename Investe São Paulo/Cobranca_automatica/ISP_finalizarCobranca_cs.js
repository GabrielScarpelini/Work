/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
 define(['N/currentRecord','N/log'], function(currentRecord, log) {

    function pageInit(ctx) {
    }

    function finalizar_cobranca(){
        var page = currentRecord.get()
        console.log('valor do page', page)
        var taxLines = page.getLineCount({ sublistId: 'taxdetails' })
        console.log('valor do taxlines', taxLines)
    }

    return {
        pageInit: pageInit,
        finalizar_cobranca: finalizar_cobranca
    }
});
