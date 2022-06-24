/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@Authors Gabriel Scarpelini & Rafael Oliveira
 */

define(['N/email', 'N/render', 'N/log'], function(email, render, log) {

    function onRequest(ctx) {
        try{    
            var params = ctx.request.parameters
            var mailSubject = params.mailSubject
            var recipientEmail = params.recipientEmail
            var senderId = params.senderId
            var template = render.mergeEmail({
                templateId: 88
            })
            log.audit('valor do email', recipientEmail)
            log.audit('subject', mailSubject)
            log.audit('quem enviou', senderId)
            log.audit('template do email', template)
            
            email.send({
                author: senderId,
                recipients: recipientEmail,
                subject: mailSubject,
                body: template
            })
        }catch(e){
            log.audit('Error', e)
        }
    }
    return {
        onRequest: onRequest
    }
});
