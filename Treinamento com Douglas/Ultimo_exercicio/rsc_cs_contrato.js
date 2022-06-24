/**
 * @NScriptType ClientScript
 * @NApiVersion 2.0
 */

define (['N/record','N/search', 'N/currentRecord', 'N/log', 'N/url', 'N/record'], 
function(record, search, currentRecord, log, url, record){
    
    function pageInit(ctx){
        
    }
    //>>>>>>>>>>>>>>>>>>>> função do botão dentro da pagina reparcelar <<<<<<<<<<<<<<<<<<<<
    
    function reparcelar(){
        try{    
            var datas = []
            var page = currentRecord.get()
            var contratoId = page.getValue('custpage_contrato')
            var tipoJuros = page.getValue('custpage_parcelas_juros')
            var qntParcelas = page.getValue('custpage_quantidade_parcelas')
            
            qntParcelas = Number(qntParcelas)
            
            var searchDataContrato = search.lookupFields({
                type: 'customrecord_rsc_contrato_gs',
                id: contratoId,
                columns: 'custrecord_data_gs'
            })
            var dataContrato = searchDataContrato.custrecord_data_gs
            dataContrato  
            
            var dataJuros = search.create({
                type: 'customrecord_hist_juros_gs',
                filters:['custrecord_hist_juros_refente_gs', 'IS', tipoJuros],
                columns: ['custrecord_hist_data_vigencia_gs','custrecord_hist_valor_aplicado_gs']
            }).run().each(function(result){
                var lista = []
                lista.push(result.getValue('custrecord_hist_data_vigencia_gs'))
                lista.push(result.getValue('custrecord_hist_valor_aplicado_gs'))
                datas.push(lista)
                return true
            })
            var biggest = 0 
            for (i in datas){
                datas[i][0] = Date.parse(datas[i][0])
                if (biggest < Number(datas[i][0])){
                    biggest = Number(datas[i][0])
                }
            }
            var valor = 0
            for (i in datas){
                if (biggest == datas[i][0]){
                    valor = Number(datas[i][1])
                } 
            }
            var searchDataContrato = search.lookupFields({
                type: 'customrecord_rsc_contrato_gs',
                id: contratoId,
                columns: 'custrecord_valor_gs'
            })
            var valorContrato = searchDataContrato.custrecord_valor_gs
            var reajuste = Number(valorContrato) + Number(valorContrato*(valor/100))
            reajuste = reajuste.toFixed(2) 
            var parcelado = (Number(reajuste) / qntParcelas)
            parcelado = parcelado.toFixed(2)
            var parcelascontrato = search.create({
                type: 'customrecord_rsc_contrato_gs',
                filters:['custrecord_contrato_principal_gs', 'IS', contratoId],
                columns: 'internalId'
            }).run().each(function(result){
                var deleteId = result.getValue('internalId')
                record.delete({
                    type: 'customrecord_rsc_contrato_gs',
                    id: deleteId
                })
                return true
            })
            
            var alteraContrato = record.load({
                type: 'customrecord_rsc_contrato_gs',
                id: contratoId
            })
            alteraContrato.setValue('custrecord_valor_gs', reajuste)
            alteraContrato.save({ignoreMandatoryFields: true})
            
            var apoio = reajuste
            var cont = 1
            while (cont <= qntParcelas){
                if (cont == qntParcelas){
                    apoio = apoio.toFixed(2)
                    var criaParcela = record.create({
                        type: 'customrecord_rsc_contrato_gs'
                    })
                    criaParcela.setValue('custrecord_contrato_principal_gs', contratoId)
                    criaParcela.setValue('name', 'Parcela ' + cont)
                    criaParcela.setValue('custrecord_data_gs', new Date())
                    criaParcela.setValue('custrecord_valor_gs', apoio)
                    criaParcela.save({ignoreMandatoryFields: true})
                
            }
                var criaParcela = record.create({
                    type: 'customrecord_rsc_contrato_gs'
                })
                criaParcela.setValue('custrecord_contrato_principal_gs', contratoId)
                criaParcela.setValue('name', 'Parcela ' + cont)
                criaParcela.setValue('custrecord_data_gs', new Date())
                criaParcela.setValue('custrecord_valor_gs', parcelado-0.01)
                criaParcela.save({ignoreMandatoryFields: true})
                cont++
                apoio -= parcelado
                console.log(apoio)
            }
        }catch(e){
            log.debug('Error', e)
        }
        var link = url.resolveRecord({
            recordType: 'customrecord_rsc_contrato_gs',
            recordId: contratoId, 
        })
        window.location.replace(link)
    }
        //>>>>>>>>>>>>>>>>>>>> função do botão para ir para o form reparcelar <<<<<<<<<<<<<<<<<<<<

    function abrirReparcelar(){
        var page = currentRecord.get()
        var contratoId = page.id
        var parcelas = []
        search.create({
            type: 'customrecord_rsc_contrato_gs',
            filters:['custrecord_contrato_principal_gs', 'IS', contratoId]
        }).run().each(function(result){
            parcelas.push(result)
        })
        if(parcelas.length != 0){
            var suiteLet = url.resolveScript({
                scriptId: 'customscript_rsc_sl_reparcelamento',
                deploymentId: 'customdeploy_rsc_sl_reparcelamento'
            })
            window.location.replace(suiteLet)
        }else{
            alert('Não há parcelas para esse contrato')
        }
    }

        //>>>>>>>>>>>>>>>>>>>> função para setar um valor como desabilitado <<<<<<<<<<<<<<<<<<<<

    function fieldChanged(ctx){
        try{    
            var datas = []
            var page = ctx.currentRecord
            var contratoId = page.getValue('custpage_contrato')
            var tipoJuros = page.getValue('custpage_parcelas_juros')
            var qntParcelas = page.getValue('custpage_quantidade_parcelas')
            qntParcelas = Number(qntParcelas)
            
            if (ctx.fieldId === 'custpage_quantidade_parcelas' && qntParcelas && tipoJuros){
                
                var searchDataContrato = search.lookupFields({
                    type: 'customrecord_rsc_contrato_gs',
                    id: contratoId,
                    columns: 'custrecord_data_gs'
                })
                var dataContrato = searchDataContrato.custrecord_data_gs
                dataContrato  
                
                var dataJuros = search.create({
                    type: 'customrecord_hist_juros_gs',
                    filters:['custrecord_hist_juros_refente_gs', 'IS', tipoJuros],
                    columns: ['custrecord_hist_data_vigencia_gs','custrecord_hist_valor_aplicado_gs']
                }).run().each(function(result){
                    var lista = []
                    lista.push(result.getValue('custrecord_hist_data_vigencia_gs'))
                    lista.push(result.getValue('custrecord_hist_valor_aplicado_gs'))
                    datas.push(lista)
                    return true
                })
                // console.log('valor da data do contrato', dataContrato)
                // console.log('data de vigência dos juros:', datas)
                // console.log('data de vigência de um juros juros:', searchDataContrato)
                
                console.log(datas)
                var biggest = 0 
                for (i in datas){
                    datas[i][0] = Date.parse(datas[i][0]) 
                    if (biggest < Number(datas[i][0])){
                        biggest = Number(datas[i][0])
                    }
                }
                var valor = 0
                for (i in datas){
                    if (biggest == datas[i][0]){
                        valor = Number(datas[i][1])
                    } 
                }
                
                var searchDataContrato = search.lookupFields({
                    type: 'customrecord_rsc_contrato_gs',
                    id: contratoId,
                    columns: 'custrecord_valor_gs'
                })
                var valorContrato = searchDataContrato.custrecord_valor_gs
                var reajuste = Number(valorContrato) + Number(valorContrato*(valor/100)) 
                var parcelado = (Number(reajuste) / qntParcelas)
                parcelado = parcelado.toFixed(2)
                console.log(parcelado)
                var apresentacao = 'Contrato Atualizado: ' + reajuste.toFixed(2) + ', valor das parcelas: '+ parcelado
                page.setValue({
                    fieldId: 'custpage_resumo_parcelas',
                    value: apresentacao
                })
            }
        }catch(e){
            log.debug('Error', e)
        }
    }
    return{
        pageInit: pageInit,
        reparcelar: reparcelar,
        abrirReparcelar: abrirReparcelar,
        fieldChanged: fieldChanged
    }
    
})