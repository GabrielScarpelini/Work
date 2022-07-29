/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord','N/log','N/search', 'N/record'], function(currentRecord, log, search, record) {

    function pageInit(ctx) {
        var page = ctx.currentRecord
        console.log(page)
        var status = page.getValue('approvalstatus')
        console.log('valor do status >>>>>>>>>>>><<<<<<<<<<<<<', status)
    }

    function finalizar_cobranca(){
        var imposto;
        var contaTax;
        var fornecedor;
        function changeTax(Tax){
            switch(Tax){
                case 17: // IR
                contaTax = 347  // conta 514 
                fornecedor = 82873   // imposto federal
                break
                case 14: //INSS
                    contaTax = 334  //conta 184   
                    fornecedor = 82873   // imposto federal
                    break
                case 13: //INSS
                    contaTax =  342 //conta 184   
                    fornecedor = 82873   // imposto federal
                    break
                case 3: //ISS
                    contaTax =  342 //conta 173 
                    fornecedor = 82872 // Orgão Municipal (Impostos)
                    break
            }
            return fornecedor, contaTax
        }
        
        function criaCobrança(forn, registro, impostoValue, contaImposto){
            var bill = record.create({
                type: 'vendorbill',
                isDynamic: true,
            })
            bill.setValue('nexus', 2)
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
        var page = currentRecord.get()
        console.log(JSON.stringify(page))
        var recordId = Number(page.id)
        var registroClone = record.load({
            type: 'vendorbill',
            id: recordId,
        })
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
         console.log('valor da busca', id)
        
        var pedido = record.load({
            type: 'purchaseorder',
            id: id[0],
            isDynamic: true
        })
        var line = pedido.getLineCount('taxdetails')
        console.log(line)
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
            inss pj = 14 
            inss pf = 13
            iss = 3 
            irrf = 17  
            */
            
            //console.log('valor da lista', listaTax)
            var iss_inss_ir = []
            var detalhes = {
                sucesso: [],
                erro:[]
            }
            for (i=0; i<listaTax.length; i++){
                try{
                    if(listaTax[i].taxamount > 0 && listaTax[i].taxtype == '17'){
                        iss_inss_ir.push(listaTax[i])
                        imposto = Number(listaTax[i].taxtype)
                        valorTax = Number(listaTax[i].taxamount)
                        changeTax(imposto)
                        detalhes.sucesso.push(criaCobrança(fornecedor, registroClone, valorTax, contaTax))
                    }else if (listaTax[i].taxamount > 0 && listaTax[i].taxtype == '3'){
                        iss_inss_ir.push(listaTax[i])
                        imposto = Number(listaTax[i].taxtype)
                        valorTax = Number(listaTax[i].taxamount)
                        changeTax(imposto)
                        detalhes.sucesso.push(criaCobrança(fornecedor, registroClone, valorTax, contaTax))
                    }else if(listaTax[i].taxamount > 0 && listaTax[i].taxtype == '14'|| listaTax[i].taxtype == '13'){
                        iss_inss_ir.push(listaTax[i])
                        imposto = Number(listaTax[i].taxtype)
                        valorTax = Number(listaTax[i].taxamount)
                        changeTax(imposto)
                        detalhes.sucesso.push(criaCobrança(fornecedor, registroClone, valorTax, contaTax))
                    }
                }catch(e){
                    log.error('error', e)
                    detalhes.erro.push(e)
                }
            }
            console.log(detalhes)
            for(i = 0; i<detalhes.sucesso.length; i++){
                record.submitFields({
                    type: 'vendorbill',
                    id: detalhes.sucesso[i],
                    values: {
                        'approvalstatus' : 2 // em aberto
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                })
            }
            record.submitFields({
                type: 'vendorbill',
                id: recordId,
                values: {
                    'approvalstatus' : 2 //em aberto
                },
                options: {
                    ignoreMandatoryFields: true
                }
            })
            if(iss_inss_ir.length == 0){
                record.submitFields({
                    type: 'vendorbill',
                    id: recordId,
                    values: {
                        'approvalstatus' : 2 //em aberto
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                })
            }
            console.log('valor da lista impostos', iss_inss_ir)
        }else{
            record.submitFields({
                type: 'vendorbill',
                id: recordId,
                values: {
                    'approvalstatus' : 2 //em aberto
                },
                option: {
                    ignoreMandatoryFields: true
                }
            })
        }
       console.log('terminei')
       window.reload()
    }

    return {
        pageInit: pageInit,
        finalizar_cobranca: finalizar_cobranca
    }
});
