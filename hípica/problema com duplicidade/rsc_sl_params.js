/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/url', 'N/task', 'N/log','N/file'], function(url, task, log, file) {
    function onRequest(ctx) {
        log.audit('onRequest', ctx);
    
        const request = ctx.request;
        const method = request.method;
    
        if (method == 'POST') {
            var body = JSON.parse(request.body);
            log.audit('body', body);
            
            var scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_rsc_scheduled_executar_lote',
            });
    
            if (body.currRecord.type == 'purchaserequisition') {
                scriptTask.params = {
                    custscript_rsc_id_requisicao: body.currRecord.id ? body.currRecord.id : body.valuesToSet.custrecord_rsc_lotes_compra_transorigem
                }
            } else {
                scriptTask.params = {
                    custscript_rsc_id_cotacao: body.currRecord.id ? body.currRecord.id : body.valuesToSet.custrecord_rsc_lotes_compra_transorigem
                }
            }
    
            var scriptTaskId = scriptTask.submit();        
            log.audit({scriptTaskId: scriptTaskId}, {scriptTask: scriptTask});
        }
    }
    
    return {
    onRequest: onRequest
    }
    });
    