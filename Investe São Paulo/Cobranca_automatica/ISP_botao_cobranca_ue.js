/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/ui/serverWidget', 'N/log','N/search', 'N/record'], function(ui, log, search, record) {

    function beforeLoad(ctx) {
        var page = ctx.newRecord
        var status = page.getValue('status')
        if(status == "Aprovação do supervisor pendente"){
            var form = ctx.form
            form.addButton({
                id: 'custpage_button_finaliza',
                label: 'Finalizar Cobrança',
                functionName: 'finalizar_cobranca'
            })
            form.clientScriptModulePath = './ISP_finalizarCobranca_cs.js' 
       
        }else if (status == "Pago integralmente"){
            var contaTax = 340
            var fornecedor = 82873
            
            function criaCobrança(forn, registro, impostoValue, contaImposto){
                var bill = record.create({
                    type: 'vendorbill',
                    isDynamic: true,
                })
                bill.setValue('approvalstatus', 2) //em aberto
                bill.setValue('entity', forn)
                bill.setValue('account',1133)
                bill.setValue('tranid', registro.getValue('tranid'))
                .setValue('trandate', registro.getValue('trandate'))
                .setValue('duedate', registro.getValue('duedate'))
                .setValue('memo', registro.getValue('memo'))
                .setValue('class', registro.getValue('class'))
                .setValue('subsidiary', registro.getValue('subsidiary'))
                
                bill.selectNewLine('expense')
                .setCurrentSublistValue({sublistId: 'expense', fieldId: 'account',value: contaImposto})
                .setCurrentSublistValue({sublistId: 'expense', fieldId: 'amount',value: impostoValue})
                .commitLine('expense')
                
    
                return bill.save({ignoreMandatoryFields: true, enableSourcing: true})
            }
            var id = []
            log.audit('valor da descrição', page.getValue('memo'))
            var recordId = Number(page.id)
            
            var listaTax = []
            search.create({
                type: "transaction",
                filters:
                [
                    ["mainline","is","T"], 
                    "AND", 
                    ["type","anyof","PurchOrd","VendBill"], 
                    "AND", 
                    ["internalid","anyof",recordId]
                ],
                columns:
                [
                    search.createColumn({name: "createdfrom", label: "Criar a partir de"}),
                    search.createColumn({name: "internalid", join: "createdFrom", label: "ID interno"})

                ]
                }).run().each(function(result){
                    id.push(result.getValue({name: "internalid", join: "createdFrom", label: "ID interno"}))
                    return true
                })
                log.audit('valor da busca', id)
            
            var pedido = record.load({
                type: 'purchaseorder',
                id: id[0],
                isDynamic: true
            })
            var line = pedido.getLineCount('taxdetails')
            log.audit('line',line)
            for(i = 0; i < pedido.getLineCount('taxdetails'); i++){
                pedido.selectLine('taxdetails', i) 
                var objTax = {
                    "calcdetail": pedido.getCurrentSublistValue('taxdetails','calcdetail'),
                    "linename": pedido.getCurrentSublistValue('taxdetails','linename'),
                    "linenumber": pedido.getCurrentSublistValue('taxdetails','linenumber'),
                    "linetype": pedido.getCurrentSublistValue('taxdetails','linetype'),
                    "netamount": pedido.getCurrentSublistValue('taxdetails','netamount'),
                    "taxamount": pedido.getCurrentSublistValue('taxdetails','taxamount'),
                    "taxbasis": pedido.getCurrentSublistValue('taxdetails','taxbasis'),
                    "taxcode": Number(pedido.getCurrentSublistValue('taxdetails','taxcode')),
                    "taxdetailsreference": pedido.getCurrentSublistValue('taxdetails','taxdetailsreference'),
                    "taxrate": pedido.getCurrentSublistValue('taxdetails','taxrate'),
                    "taxtype": Number(pedido.getCurrentSublistValue('taxdetails','taxtype'))
                }
                listaTax.push(objTax)
            }
            //console.log(JSON.stringify(objTax))

            if(listaTax.length > 0){
                /**
                cofins: id 7 
                csll: id 9 
                pis id 6
                */
                
                //console.log('valor da lista', listaTax)
                var valorTax;
                var pccTax = []
                var detalhes = {
                    sucesso: [],
                    erro:[]
                }
                for (i=0; i<listaTax.length; i++){
                    if(listaTax[i].taxamount > 0 && listaTax[i].taxtype == '7' || listaTax[i].taxtype == '9' || listaTax[i].taxtype == '6'){
                        pccTax.push(listaTax[i])
                        valorTax += Number(listaTax[i].taxamount)
                    }
                }
                try{
                    detalhes.sucesso.push(criaCobrança(fornecedor, page, valorTax, contaTax))
                }catch(e){
                    log.error('error', e)
                        detalhes.erro.push(e)
                }
                
                if(pccTax.length == 0){}
                log.audit('valor da lista impostos', pccTax)
            }
            log.audit('terminei')
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});
