/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search', 'N/log', 'N/record'], function(search, log, record) {
    function getInputData() {
        return search.create({
        type: "vendorbill",
        filters:
        [
           ["type","anyof","VendBill"], 
           "AND", 
           ["account","anyof","914"], 
           "AND",  
           ["trandate","within","29/03/2022"]
        ],
        columns:
        [
            search.createColumn({name: "ordertype", label: "Tipo de pedido"}),
            search.createColumn({
                name: "trandate",
                sort: search.Sort.ASC,
                label: "Data"
            }),
            search.createColumn({name: "subsidiary", label: "Subsidiária"}),
            search.createColumn({name: "custbody_rsc_projeto_obra_gasto_compra", label: "Nome do projeto"}),
            search.createColumn({
                name: "custrecord_gst_instal_transaction",
                join: "CUSTRECORD_GST_INSTAL_TRANSACTION",
                label: "Transação"
            }),
            search.createColumn({
                name: "entity",
                sort: search.Sort.ASC,
                label: "Nome"
            }),
            search.createColumn({name: "datecreated", label: "Data de criação"}),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_year_nu",
                join: "installment",
                label: "Ano"
            }),
            search.createColumn({
                name: "installmentnumber",
                join: "installment",
                sort: search.Sort.ASC,
                label: "Número de prestações"
            }),
            search.createColumn({
                name: "duedate",
                join: "installment",
                label: "Data de vencimento"
            }),
            search.createColumn({
                name: "status",
                join: "installment",
                label: "Status"
            }),
            search.createColumn({
                name: "amount",
                join: "installment",
                label: "Valor"
            }),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_interest_cu",
                join: "installment",
                label: "Valor de Juros/Encargos"
            }),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_fine_cu",
                join: "installment",
                label: "Valor da Multa"
            }),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_othervalue_nu",
                join: "installment",
                label: "Valor de Outras Entidades"
            }),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_discount_cu",
                join: "installment",
                label: "Valor do Desconto"
            }),
            search.createColumn({
                name: "amountpaid",
                join: "installment",
                label: "Valor pago"
            }),
            search.createColumn({
                name: "custrecord_rsc_cnab_inst_paymentdate_dt",
                join: "installment",
                label: "Data do Pagamento"
            }),
            search.createColumn({
                name: "amountremaining",
                join: "installment",
                label: "Valor restante"
            }),
            search.createColumn({
                name: "formulacurrency",
                formula: "{installment.amountremaining}",
                label: "Fórmula (moeda)"
            })
        ]
    });
}
    function map(ctx) {
        try{
            var valorCTX = JSON.parse(ctx.value)
            var valorRemain = Number(valorCTX.values["amountremaining.installment"])
            var subId = valorCTX.values.subsidiary.value
            var vendor = valorCTX.values.entity.value
            log.audit('valor do remain', valorRemain)
            log.audit('valor subid', subId)
            log.audit('valor do vendor', vendor)
            var lancamento = record.create({
                type: 'journalentry',
                isDynamic: true
            })
            lancamento.setValue('custbody_gaf_vendor', vendor)
            lancamento.setValue('subsidiary', subId)
            lancamento.setValue('memo', 'Segregação de Curto e Longo Prazo')
            lancamento.setValue('custbodysegregacao_curt_long', true)
            
            lancamento.selectNewLine('line')
            lancamento.setCurrentSublistValue('line','debit', valorRemain)
            lancamento.setCurrentSublistValue('line','memo',"Segregação de Curto e Longo Prazo")
            lancamento.setCurrentSublistValue('line',"account", 924)
            lancamento.commitLine('line')

            lancamento.selectNewLine('line')
            lancamento.setCurrentSublistValue('line','credit', valorRemain)
            lancamento.setCurrentSublistValue('line','memo',"Segregação de Curto e Longo Prazo")
            lancamento.setCurrentSublistValue('line','account', 1331)
            lancamento.commitLine('line')

            var saved = lancamento.save()
            log.audit('id do lançamento', saved)

        }catch(e){
            log.error('error', e)
        }
    }
    return {
        getInputData: getInputData,
        map: map
    }
});