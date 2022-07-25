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
    if (method == 'POST'){
        var body = JSON.parse(request.body)
        var idSchedule = {}
        if (body.currRecord.Type == 'purchaserequisition'){
            idSchedule.custscript_rsc_id_requisicao = body.currRecord.id ? body.currRecord.id : body.valuesToSet.custrecord_rsc_lotes_compra_transorigem;
        }else{
            idSchedule.custscript_rsc_id_cotacao = body.currRecord.id ? body.currRecord.id : body.valuesToSet.custrecord_rsc_lotes_compra_transorigem;
        }
        var scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: 'customscript_rsc_scheduled_executar_lote',
            params: idSchedule
        });
        var scriptTaskId = scriptTask.submit();
        
        log.audit('task', {scriptTaskId: scriptTaskId, scriptTask: scriptTask});
    }
}

return {
    onRequest: onRequest
}
});
