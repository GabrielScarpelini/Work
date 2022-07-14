/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(['N/render', 'N/log', 'N/file', 'N/https', 'N/ui/serverWidget'], function(render, log, file, https, ui){
    
    function onRequest(ctx) {
        const request = ctx.request;
        const method = request.method;
        const response = ctx.response;
        const parameters = request.parameters;
        
        if(method =='GET'){
            
            var template = file.load('Intelipost/Templates/ip_com_cadastro_cliente.html');
            log.debug('template' ,template)

            try{
                var html = template.getContents()
            }catch(e){
                if(e instanceof e){
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
              	    var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }else{
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
                    var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }

            }
            log.debug('html', html)
            response.write(html)
        }else{
            log.debug('rodei')
            log.debug('parametros', parameters)
        }
    }
    
    
    return {
        onRequest: onRequest
    }
})

