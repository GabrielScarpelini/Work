/**
 *@NApiVersion 2.1
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

    function saveRecord(ctx){
        var page = ctx.currentRecord
        var jsonAtualizado = []
        var json = JSON.parse(page.getValue('custpage_json_holder'))
        var count = page.getLineCount({ sublistId: 'custpage_sublist' });
        for(var i = 0; i < count; i++){
            var check = page.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_pegar_parcela', line: i}) 
            var numeroParcelas = page.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_prestacoes', line: i})
            
            for (var j = 0; j < json.length; j++){
                    if(numeroParcelas == json[j].numeroParcelas){
                        json[j].checkbox = check
                        jsonAtualizado.push(json[j])

                    }
            }
        }
        console.log(jsonAtualizado)
        page.setValue('custpage_json_holder', JSON.stringify(jsonAtualizado))
        // return true
    }

    
    return {
        pageInit: pageInit,
        selecionar: selecionar,
        desmarcar: desmarcar,
        saveRecord: saveRecord
    }
});
