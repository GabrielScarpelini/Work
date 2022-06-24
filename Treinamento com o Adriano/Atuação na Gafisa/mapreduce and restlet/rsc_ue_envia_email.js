/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/log','N/search', 'N/email', 'N/runtime'], function(log, search, email, runtime) {
    function afterSubmit(ctx) {
        try{    
            var lista = []
            var newRecord = ctx.newRecord;
            const usuario = runtime.getCurrentUser()
            log.debug('id do new record', newRecord.id)
            log.debug('id do usuario', usuario)
            var busca = search.create({
                type: "expensereport",
                filters:
                [   ["internalid", "anyof", newRecord.id],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["type","anyof","ExpRept"], 
                    "AND", 
                    ["systemnotes.name","anyof","23409"], 
                    "AND", 
                    ["systemnotes.context","anyof","MPR"]
                ],
                columns:
                [
                    search.createColumn({name: "internalid", label: "ID interno"}),
                    search.createColumn({name: "name", label: "Nome"})
                ]
                }).run().each(function(result){
                    lista.push({
                        id: result.getValue('internalid'),
                        nome: result.getValue('name')
                    })
                    return true 
                })
            log.debug('valor da lista', lista)
            
            if(lista.length != 0){
                log.debug('vou mandar o email')
                email.send({
                    author: usuario.id,
                    body: 'Alertando sobre a criação de um relatório de despensa em nome de ' + lista[0].name ,
                    recipients: 'gabriel.pavia@runsmart.cloud',
                    subject: 'Relatório de despesa',
                })
            }else{
                log.debug('não vou mandar o email')
            }
        
        }catch(e){
            log.error('Error', e)
        }

    }
    return {
        afterSubmit: afterSubmit
    }
});
