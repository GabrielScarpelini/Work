/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 */

 define(['N/ui/serverWidget',], // esse modulo auxlia a criar campos 

 function(ui){
     
     function onRequest(ctx){
         var form = ui.createForm({
             title: 'Reparcelamento'
         })
         form.addField({
             label: 'Contrato:',
             type: ui.FieldType.SELECT,
             id: 'custpage_contrato',
             source: 'customrecord_rsc_contrato_gs'
         })
         form.addField({
             label: 'Quantidade de Parcelas',
             type: ui.FieldType.SELECT,
             id: 'custpage_quantidade_parcelas',
             source: 'customlist_contrato_numeroparcelas_raf'
         })
         form.addField({
             label: 'Juros',
             type: ui.FieldType.SELECT,
             id: 'custpage_parcelas_juros',
             source: 'customrecord_juros_aplicados_gs'
         })
         form.addButton({
             id: 'custpage_reparcelamento',
             label: 'Repacelar',
             functionName: 'reparcelar'
         })
 
         form.addField({
             label: 'Resumo de parcelas',
             type: ui.FieldType.TEXT,
             id: 'custpage_resumo_parcelas'
         }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
         form.clientScriptModulePath = './rsc_cs_contrato.js' 
         ctx.response.writePage(form)
     }
     return{
         onRequest: onRequest
     }
 })