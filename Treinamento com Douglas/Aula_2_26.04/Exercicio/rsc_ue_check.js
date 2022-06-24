/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */

define(['N/search'],
function(search){
    function beforeLoad(ctx){         
        var page = ctx.newRecord;       // a função currentRecord doesn't exists on user event, instead we use newRecord
        var form = ctx.form             // aqui um form é criado pelo ctx pos aqui é um user event
        form.addButton({
            id: 'custpage_button_check',
            label: 'Checar Duplicidade',
            functionName: 'checar'
        });
        form.clientScriptModulePath = './rsc_cs_checar.js' // referenciando o clientScript
        
    }
    function beforeSubmit(ctx){
        var page = ctx.newRecord;      // pegando o ctx atual, similar ao currentRecord 
            if(ctx.type == ctx.UserEventType.CREATE){ // validando se o ctx é tipo de criar um record
                var cocheiraId = page.id   // pegando o ID interno da cocheira, pois está na pg
                var cocheiraHorse = page.getValue('custrecord_id_cocheira_cavalo') // pegando o ID interno do cavalo
                var searchHorse = search.create({ //busca salva 
                    type: 'customrecord_id_cocheira', // buscando dentro de cocheira 
                    filters:[
                        ['custrecord_id_cocheira_cavalo', 'IS', cocheiraHorse] // filtro pra ver se o ID interno do cavalo está no campo 
                    ]
                }).run().getRange({  //  crição da lista caso haja alguma insidencia acima entrará nessa lista 
                    start:0,
                    end: 1
                })
                if(searchHorse.length != 0){       // verificando se a lista tem algo
                    throw Error("Um erro ocorreu") // se tiver joga essa mensagem e não salva 
                }else{
                    return true // senão salva o registro 
                }
            }if(ctx.type == ctx.UserEventType.EDIT){ // caso o ctx seja de edição
                    var cocheiraId = page.id    // pegando o id interno do ctx(tipo de registro cocheira)
                    var cocheiraHorse = page.getValue('custrecord_id_cocheira_cavalo') // id interno de cavalo
                    if(!cocheiraHorse){ // caso não tenha cavalo setado, ele vai deixar salvar
                        return true         
                    }
                    else{ // senão executa o bloco abaixo
                        var searchHorse = search.create({   // criando a busca salva
                            type: 'customrecord_id_cocheira', // no tipo de cocheira
                            /*no filtro foi feito a seleção pra ver se o field cavalo em cocheira 
                              é o cavalo pelo ID interno, e o interanl Id da cocheira nao deve ser
                              o mesmo, (se não fizer esse filtro do id interno, ele não deixará salvar 
                              se o ctx for editar sem mudar o cavalo)   */
                            filters:[
                                ['custrecord_id_cocheira_cavalo', 'IS', cocheiraHorse],
                                    'AND',
                                ["internalid", 'NONEOF', cocheiraId]
                            ]
                        }).run().getRange({  // crição da lista caso haja alguma incidência acima entrará nessa lista
                            start:0,
                            end: 1
                        })
                        if(searchHorse.length != 0){ // verificação se a lista tem incidência 
                            throw Error("Um erro ocorreu") // se sim ele não salva 
                        }else{
                            return true // senão ele salva
                        }
                    }
    
        }
    }

    return{
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    }
})