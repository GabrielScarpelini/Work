/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
* 
* 
* 
*/

import { EntryPoints} from "N/types";
import  Search from "N/search";
import * as UI from "N/ui/serverWidget";
 
 
export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    const form = ctx.form
    const newRecord = ctx.newRecord
    const contrato = newRecord.getValue('custrecord_lrc_contrato_princi')
    if(ctx.type == ctx.UserEventType.EDIT || ctx.type == ctx.UserEventType.VIEW){
        form.getField({
            id:'custrecord_lrc_contrato_princi'
        }).updateDisplayType({displayType: UI.FieldDisplayType.DISABLED})
        if(!contrato){
            form.addButton({
                id:'custpage_lrc_reparcelar',
                label:'Reparcelar',
                functionName:'redirecionar'
            })
        }
        form.clientScriptModulePath = ("./clientScript_botaoReparcelamento_doug.js");
    }
}

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit= (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    const newRecord = ctx.newRecord;
    const oldRecord = ctx.oldRecord;
    const contrato = newRecord.getValue('custrecord_lrc_contrato_princi')
    if(ctx.type == ctx.UserEventType.CREATE){
        let total = Number(newRecord.getValue('custrecord_lrc_valor_doug'));
        if(contrato){
            Search.create({
                type:'customrecord_lrc_contrato_doug',
                filters:['custrecord_lrc_contrato_princi', 'IS', contrato],
                columns:['custrecord_lrc_valor_doug']
            }).run().each( result => {
                let valor = result.getValue('custrecord_lrc_valor_doug')
                total += Number(valor)
                return true
            })
            const lookupContrato = Search.lookupFields({
                type:'customrecord_lrc_contrato_doug',
                id:contrato,
                columns:['custrecord_lrc_valor_doug']
            })
            if(total > Number(lookupContrato.custrecord_lrc_valor_doug)){
                throw Error('A soma das parcelas não pode ser superior ao valor do contrato principal!')
            }
        }
    }
    if(ctx.type == ctx.UserEventType.EDIT){
        const oldContrato = oldRecord.getValue('custrecord_lrc_contrato_princi')
        if(contrato != oldContrato){
            throw Error('Não é permitido alterar o contrato de uma parcela.')
        }
        if(contrato){
            const oldValor = oldRecord.getValue('custrecord_lrc_valor_doug')
            const valor = newRecord.getValue('custrecord_lrc_valor_doug')
            let total = Number(valor);
            if(valor != oldValor){
                Search.create({
                    type:'customrecord_lrc_contrato_doug',
                    filters:['custrecord_lrc_contrato_princi', 'IS', contrato],
                    columns:['custrecord_lrc_valor_doug']
                }).run().each( result => {
                    if(Number(result.id) != Number(newRecord.id)){
                        let valor = result.getValue('custrecord_lrc_valor_doug')
                        total += Number(valor)
                    }
                    return true
                })
                const lookupContrato = Search.lookupFields({
                    type:'customrecord_lrc_contrato_doug',
                    id:'contrato',
                    columns:['custrecord_lrc_valor_doug']
                })
                if(total > Number(lookupContrato.custrecord_lrc_valor_doug)){
                    throw Error('A soma das parcelas não pode ser superior ao valor do contrato principal!')
                }
            }
        }
    }
}