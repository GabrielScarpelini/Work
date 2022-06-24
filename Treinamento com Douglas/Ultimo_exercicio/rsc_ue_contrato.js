/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/log', 'N/currentRecord', 'N/ui/serverWidget'],
function(search, log, currentRecord, ui ){
    function beforeSubmit(ctx){
        var page = ctx.newRecord;
        var fieldId = page.getValue('custrecord_contrato_principal_gs')
        var fieldValue = page.getValue('custrecord_valor_gs')
        var pageId = page.id
        var valores = []
        
        if (ctx.type == ctx.UserEventType.CREATE){
            if(fieldId){
                var busca = search.create({
                    type: 'customrecord_rsc_contrato_gs',
                    filters:[
                        'custrecord_contrato_principal_gs','IS',fieldId
                    ],
                    columns: 'custrecord_valor_gs'
                }).run().each(function(result){
                    valores.push(result.getValue('custrecord_valor_gs'))
                    return true
                })
                var buscarValor = search.lookupFields({
                    type: 'customrecord_rsc_contrato_gs',
                    id: fieldId,
                    columns:'custrecord_valor_gs'
                })
                var valorContrato = buscarValor.custrecord_valor_gs
                var soma = 0
                for ( i in valores){
                    soma += Number(valores[i]) 
                }
                // log.debug("valores somados na lista",soma)
                // log.debug('Valor do contrato', valorContrato)
                if(fieldValue > valorContrato || (soma + fieldValue) > valorContrato){
                    throw Error('você ultrapassou o valor do contrato')
                    
                }else{
                    return true}
            }else{
                return true
            }
        
        }if (ctx.type == ctx.UserEventType.EDIT){
            if (fieldId){
                var busca = search.create({
                    type: 'customrecord_rsc_contrato_gs',
                    filters:[
                        ['custrecord_contrato_principal_gs', 'IS', fieldId],
                                    'AND',
                        ['internalId', 'NONEOF', pageId ]
                    ],
                    columns: 'custrecord_valor_gs'
                }).run().each(function(result){
                    valores.push(result.getValue('custrecord_valor_gs'))
                    return true
                })
                var buscarValor = search.lookupFields({
                    type: 'customrecord_rsc_contrato_gs',
                    id: fieldId,
                    columns:'custrecord_valor_gs'
                })
                var valorContrato = buscarValor.custrecord_valor_gs
                var soma = 0
                for ( i in valores){
                    soma += Number(valores[i]) 
                }
                log.debug("valores somados na lista",soma)
                log.debug('Valor do contrato', valorContrato)
                log.debug('pqp em')
                if(fieldValue > valorContrato || (soma + fieldValue) > valorContrato){
                    throw Error('você ultrapassou o valor do contrato')
                }else{
                    return true}
        }else{
            return true
            }
        }  
    }
    function beforeLoad(ctx){
        var page = ctx.newRecord;       // a função currentRecord doesn't exists on user event, instead we use newRecord
        var form = ctx.form
        var contrato = page.getValue('custrecord_contrato_principal_gs')
        var valor = page.getValue('')             // aqui um form é criado pelo ctx pos aqui é um user event
        if (ctx.type != ctx.UserEventType.CREATE){
            if (!contrato){
            form.addButton({
                id: 'custpage_button_reparcelar',
                label: 'Repacelar',
                functionName: 'abrirReparcelar'
            })
            form.clientScriptModulePath = './rsc_cs_contrato.js'
            }
        } 
        if (ctx.type == ctx.UserEventType.EDIT || ctx.type == ctx.UserEventType.VIEW){ 
            form.getField({
                id:'custrecord_contrato_principal_gs'
            }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
        }
        if(ctx.type == ctx.UserEventType.EDIT){
            form.getField({
                id: 'custrecord_valor_gs'
            }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
            form.getField({
                id: 'custrecord_data_gs'
            }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
            form.getField({
                id: 'name'
            }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
        }
        
    }
    
    return{
        beforeSubmit: beforeSubmit,
        beforeLoad: beforeLoad 
    }
})
