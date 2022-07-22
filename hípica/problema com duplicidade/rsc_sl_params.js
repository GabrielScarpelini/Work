/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/url', 'N/task', 'N/log','N/file'], function(url, task, log, file) {
    function onRequest(ctx) {
        log.audit('onRequest', ctx);
    
        const request = ctx.request;
        const method = request.method;
    
        // var arq = file.create({
        //     name: 'CTX',
        //     fileType: file.Type.PLAINTEXT,
        //     contents: JSON.stringify(ctx),
        //     folder: 1361
        // })
        // arq.save()
    
        var body = JSON.parse(request.body)
    
        var idCotacao = body.currRecord.id ? body.currRecord.id : body.valuesToSet.custrecord_rsc_lotes_compra_transorigem;   
        log.audit('idCotacao', idCotacao)     
    
        if (method == 'POST') {
            var scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_rsc_scheduled_executar_lote', 
                deploymentId: 'customdeploy_rsc_scheduled_executar_lote',                               
                params: {
                    custscript_rsc_id_cotacao: idCotacao
                }
            });
            log.audit('scriptTask', scriptTask);
        
            var scriptTaskId = scriptTask.submit();
            log.audit('task', {scriptTaskId: scriptTaskId, scriptTask: scriptTask});
        }
    }
    
    return {
        onRequest: onRequest
    }
    });
    