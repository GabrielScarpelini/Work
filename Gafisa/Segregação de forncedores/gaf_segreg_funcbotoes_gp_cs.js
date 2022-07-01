/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/record', 'N/log', 'N/currentRecord', 'N/url'], function(record, log, currentRecord, url) {

    function pageInit(ctx) {}

    function selecionar(){
        var page = currentRecord.get()
        var count = page.getLineCount({ sublistId: 'custpage_sublist' });
        for(var i = 0; i < count; i++){
            page.selectLine({sublistId: "custpage_sublist",line: i})
            page.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_pegar_parcela', value: true, ignoreFieldChange: true });
            page.commitLine({ sublistId: 'custpage_sublist' });
        }
    }

    function desmarcar(){
        var page = currentRecord.get()
        var count = page.getLineCount({ sublistId: 'custpage_sublist' });
        for(var i = 0; i < count; i++){
            page.selectLine({sublistId: "custpage_sublist",line: i})
            page.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_pegar_parcela', value: false, ignoreFieldChange: true });
            page.commitLine({ sublistId: 'custpage_sublist' });
        }
    }
    return {
        pageInit: pageInit,
        selecionar: selecionar,
        desmarcar: desmarcar
    }
});
