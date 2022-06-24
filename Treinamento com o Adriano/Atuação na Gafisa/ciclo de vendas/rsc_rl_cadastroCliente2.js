/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Author Gabriel Scarpelini  Github: https://github.com/GabrielScarpelini
 */
 define(['N/record', 'N/log', 'N/search', 'N/task', 'N/runtime'], 
 function(record, log, search, task, runtime){

    function _get(ctx) {

    }

    function _post(ctx) {
        try{
            var buscaItem = search.create({
                type: "inventoryitem",
                filters:
                [
                   ["type","anyof","InvtPart"],
                   "AND", 
                   ["systemnotes.name","anyof","23410"]
                ],
                columns:
                [
                    'internalid', "quantityavailable", "location"
                ]
            }).run().getRange(0,1)
            var cliente = criarCliente()
            log.debug('id do item da busca', buscaItem[0].id)
            var pedidoVenda = criarPedidoVenda(cliente ,buscaItem)
            var deposito = criarDeposito(cliente, pedidoVenda)

            return{
                buscaItem: buscaItem,
                cliente: cliente,
                pedidoVenda: pedidoVenda,
                deposito: deposito
            }
        }catch(e){
            return{"error": e}
        }

        function criarCliente(){
            var emp = record.load({
            type: "employee",
            id: 25333,
            isDynamic: true,
            })
            const dataToSet = {
            'firstname': emp.getValue('firstname'),
            'middlename': emp.getValue('middlename'),
            'lastname': emp.getValue('lastname'),
            'email': emp.getValue('email'),
            'subsidiary': emp.getValue('subsidiary')
            }
            emp.selectLine('addressbook',0)
            var addressSub = emp.getCurrentSublistSubrecord('addressbook', 'addressbookaddress')
            const addressToSet = {
                'country': addressSub.getValue('country'),
                'zip': addressSub.getValue('zip'),
                'addr1': addressSub.getValue('addr1'),
                'custrecord_enl_numero': String(addressSub.getValue('custrecord_enl_numero')),
                'addr2': addressSub.getValue('addr2'),
                'addr3': addressSub.getValue('addr3'),
                'custrecord_enl_city': addressSub.getValue('custrecord_enl_city'),
                'custrecord_enl_uf': addressSub.getValue('custrecord_enl_uf'),
                'defaultbilling': addressSub.getValue('defaultbilling'),
                'defaultshipping': addressSub.getValue('defaultshipping'),
                'addressbookaddress_text': addressSub.getValue('addressbookaddress_text')
            }
            var cust = record.create({
                type: 'customer',
                isDynamic: true,
            })
            Object.keys(dataToSet).forEach(function(bodyField) {
                cust.setValue({
                    fieldId: bodyField,
                    value: dataToSet[bodyField]
                })
            })

            cust.selectNewLine('addressbook')
            var address = cust.getCurrentSublistSubrecord('addressbook', 'addressbookaddress')
            Object.keys(addressToSet).forEach(function(bodyField){
                address.setValue({
                    fieldId: bodyField,
                    value: addressToSet[bodyField]
                })
            })
            cust.commitLine('addressbook')
            var save = cust.save({ignoreMandatoryFields: true})
            
            return objAddress = {
                clienteId: save
            }
        }

        function criarPedidoVenda(cust, item){
            var pedidoVenda = record.transform({
                fromType: record.Type.CUSTOMER,
                fromId: cust.clienteId,
                toType: record.Type.SALES_ORDER,
                isDynamic: false,

            })
            pedidoVenda.setValue({
                fieldId: "entity",
                value: cust.clienteId
            })
            pedidoVenda.setValue({
                fieldId: "custbody_rsc_tipo_transacao_workflow",
                value: 22
            })
            pedidoVenda.setValue({
                fieldId: "subsidiary",
                value: cust.subsidiary
            })
            pedidoVenda.setSublistValue({ 
                sublistId: 'item',
                fieldId: 'item',
                line: 0,
                value: item[0].id
            })
            pedidoVenda.setSublistValue({ // não dinâmico
                sublistId: 'item',
                fieldId: 'amount',
                line: 0,
                value: '200,00'
            })

            pedidoVenda.setSublistValue({ // não dinâmico
                sublistId: 'item',
                fieldId: 'location',
                line: 0,
                value: item[0].location[0].value
            })

            pedidoVenda.setSublistValue({ // não dinâmico
                sublistId: 'item',
                fieldId: 'quantityavailable',
                line: 0,
                value: item[0].quantityavailable
            })
            
            var amount = pedidoVenda.getSublistValue({ // não dinâmico
                sublistId: 'item',
                fieldId: 'amount',
                line: 0,
            })

            var save = pedidoVenda.save({ignoreMandatoryFields: true})

            return objSalesOrder = {
            salesOrderId: save,
            amount: amount,
            msg: 'seu pedido de venda foi criado com sucesso!!'
            }
        }

        function criarDeposito(cust, valor){
            var custDep = record.create({
                type: "customerdeposit",
                isDynamic: true
            })
            custDep.setValue('customer', cust.clienteId)
            custDep.setValue('trandate', new Date())
            custDep.setValue('payment', valor.amount)
            custDep.setValue('salesorder', valor.salesOrderId)
            var save = custDep.save({ignoreMandatoryFields: true})

            return objInvoice = {
                depositoId: save,
                msg: 'Depósito do cliente criado com sucesso.'
            }
        }
        
        function atendimentoItem(obj, cust){
            var ItemFul = record.transform({
                fromType: "salesorder",
                fromId: obj.salesOrderId,
                toType: "itemfulfillment",
                isDynamic: true
            })
            ItemFul.setValue('entity', cust.clienteId)
            ItemFul.setValue('createdfrom', cust.clienteId)
            ItemFul.setValue('trandate', new Date())
        }
    }
    return {
        get: _get,
        post: _post,
    }
});
