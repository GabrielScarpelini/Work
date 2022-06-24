/**
 * @NScriptType ClientScript
 * @NApiVersion 2.0
 */

 define (['N/record','N/search', 'N/currentRecord', 'N/log' ], 
 function(record, search, currentRecord, log){
     
     function pageInit(ctx){
         var page = ctx.currentRecord;
         console.log('page init working')
         console.log('me espera cara!')
         var fieldId = page.getField('custrecord_contrato_principal_gs')
         if(ctx.mode === 'edit'){
             fieldId.isDisabled = true
         }
     }
     function saveRecord(ctx){
         var page = ctx.currentRecord;
         var fieldId = page.getValue('custrecord_contrato_principal_gs')
         var fieldValue = page.getValue('custrecord_valor_gs')
         var pageId = page.id
         var valores = []
         try{ 
             if (ctx.mode === 'copy'|| 'create'){
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
                     // console.log("valores somados na lista",soma)
                     // console.log('Valor do contrato', valorContrato)
                     if(fieldValue >= valorContrato || (soma + fieldValue) >= valorContrato){
                         alert('você ultrapassou o valor do contrato')
                         return false
                     }else{
                         return true}
                 }else{
                     return true
                 }
             
                
                 
             }if (ctx.mode === 'edit'){
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
                     console.log("valores somados na lista",soma)
                     console.log('Valor do contrato', valorContrato)
                     console.log('pqp em')
                     if(fieldValue >= valorContrato || (soma + fieldValue) >= valorContrato){
                         alert('você ultrapassou o valor do contrato')
                         return false
                     }else{
                         return true}
                     }
                 }else{
                     return true
                     }        
         }catch(e){
             log.debug('error',e)
         }    
     }
     
    
     return{
         pageInit: pageInit,
        saveRecord: saveRecord
     }
     
 })