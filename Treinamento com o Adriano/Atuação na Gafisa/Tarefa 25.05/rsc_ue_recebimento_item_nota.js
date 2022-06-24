/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record'],
function(log, record) {

    function beforeLoad(ctx) {
        var page = ctx.newRecord;
        log.debug('valor do Id', page)
        var idRecibo = ctx.request.parameters.itemrcpt
        page.setValue({
            fieldId: 'custbody_rsc_numero_recebimento_fisico',
            value: idRecibo
        })

        // var arquivo = file.create({
        //     name: 'Setando valor',
        //     fileType: file.Type.PLAINTEXT,
        //     contents: JSON.stringify(ctx),
        //     folder: 1658
        // }) 
        // var salvando = arquivo.save()
    }
    function afterSubmit(ctx) {
        var page = ctx.newRecord
        var pageid = page.id // id da fatura 
        var recibo = page.getValue('custbody_rsc_numero_recebimento_fisico') // pegando o valor do recebimento de item
        record.submitFields({ // faz o papel de record load e o value de setValue 
            type: 'itemreceipt', // recebimento de item 
            id: recibo, // id que foi salvo no campo do getValue
            values: {
                'custbody_rsc_numero_fatura_for': pageid // como é afterSubmit o ID não existe ainda 
            },
            options: {
                enablesourcing: true
            }
        })
    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }
});
