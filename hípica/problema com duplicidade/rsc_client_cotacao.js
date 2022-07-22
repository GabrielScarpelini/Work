/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

 var currentRecord = '',
 itemCurrent = '',
 line = ''

var vendorTotals = {}

define(['N/ui/dialog', 'N/record', 'N/url', 'N/search', 'N/runtime', 'N/currentRecord', 'N/https','N/log'], function (dialog, record, url, search, runtime, currentRecord, https, log) {

 function _getContact(value) {
     var contato = 0
     var contactSearchObj = search.create({
         type: "contact",
         filters:
             [
                 ["company", "anyof", value]
             ],
         columns:
             [
                 search.createColumn({ name: "internalid", label: "ID interna" })
             ]
     });
     contactSearchObj.run().each(function (result) {
         contato = result.getValue({ name: 'internalid' })
         return true;
     });
     return contato
 }

 function _existLineSelected() {
     var lineCount = '',
         item = '',
         select = ''

     lineCount = currentRecord.getLineCount({ sublistId: 'custpage_premios' })

     for (var i = 0; i < lineCount; i++) {
         if (i == line) continue
         item = currentRecord.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'item', line: i })
         select = currentRecord.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'selecionar', line: i })
         if (select && item == itemCurrent) {
             dialog.alert({
                 title: 'Alert',
                 message: 'Esse item já possui uma linha selecionada'
             })
             currentRecord.setCurrentSublistValue({ 
                 sublistId: 'custpage_premios', 
                 fieldId: 'selecionar', 
                 value: false,
                 ignoreFieldChange: true
             })
             return true
         }
     }
     return false
 }

 function fieldChanged(context) {
     var sublistName = '',
         fieldId = '',
         value = ''

     currentRecord = context.currentRecord
     sublistName = context.sublistId
     fieldId = context.fieldId
     line = context.line

     if (sublistName) {
         value = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: fieldId })
     } else {
         value = currentRecord.getValue({ fieldId: fieldId })
     }

     if (sublistName == 'custpage_premios') {
         if (fieldId == 'selecionar') {
             var totalAmount = currentRecord.getValue({ fieldId: 'custbody_rsc_cotacao_total' })
             totalAmount = totalAmount ? totalAmount : 0
             var lineAmount = currentRecord.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'taxatotal', line: line })
             var fornecedor = currentRecord.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'fornecedor', line: line})

             fornecedor = search.lookupFields({
                 type: record.Type.VENDOR,
                 id: fornecedor,
                 columns: ['companyname']
             }).companyname

             if (value) {
                 itemCurrent = currentRecord.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'item', line: line })
                 var alreadySelected = _existLineSelected()

                 if (!alreadySelected) {
                     vendorTotals[fornecedor] = (vendorTotals[fornecedor] ? vendorTotals[fornecedor] : 0) + lineAmount
                 } 
             } else {
                 vendorTotals[fornecedor] = (vendorTotals[fornecedor] ? vendorTotals[fornecedor] : 0) - lineAmount
             }

             var vendorTotalsStr = ''
             for (var key in vendorTotals) {
                 vendorTotalsStr += key + ': ' + vendorTotals[key].toFixed(2) + '\n'
             }
             currentRecord.setValue({
                 fieldId: 'custbody_rsc_cotacao_total',
                 value: vendorTotalsStr
             })
         }
     } else if (sublistName == 'recmachcustrecord_rsc_cot_forn_cotid' && fieldId == 'custrecord_rsc_cot_fornid') {
         currentRecord.setCurrentSublistValue({ sublistId: 'recmachcustrecord_rsc_cot_forn_cotid', fieldId: 'custrecord_rsc_cot_forn_contato', value: _getContact(value) })
     }
 }

 function criar_compra() {
     var lotes_compra,
         valuesToSet,
         urlParams,
         id,
         fornecedor
     
     var currRecord = currentRecord.get()
     console.log('currRecord', JSON.stringify(currRecord))

     urlParams = new URLSearchParams(window.location.search)

     if (urlParams.has('id')) {
         id = urlParams.get('id')

         if (search.create({
             type: "customrecord_rsc_lotes_compra",
             filters:
                 [
                     ["custrecord_rsc_lotes_compra_transorigem", "anyof", id]
                 ],
             columns:
                 [
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_status", label: "STATUS" })
                 ]
         }).runPaged().count) {
             dialog.alert({
                 title: 'Alert',
                 message: 'Aguarde o pedido de compra ser criado'
             })
             window.location.reload()
             return
         }

         var customrecord_rsc_resp_cotacao_comprasSearchObj = search.create({
             type: "customrecord_rsc_resp_cotacao_compras",
             filters:
                 [
                     ["custrecord_rsc_respforn_cotacaoid", "anyof", id],
                     "AND",
                     ["custrecord_rsc_resp_cotacaolinhas_id.custrecord_rsc_resp_cotacaolinhas_select", "is", "T"]
                 ],
             columns:
                 [
                     search.createColumn({
                         name: "custrecord_rsc_respforn_fornecedor",
                         label: "Fornecedor"
                     })
                 ]
         });
         customrecord_rsc_resp_cotacao_comprasSearchObj.run().each(function (result) {
             fornecedor = result.getValue({
                 name: "custrecord_rsc_respforn_fornecedor"
             })
             lotes_compra = record.create({
                 type: 'customrecord_rsc_lotes_compra',
                 isDynamic: true
             })

             valuesToSet = {
                 custrecord_rsc_lotes_compra_tipo: 15,
                 custrecord_rsc_lotes_compra_transorigem: id,
                 custrecord_rsc_lotes_compra_inicio: new Date(),
                 custrecord_rsc_lotes_compra_status: 1,
                 custrecord_rsc_lotes_compra_fornecedor: fornecedor
             }
             console.log('valuesToSet', JSON.stringify(valuesToSet));

             Object.keys(valuesToSet).forEach(function (field) {
                 lotes_compra.setValue({ fieldId: field, value: valuesToSet[field] })
             })

             lotes_compra.save()


             return true;
         });

         record.submitFields({
             type: 'customtransaction_rsc_cotacao_compras',
             id: id,
             values: {
                 'custbody_rsc_transacao_criada': true
             }
         })
         record.submitFields({
             type: 'customtransaction_rsc_cotacao_compras',
             id: id,
             values: {
                 'custbody_rsc_cotation_create': true
             }
         })
         
         window.location.reload()

         var suiteletURL = url.resolveScript({
             scriptId: 'customscript_rsc_sl_params',
             deploymentId: 'customdeploy_rsc_sl_params'
         });
         var response = https.post({
             url: suiteletURL,
             body: JSON.stringify({
                 currRecord: currRecord,
                 valuesToSet: valuesToSet
             })
         });

         var searchURL = url.resolveTaskLink({ id: 'LIST_SEARCHRESULTS', params: { "searchid": 'customsearch_rsc_lotes_compra' } });
         window.open(searchURL, '_blank')
     }
 }

 function saveRecord(context) {
     var currentRecord = context.currentRecord;

     if (!currentRecord.getValue({ fieldId: 'location' })) {
         dialog.alert({
             title: 'Alert',
             message: 'Favor preencher localidade'
         })
         return false
     }
     return true
 }

 return {
     saveRecord: saveRecord,
     fieldChanged: fieldChanged,
     criar_compra: criar_compra
 }
});