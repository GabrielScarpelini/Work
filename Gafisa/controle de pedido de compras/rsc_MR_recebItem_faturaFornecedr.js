/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 *@Author Rafael Oliveira
 */
define(['N/log','N/search', 'N/record'], function(log, search, record) {

    function getInputData() {
        return search.create({
            type: "purchaseorder",
            filters:
            [  ["mainline","is","T"], 
                "AND",
               ["type","anyof","PurchOrd"], 
                "AND",
               ["employee","anyof","25225","25333"]
            ],
            columns:["internalid", "entity"]
         })
        }

    function map(ctx) {
        try {
            log.debug('ctx', ctx)
            var pedidoCompra = ctx.key

            var itemRecebido = criarRecebimentoItem(pedidoCompra)
            log.debug('itemRecebidoId:', itemRecebido)

            var faturaFornecedor = criarFaturaFornecedor(pedidoCompra)
            log.debug('faturaFornecedorId:', faturaFornecedor)

            var chamarRestlet = callRestlet(pedidoCompra)

        } catch (e) {
            log.error('Erro: ', e)
        }

        function criarRecebimentoItem(pedidoCompra){
            var registro = record.transform({
                fromType: 'purchaseorder',
                fromId: pedidoCompra,
                toType: 'itemreceipt',
                isDynamic: true
            })
            registro.setValue('custbody_rsc_data_emissao_nf_receb', new Date())
            var saved = registro.save({ignoreMandatoryFields: true})
            return saved
        }
    
        function criarFaturaFornecedor(pedidoCompra){
            var registro = record.transform({
                fromType: 'purchaseorder',
                fromId: pedidoCompra,
                toType: 'vendorbill',
                isDynamic: true
            })
            registro.setValue('custbody_rsc_cnab_bankaccount_ls', 459)
            var saved = registro.save({ignoreMandatoryFields: true})
            return saved
        }
    
        function callRestlet(pedidoCompra){
            var pedido = record.load({
                type: 'purchaseorder',
                id: pedidoCompra,
                isDynamic: false
            })
            restletObjeto = {
                funcionarioId : pedido.getValue('employee'),
                itemId : pedido.getValue('item'),
                itemQTY : pedido.getValue('quantity'),
                itemLocation : pedido.getValue('location')
            }
            log.debug('restletObjetoa: ', restletObjeto)
        }
    }

    function reduce(ctx) {
        
    }

    function summarize(summary) {
        
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
