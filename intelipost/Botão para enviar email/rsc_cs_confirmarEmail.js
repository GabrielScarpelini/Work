/**
* @NApiVersion 2.1
* @NScriptType ClientScript
* @Authors Gabriel Scarpelini & Rafael Oliveira
*/
define(['N/log','N/email', 'N/currentRecord', 'N/https', 'N/search', 'N/ui/dialog'], function(log, email, currentRecord, https, search, dialog) {

    function pageInit(ctx) {
        
    }

    function emailDisparo(){
        if(confirm('Deseja enviar o Email para cadastro ?')){
            var page = currentRecord.get()
            var recordId = page.id
            var recordType = page.type
            console.log(recordType)

            var func = getMail(recordType, recordId)
            log.audit('retorno final do script', func)
            
            function getMail(type, registroId){
                var busca = []
                search.create({
                    type: type,
                    filters: [
                            ['internalid', 'IS', registroId]
                            ],
                    columns:[
                            search.createColumn({name: "email", label: "E-mail"}),
                            search.createColumn({name: "firstname", label: "Nome"})
                            ]
                }).run().each(function(result){
                    busca.push({
                        email: result.getValue('email'),
                        nome: result.getValue('firstname')
                    })
                    return true
                })
                const senderId = 239880;
                const recipientEmail = busca[0].email;
                const mailSubject = 'Atualização de cadastro de Cliente (' + busca[0].nome + ')'

                https.post({
                    body: {
                        senderId: senderId,
                        recipientEmail: recipientEmail,
                        mailSubject: mailSubject
                    },
                        url: 'https://4481651-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1885&deploy=1&compid=4481651_SB2&h=4120755da0c68734c123',
                })
                dialog.alert({
                    title: "Sucesso!",
                    message: "E-mail encaminhado para o destino: " + recipientEmail +'!'
                })

                return{
                    idRemetente: senderId,
                    emailDestinatario: recipientEmail,
                    titulo: mailSubject
                    
                }
            }
        }
    }


    return {
        pageInit: pageInit,
        emailDisparo: emailDisparo
    }
})