/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord','N/log','N/search', 'N/record'], function(currentRecord, log, search, record) {

    function pageInit(ctx) {
    }

    function finalizar_cobranca(){
        function criaCobrança(forn, conta, page, imposto){
            var bill = record.create({
                type: 'vendorbill',
                isDynamic: true,
                defaultValues: {
                    entity: forn,
                    account: conta
                }
            })
            bill.setValue('tranid', page.getValue('tranid'))
            .setValue('trandate', page.getValue('trandate'))
            .setValue('duedate', page.getValue('duedate'))
            .setValue('memo', page.getValue('memo'))
            .setValue('class', page.getValue('class'))
            .setValue('subsidiary', page.getValue('subsidiary'))

            bill.selectNewLine('taxdetails')
            Object.keys(imposto).forEach(function(bodyField) {
                bill.setSublistValue({
                    sublistId:'taxdetails',
                    fieldId: bodyField,
                    value: imposto[bodyField]
                })
            })
            

        }
        
        var id = []
        var page = currentRecord.get()
        var recordId = Number(page.id)
        console.log('recordId', recordId)
        var listaTax = []
        var busca = search.create({     
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
                "taxcode": pedido.getCurrentSublistValue('taxdetails','taxcode'),
                "taxdetailsreference": pedido.getCurrentSublistValue('taxdetails','taxdetailsreference'),
                "taxrate": pedido.getCurrentSublistValue('taxdetails','taxrate'),
                "taxtype": pedido.getCurrentSublistValue('taxdetails','taxtype')
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
            for (i=0; i<listaTax.length; i++){
                if(listaTax[i].taxamount > 0 && listaTax[i].taxtype == '17'||listaTax[i].taxtype == '3'||listaTax[i].taxtype == '14'||listaTax[i].taxtype == '13'){
                    iss_inss_ir.push(listaTax[i])
                }
            }
            if(iss_inss_ir.length == 0){
                record.submitFields({
                    type: 'vendorbill',
                    id: recordId,
                    values: {
                        'status' : 2
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
                    'status' : 2
                },
                option: {
                    ignoreMandatoryFields: true
                }
            })
        }
       
    }

    return {
        pageInit: pageInit,
        finalizar_cobranca: finalizar_cobranca
    }
});
