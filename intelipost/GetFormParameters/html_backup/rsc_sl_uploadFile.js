/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(['N/render', 'N/log', 'N/file', 'N/https', 'N/ui/serverWidget','N/record', 'N/search', 'N/email', 'N/file'], function(render, log, file, https, ui, record, search, email, file){
    
    function onRequest(ctx) {
        const request = ctx.request;
        const method = request.method;
        const response = ctx.response;
        const parameters = request.parameters;

        if(method == 'GET'){
            var form = ui.createForm({
                    title: 'Contrato Estatuto Social Vigente'
                })

                form.addField({
                    id:'custpage_contrato',
                    label: 'Upload de Arquivo',
                    type: ui.FieldType.FILE
                })
            response.write(form) 
        }else{
            
        }       
    }

    return {
        onRequest: onRequest
    }
});
