/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 const cotationId = 107 

 var fromRecord,
     newRecord,
     cotacaoId,
     compraId,
     id,
     valuesToSet,
     valuesToSetLine,
     loteId,
     fornecedorLote
 
 define(['N/search', 'N/record', 'N/task'], function (search, record, task) {
 
     function _createQuotation() {
         log.debug('criando cotação', 'scheduled')
         var item,
             itemName,
             quantity
         try {
             valuesToSet = {
                 subsidiary: fromRecord.getValue({ fieldId: 'subsidiary' }),
                 custbody_rsc_solicitante: fromRecord.getValue({ fieldId: 'entity' }),
                 custbody_rsc_cotacao_origem: id,
                 trandate: fromRecord.getValue({ fieldId: 'trandate' }),
                 memo: fromRecord.getValue({ fieldId: 'memo' }),
                 location: fromRecord.getValue({ fieldId: 'location' }),
                 class: fromRecord.getValue({ fieldId: 'class' }),
                 custbody_rsc_cotacao_data_inicio: fromRecord.getValue({ fieldId: 'trandate' }),
                 custbody_rsc_cotacao_data_termino: fromRecord.getValue({ fieldId: 'duedate' }),
                 custbody3: fromRecord.getValue({ fieldId: 'custbody3' }),
             }
 
             log.audit({ title: 'value', details: valuesToSet })
 
             Object.keys(valuesToSet).forEach(function (field) {
                 newRecord.setValue({ fieldId: field, value: valuesToSet[field] })
             })
 
             cotacaoId = newRecord.save()
 
             var lineCount = fromRecord.getLineCount({ sublistId: 'item' })
             for (var i = 0; i < lineCount; i++) {
                 fromRecord.selectLine({ sublistId: 'item', line: i })
 
                 item = fromRecord.getCurrentSublistValue({
                     sublistId: 'item',
                     fieldId: 'item'
                 })
                 itemName = fromRecord.getCurrentSublistValue({
                     sublistId: 'item',
                     fieldId: 'description'
                 })
                 quantity = fromRecord.getCurrentSublistValue({
                     sublistId: 'item',
                     fieldId: 'quantity'
                 })
 
                 valuesToSetLine = {
                     custrecord_rsc_cotacao_compras_id: cotacaoId,
                     custrecord_rsc_cotacao_compras_item: item,
                     custrecord_rsc_cotacao_compras_desc: itemName,
                     custrecord_rsc_cotacao_compras_qtd: quantity
                 }
 
                 var cotacaoLine = record.create({
                     type: 'customrecord_rsc_cotacao_compras_linhas',
                     isDynamic: true
                 })
 
                 Object.keys(valuesToSetLine).forEach(function (field) {
                     cotacaoLine.setValue({ fieldId: field, value: valuesToSetLine[field] })
                 })
                 cotacaoLine.save()
             }
 
             record.submitFields({
                 type: 'purchaserequisition',
                 id: id,
                 values: {
                     'custbody_rsc_requisicao_cotacao_criada': cotacaoId,
                     'approvalstatus': 2,
                     'status': 'Requisition:Closed'                  
                 }
             })
 
             record.submitFields({
                 type: 'customrecord_rsc_lotes_compra',
                 id: loteId,
                 values: {
                     'custrecord_rsc_lotes_compra_status': 2,//concluído
                     'custrecord_rsc_lotes_compra_fim': new Date(),
                     'custrecord_rsc_lotes_compra_transcriada': cotacaoId
                 }
             })
         } catch (error) {
             log.error('Erro', error)
             record.submitFields({
                 type: 'customrecord_rsc_lotes_compra',
                 id: loteId,
                 values: {
                     'custrecord_rsc_lotes_compra_status': 3,//concluído
                     'custrecord_rsc_lotes_compra_memo': error
                 }
             })
         }
     }
 
     function _createPurchaseOrder() { //AJUSTAR OS CAMPOS PARA CRIAR A ORDEM DE COMPRA
 
         var itemId,
             quantidade,
             fornecedor,
             preco_unitario,
             prazo_entrega,
             valuesToSetLine,
             parcelamento,
             incoterm,
             first = true
 
         function _createCompra() {
             newRecord = record.create({
                 type: 'purchaseorder',
                 isDynamic: true
             })
 
             valuesToSet = {
                 entity: fornecedor,
                 subsidiary: fromRecord.getValue({ fieldId: 'subsidiary' }),
                 employee: fromRecord.getValue({ fieldId: 'custbody_rsc_solicitante' }),
                 class: fromRecord.getValue({ fieldId: 'class' }),
                 location: fromRecord.getValue({ fieldId: 'location' }),
                 memo: fromRecord.getValue({ fieldId: 'memo' }),
                   duedate: fromRecord.getValue({ fieldId: 'custbody_rsc_cotacao_data_termino' }), //ajustar data
                   custbody3: fromRecord.getValue({ fieldId: 'custbody3' }),
                 terms: parcelamento,
                 incoterm: incoterm,
                 custbody_rsc_cotacao_compras_id: id//ajustar origem,
                 //custbody_enl_operationtypeid: 4,//somente dux
                 //custbody_enl_order_documenttype: 1
             }
 
             log.audit({ title: 'value', details: valuesToSet })
 
             Object.keys(valuesToSet).forEach(function (field) {
                 newRecord.setValue({ fieldId: field, value: valuesToSet[field] })
             })
         }
 
         function _compraAddLines() {   
             try {
                 newRecord.selectNewLine({ sublistId: 'item' })
 
                 valuesToSetLine = {
                     item: itemId,
                     quantity: quantidade,
                     rate: preco_unitario
                 };
 
                 Object.keys(valuesToSetLine).forEach(function (field) {
                     newRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: field, value: valuesToSetLine[field] })
                 });
                 newRecord.commitLine({ sublistId: 'item' });
                 
             } catch (error) {
                 log.error('error', error.message)
                 record.submitFields({
                     type: 'customrecord_rsc_lotes_compra',
                     id: loteId,
                     values: {
                         'custrecord_rsc_lotes_compra_status': 3,//concluído
                         'custrecord_rsc_lotes_compra_memo': error.message
                     }
                 })
             }
         }
 
         var customrecord_rsc_resp_cotacao_comprasSearchObj = search.create({
             type: "customrecord_rsc_resp_cotacao_compras",
             filters:
                 [
                     ["custrecord_rsc_respforn_cotacaoid", "anyof", id],
                     "AND",
                     ["custrecord_rsc_resp_cotacaolinhas_id.custrecord_rsc_resp_cotacaolinhas_select", "is", "T"],
                     "AND",
                     ["custrecord_rsc_respforn_fornecedor", "anyof", fornecedorLote]
                 ],
             columns:
                 [
                     search.createColumn({
                         name: "custrecord_rsc_respforn_fornecedor",
                         sort: search.Sort.ASC,
                         label: "Fornecedor"
                     }),
                     search.createColumn({ name: "custrecord_rsc_respforn_incoterm", label: "Incoterm" }),
                     search.createColumn({ name: "custrecord_rsc_respforn_condicoes_pag", label: "Forma de Parcelamento" }),
                     search.createColumn({
                         name: "custrecord_rsc_resp_cotacao_linhas_item",
                         join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                         label: "Item"
                     }),
                     search.createColumn({
                         name: "custrecord_rsc_resp_cotacao_linhas_preco",
                         join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                         label: "Preço"
                     }),
                     search.createColumn({
                         name: "custrecord_rsc_resp_cotacao_linhas_qtdof",
                         join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                         label: "Quantidade ofertada"
                     }),
                     search.createColumn({
                         name: "custrecord_rsc_resp_cotacaolinhas_prazo",
                         join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                         label: "Prazo entrega"
                     })
                 ]
         });
         customrecord_rsc_resp_cotacao_comprasSearchObj.run().each(function (result) {
 
             itemId = result.getValue({
                 name: "custrecord_rsc_resp_cotacao_linhas_item",
                 join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
             })
 
             quantidade = result.getValue({
                 name: "custrecord_rsc_resp_cotacao_linhas_qtdof",
                 join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
             })
             preco_unitario = result.getValue({
                 name: "custrecord_rsc_resp_cotacao_linhas_preco",
                 join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
             })
             prazo_entrega = result.getValue({
                 name: "custrecord_rsc_resp_cotacaolinhas_prazo",
                 join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
             })
             parcelamento = result.getValue({
                 name: 'custrecord_rsc_respforn_condicoes_pag'
             })
             incoterm = result.getValue({
                 name: 'custrecord_rsc_respforn_incoterm'
             })
             log.audit('fornecedor', fornecedor)
             if (first) {
                 fornecedor = result.getValue({ name: 'custrecord_rsc_respforn_fornecedor' })
                 _createCompra()
                 _compraAddLines()
                 log.audit("newRecord1",newRecord)
                 first = false
             } else {
                 log.audit("newRecord2",newRecord)
                 _compraAddLines()
             }
             return true;
         });
 
         compraId = newRecord.save()
 
         if (!compraId)
             return
 
         record.submitFields({
             type: 'customtransaction_rsc_cotacao_compras',
             id: id,
             values: {
                 'custbody_rsc_cotacao_compra': 'T'
             }
         })
 
         record.submitFields({
             type: 'customrecord_rsc_lotes_compra',
             id: loteId,
             values: {
                 'custrecord_rsc_lotes_compra_status': 2,//concluído
                 'custrecord_rsc_lotes_compra_fim': new Date(),
                 'custrecord_rsc_lotes_compra_transcriada': compraId
             }
         })
     }
 
     function execute(context) {
         var typeId

         var searchResults = search.create({
             type: "customrecord_rsc_lotes_compra",
             filters:
                [
                    ["custrecord_rsc_lotes_compra_status", "anyof", "1"],//aguardando
                    "AND", 
                    ["custrecord_rsc_lotes_compra_transorigem","noneof","@NONE@"],
                  "AND", 
                  ["isinactive", "anyof", 'F']
                ],
             columns:
                 [
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_transorigem", label: "Transação Origem" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_tipo", label: "Tipo" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_inicio", label: "Ínicio" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_status", label: "Status" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_fim", label: "Fim" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_transcriada", label: "Transação criada" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_memo", label: "Memo" }),
                     search.createColumn({ name: "custrecord_rsc_lotes_compra_fornecedor", label: "Fornecedor" })
                 ]
         });

         searchResults.run().each(function (result) {
             loteId = result.id
             typeId = result.getValue({ name: 'custrecord_rsc_lotes_compra_tipo' })
             id = result.getValue({ name: 'custrecord_rsc_lotes_compra_transorigem' })
             fornecedorLote = result.getValue({ name: 'custrecord_rsc_lotes_compra_fornecedor' })
 
             log.audit({ title: 'type', details: typeId })
             log.audit({ title: 'id', details: id })
             try {
                 if (typeId == cotationId) {
                     newRecord = record.create({
                         type: 'customtransaction_rsc_cotacao_compras',
                         isDynamic: true
                     })
 
                     fromRecord = record.load({
                         type: 'purchaserequisition',
                         id: id,
                         isDynamic: true,
                     })
                     log.audit({ title: 'fromRecord', details: fromRecord })
                     _createQuotation()
                 } else if (typeId == 15) {
                     fromRecord = record.load({
                         type: 'customtransaction_rsc_cotacao_compras',
                         id: id,
                         isDynamic: true,
                     })
                     _createPurchaseOrder()
                 }
             } catch (error) {
                 log.error('erro', error)
             }
 
             return true;
         });
 
 
        //  var customrecord_rsc_lotes_compraSearchObj = search.create({
        //      type: "customrecord_rsc_lotes_compra",
        //      filters:
        //          [
        //              ["custrecord_rsc_lotes_compra_status", "anyof", "1"],
        //              "AND",
        //              ["custrecord_rsc_lotes_compra_transorigem","noneof","@NONE@"]
        //          ],
        //      columns:
        //          [
        //              search.createColumn({
        //                  name: "internalid",
        //                  summary: "COUNT",
        //                  label: "ID interna"
        //              })
        //          ]
        //  });
 
        //  customrecord_rsc_lotes_compraSearchObj.run().each(function (result) {
        //      var count = result.getValue({
        //          name: "internalid",
        //          summary: "COUNT"
        //      })
        //      if (count > 0) {
        //          var scriptTask = task.create({
        //              taskType: task.TaskType.SCHEDULED_SCRIPT,
        //              scriptId: 'customscript_rsc_scheduled_executar_lote',
        //              deploymentId: 'customdeploy_rsc_scheduled_executar_lote'
        //          })
        //          var scriptTaskId = scriptTask.submit()
        //          log.error('Status', 'Novo script será executado - ' + scriptTaskId);
        //      }
        //      return true;
        //  });
     }
 
     return {
         execute: execute
     }
 });