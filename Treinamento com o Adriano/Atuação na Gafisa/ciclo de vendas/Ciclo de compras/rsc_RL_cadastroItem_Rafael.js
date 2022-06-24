/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Author Rafael Oliveira
 */
define(['N/log', 'N/record', 'N/search', 'N/task'], function(log, record, search, task) {

    function _get(ctx) {

    }

    function _post(ctx) {
        try {
            var item = criarItem(ctx.item)
            var fornecedor = criarFornecedor(ctx.fornecedor)
            var pedidoDeCompra = criarPedidoDeCompra(fornecedor.vendorId, item.itemId)

            var taskMap = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_rsc_mr_recebitem_faturafor',
                deploymentId: 'customdeploy_rsc_mr_recebitem_faturafor',
            })
            var taskId = taskMap.submit()

            return {
                item : item,
                fornecedor : fornecedor,
                pedidoDeCompra : pedidoDeCompra,
                taskMapReduce: taskId
            }
            

        } catch (e) {
            log.debug('Erro catch: ', e)
            return {
                status: 'Erro...',
                msg: e
            }
        } 

        function criarItem(ctx){
            var item = record.create({
                type: 'inventoryitem',
                isDynamic: true
            })
            Object.keys(ctx).forEach(function(bodyField){
                item.setValue({
                    fieldId: bodyField,
                    value:ctx[bodyField]
                })
            })
            var saved = item.save({ignoreMandatoryFields: true})
    
            return objItem = {
                itemId: saved,
                msg: 'Item criado com sucesso...'
            }
        }

        function criarFornecedor(fornecedor){
            var vendor = record.create({
                type: 'vendor',
                isDynamic: true
            })
            // dados pessoais
            Object.keys(fornecedor.dadosPessoais).forEach(function(bodyField){
                vendor.setValue({
                    fieldId: bodyField,
                    value:fornecedor.dadosPessoais[bodyField]
                })
            })
            
            // endereço
            vendor.selectNewLine('addressbook') 
            var registroEndereco = vendor.getCurrentSublistSubrecord('addressbook', 'addressbookaddress')

            Object.keys(fornecedor.endereco).forEach(function(bodyField){
                registroEndereco.setValue(bodyField, fornecedor.endereco[bodyField])
            })
            // saves / commit
            vendor.commitLine('addressbook')
            var saved = vendor.save({ignoreMandatoryFields: true})
            return objFornecedor = {
                vendorId: saved,
                msg: 'fornecedor criado com sucesso...'
            }
        }

        // function criarPedidoDeCompra(){
            // busca para trazer o funcionário
        function criarPedidoDeCompra(vendorId, itemId){
            var busca = search.create({
                type: "employee",
                filters:
                [
                   ["systemnotes.name","anyof","23410"], 
                   "AND", 
                   ["systemnotes.context","anyof","SLT"]
                ],
                columns:
                [
                   search.createColumn({name: "internalid", label: "ID interno"}),
                   search.createColumn({name: "altname", label: "Nome"})
                ]
            }).run().getRange({
                start: 0,
                end: 1
            })
            var funcionarioId = busca[0].id

            var pedidoCompra = record.create({
                type: 'purchaseorder'
                // ,
                // isDynamic: true
            })
            pedidoCompra.setValue('entity', vendorId)
            pedidoCompra.setValue('employee', funcionarioId)
            pedidoCompra.setValue('subsidiary', 2)
            pedidoCompra.setValue('custbody_rsc_tipo_transacao_workflow', 9)
            pedidoCompra.setValue('approvalstatus', 2)
            pedidoCompra.setValue('custbody_enl_operationtypeid', 6)
            pedidoCompra.setValue('custbody_enl_order_documenttype', 5)
            pedidoCompra.setValue('custbody_enl_deliverylocation', 23410)
            pedidoCompra.setValue('location', 233)
            
            // setando item

            pedidoCompra.setSublistValue({ // não dinâmico
                sublistId: 'item',
                fieldId: 'item',
                line: 0,
                value: itemId
                // value: 19621
            })
            pedidoCompra.setSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: 0,
                value: '1'
            })
            pedidoCompra.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: 0,
                value: '100'
            })

            var saved = pedidoCompra.save({ignoreMandatoryFields: true})

            return objPedido = {
                pedidoId: saved,
                msg: 'Pedido de compra criado com sucesso...'
            }
        }
    }

    function _put(ctx) {
        
    }

    function _delete(ctx) {
        
    }

    return {
        get: _get,
        post: _post,
        put: _put,
        delete: _delete
    }
});
