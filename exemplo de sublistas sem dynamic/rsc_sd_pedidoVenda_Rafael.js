/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@Author Rafael Oliveira
 */
 define(['N/log', 'N/search', 'N/runtime', 'N/record'], function(log, search, runtime, record) {

    function execute(ctx) {
        try {
            var script = runtime.getCurrentScript() // acessa o script atual
            var parametro = JSON.parse(script.getParameter({name:'custscript_rsc_cliente'})); // pega o parametro 
                                                                              // do script ( parecido com o getValue )
            log.debug('script scheduled: ', script)
            log.debug('Parametro scheduled: ', parametro)
            var listaCliente = []
            var busca = search.create({
                type: "customer",
                filters:
                [
                    ["systemnotes.context","anyof","RST"], 
                    "AND", 
                    ["systemnotes.name","anyof","23410"]
                ],
                columns:
                [
                    search.createColumn({name: "email", label: "E-mail"}),
                    search.createColumn({name: "subsidiary", label: "Subsidiária principal"}),
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.ASC,
                        label: "ID"
                    })
                ]
            });
            busca.run().each(function(result){
            listaCliente.push({
                id: result.getValue('internalid'),
                subsidiary: result.getValue('subsidiary'),
                email: result.getValue('email'),
            }) 
            return true;
        });
        log.debug('Lista de clientes: ', listaCliente)
        for (i in listaCliente){
            var recordVenda = record.create({
                type: record.Type.SALES_ORDER,
                // isDynamic: true,
                defaultValues: {
                    entity: listaCliente[i].id,
                    subsidiary: listaCliente[i].subsidiary
                }
            })
            recordVenda.setValue({
                fieldId: 'email' ,
                value: listaCliente[i].email
            })
            recordVenda.setValue({ //TIPO DE TRANSAÇÃO DE WORKFLOW 
                fieldId: 'custbody_rsc_tipo_transacao_workflow' ,
                value: 22
            })
            recordVenda.setValue({ // ETAPA DA TRANSAÇÃO
                fieldId: 'custbody_rsc_etapa_requisicao' ,
                value: 1
            })
            recordVenda.setValue({ // DATA
                fieldId: 'trandate' ,
                value: new Date()
            })
            recordVenda.setValue({ // DATA EFETIVA DAS VENDAS
                fieldId: 'saleseffectivedate' ,
                value: new Date()
            })

            recordVenda.setSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: 0,
                value: '287'
            })
            recordVenda.setSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: 0,
                value: '1'
            })
            recordVenda.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: 0,
                value: '200'
            })
            recordVenda.setSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: 0,
                value: '200'
            })
    
            var salvamento = recordVenda.save({ignoreMandatoryFields: true})
            log.debug('Funcionou...')
        }
        if (parametro){
            var recordCopiado = record.copy({
                type: record.Type.SALES_ORDER,
                id: parametro,
                isDynamic: true,
                defaultValues: {
                    entity: listaCliente[i].id,
                }
            });
            recordCopiado.selectLine('item', 0)
            // recordCopiado.setCurrentSublistValue('item', 'item', '287')
            var total = recordCopiado.getCurrentSublistValue('item', 'amount') 
            log.debug('total <<<<<<<<<<<<>>>>>', total)
            total = total * 2
            recordCopiado.setCurrentSublistValue('item', 'amount', total)
            recordCopiado.commitLine('item')
    
            var copiaid = recordCopiado.save({ignoreMandatoryFields: true})
            log.audit('id da copia: ', copiaid)
    
            log.audit('RecordCopiado: ', recordCopiado)
            log.audit('amount: ', recordCopiado.amount)
        }

        } catch (error) {
            log.error('Erro catch: ', error)
        }
        
    }
    
        return {
            execute: execute
        }
    });
    