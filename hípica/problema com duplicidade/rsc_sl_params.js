/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/url', 'N/task', 'N/log','N/file'], function(url, task, log, file) {

    function onRequest(ctx) {
        
        var arq = file.create({
            name: 'CTX',
            fileType: file.Type.PLAINTEXT,
            contents: JSON.stringify(ctx),
            folder: 1361
        })
        arq.save()
        
        const request = ctx.request;
        const method = request.method;

        var body = JSON.parse(request.body)
        log.audit('valor do body', body)

        if(method == 'POST'){

            
            var mandaTask = task.create({
                    taskType: task.taskType.SCHEDULE_SCRIPT,
                    scriptId: 'customscript_rsc_scheduled_executar_lote',
                    deploymentId: 'customdeploy_rsc_scheduled_executar_lote',
                    params:{'custscript_rsc_id_cotacao': body.currRecord.id}
                })
                var saved = mandaTask.submit()
                log.audit('valor do mandaTask', saved)
            }
        }

    return {
        onRequest: onRequest
    }
});
