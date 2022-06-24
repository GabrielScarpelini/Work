/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record','N/log', 'N/runtime'], function(search, record, log, runtime){
var getInputData = function(){
    return search.create({    
        type: "employee",
        filters:
        [
            ["systemnotes.context","anyof","RST"], 
            "AND", 
            ["systemnotes.name","anyof","23409"]
        ],
        columns:
        ['internalid', 'subsidiary']
    })
}
function map(ctx){
    try{
        var valorCTX = JSON.parse(ctx.value)
        log.debug('valor ctx', valorCTX)

        var relatorio = record.create({
            type: 'expensereport',
            isDynamic: true

        })
        var objeto = {
            entity: valorCTX.id,
            subsidiary: valorCTX.values.subsidiary.value,
            memo: 'Reembolso'
            
        }

        Object.keys(objeto).forEach(function(result){
            //log.debug('valor result', result)
            relatorio.setValue({
                fieldId: result,
                value: objeto[result]
            })
        })
        relatorio.selectNewLine('expense')
        relatorio.setCurrentSublistValue('expense','category', '41')
        relatorio.setCurrentSublistValue('expense','currency', '1')
        relatorio.setCurrentSublistValue('expense','amount', '100.00')
        relatorio.setCurrentSublistValue('expense','exchangerate', '1.00')
        relatorio.commitLine('expense')
        //var saving = relatorio.save({ignoreMandatoryFields: true})
        //log.debug('Valor do save', saving)

        const scriptAtual = runtime.getCurrentScript();
        const parametro = JSON.parse(scriptAtual.getParameter({name: 'custscript_rsc_funcionario'}));
        log.debug('valor do parametro', parametro)

        var copia = record.copy({
            type: 'expensereport',
            id: parametro,
            isDynamic: true,
            defaultValue:{
                custbody_rsc_tipo_transacao_workflow: 16
            }
        })
        copia.selectLine('expense', 0) // 
        var total = copia.getCurrentSublistValue('expense','amount') * 2
        copia.setCurrentSublistValue('expense','amount', total) 
        copia.commitLine('expense')
        //var valores = copia.save({ignoreMandatoryFiels: true})
        //log.debug('valor de valores', valores)

    }catch(e){
        log.debug('error', e)
    }
}
return{
    getInputData: getInputData,
    map: map
}
})