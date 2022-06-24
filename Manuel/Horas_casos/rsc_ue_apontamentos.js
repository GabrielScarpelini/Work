/**
* @NApiVersion 2.0 
* @NScriptType UserEventScript
* @Author Gabriel Scarpelini & Rafael Oliveira
*/

define(['N/search', 'N/record', 'N/log'], function(search, record, log){
    function beforeLoad(ctx){
        try{
            var lista = []
            var page = ctx.newRecord;
            /**
             * o CTX no modo edição estava barrando o salvamento do caso.
             */
            if(ctx.type != ctx.UserEventType.EDIT){ // verificando se o ctx não é edição
                var casoId = page.id
                var cataHora = search.create({     // busca salva em horas 
                    type: 'customrecord1452',
                    filters:[
                        'custrecord1498', 'IS', casoId // onde o id seja do caso que estamos  
                    ],
                    columns:['custrecord_rsc_horasatuadas_rafael']  // pegando o valor dessa coluna aqui 
                }).run().each(function(result) {
                    lista.push(result.getValue('custrecord_rsc_horasatuadas_rafael')) // jogando o retorno da pesquisa para dentro da lista
                    return true
                })
                
                var soma = 0
                for (i in lista){
                    var apoio = lista[i].replace(/,/g, '.') // substitui vírgula por ponto
                    apoio = Number(apoio)
                    soma += apoio
                }    

                // load do registro caso para setar o valor do campo
                var load1 = record.load({
                    type: 'supportcase',
                    id: casoId
                })
                load1.setValue({
                    fieldId:'custevent_horas_trabalhas',
                    value: soma,
                    ignoreFieldChange: true})
                load1.save({ignoreMandatoryFields: true})
            }
        }catch(e){
            log.debug('Erro', e )
            }
        }

    function beforeSubmit(ctx) {
        
    }
    return{
        beforeLoad: beforeLoad
    }
})