/**
* @NApiVersion 2.x
* @NScriptType ClientScript
*/
define(['N/search', 'N/log', 'N/currentRecord', 'N/ui/dialog'], 
function(search, log, currentRecord, dialog) {


    function saveRecord(ctx){
        var msg_erro ={
            title: 'Erro ao Salvar',
            message: 'Nome já existente na lista'
        }
        try{    
            var page = ctx.currentRecord;
            var fieldId = page.id
            var nome = page.getValue('name')
            console.log('Nome', nome)
            var igualdade = search.create({
                type: 'customrecord_rsc_correction_unit',
                filters: ['name', 'IS', nome],
            }).run().getRange({
                start: 0,
                end: 1
            })
            
            console.log('retorno da pesquisa:', igualdade)
            if(igualdade.length != 0){
                dialog.alert(msg_erro)
            }else{
                return true
            }
        }catch(e){
            log.debug('Error', e)
        }    
    }
    
    return {
        saveRecord: saveRecord
    
    }
});