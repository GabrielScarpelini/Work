/**
* @NApiVersion 2.1
* @NScriptType ClientScript
* @Authors Gabriel Scarpelini & Rafael Oliveira
*/
define(['N/log','N/email', 'N/currentRecord', 'N/https', 'N/search'], function(log, email, currentRecord, https, search) {

    function pageInit(ctx) {
        
    }

    function emailDisparo(){
        if(confirm('Deseja enviar o Email para cadastro ?')){
            var page = currentRecord.get()
            var recordId = page.id
            var recordType = page.type
            console.log(recordType)

            if(recordType == 'customer' || 'prospect'){
                var funk = getDataCustProp(recordType, recordId)
                log.audit('retorno final do script', funk)
            }else{
                var func = getDataLead(recordType, recordId)
                log.audit('retorno final do script', func)
            }
            
            function getDataCustProp(type, registroId){
                var busca = []
                search.create({
                    type: type,
                    filters: [
                            ['internalid', 'IS', registroId]
                            ],
                    columns:[
                            search.createColumn({name: "email", label: "E-mail"}),
                            search.createColumn({name: "companyname", label: "Razão Social"})
                            ]
                }).run().each(function(result){
                    busca.push({
                        email: result.getValue('email'),
                        razaoSocial: result.getValue('companyname')
                    })
                    return true
                })
                const senderId = 239880;
                const recipientEmail = busca[0].email;
                const mailSubject = 'Atualização de cadastro de Cliente (' + busca[0].razaoSocial + ')'

                https.post({
                    body: {
                        senderId: senderId,
                        recipientEmail: recipientEmail,
                        mailSubject: mailSubject
                    },
                        url: 'https://4481651-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1885&deploy=1&compid=4481651_SB2&h=4120755da0c68734c123',
                })
                alert('E-mail enviado!')

                return{
                    idRemetente: senderId,
                    emailDestinatario: recipientEmail,
                    titulo: mailSubject
                    
                }
            }
            
            function getDataLead(type, registroId){
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
                alert('E-mail enviado!')

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