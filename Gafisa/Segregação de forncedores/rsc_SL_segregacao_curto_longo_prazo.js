/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/log', 'N/url', 'N/search', 'N/currentRecord'], function(ui, record, log, url, search, currentRecord) {

    function onRequest(ctx) {
        
        const request = ctx.request;
        const method = request.method;
        const response = ctx.response;
        const parameters = request.parameters;
        var form = ui.createForm({
            title: "Segregação de curto e longo prazo"
        })
            form.addField({
                label: "Data de Segregação",
                type: ui.FieldType.DATE,
                id: "custpage_data_segregacao",
            }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});
            
            form.addField({
                label: "Mês Corrente",
                type: ui.FieldType.INTEGER,
                id: "custpage_me_correntes",
            }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE})

            var sublist = form.addSublist({
                id: 'custpage_sublist',
                label: 'Faturas',
                type: ui.SublistType.INLINEEDITOR
            });;
            
            sublist.addButton({
                id: 'custpage_marar_all_parcela',
                label: 'Marcar Tudo',
                functionName: 'selecionar'
            })
            sublist.addButton({
                id: 'custpage_desmarcar_all_parcela',
                label: 'Desamarcar Tudo',
                functionName: 'desmarcar'
            })
            
            sublist.addField({
                id: 'custpage_pegar_parcela',
                type: ui.FieldType.CHECKBOX,
                label: 'Selecionar'
            });
            
            sublist.addField({
                id: 'custpage_prestacoes',
                type: ui.FieldType.INTEGER,
                label: 'Número de Prestações'
            });
            
            sublist.addField({
                id: 'custpage_data',
                type: ui.FieldType.DATE,
                label: 'Data'
            });

            sublist.addField({
                id: 'custpage_subsidiary',
                type: ui.FieldType.TEXT,
                label: 'Subsidiária'
            });

            sublist.addField({
                id: 'custpage_fornecedor',
                type: ui.FieldType.TEXT,
                label: 'Fornecedor'
            });

            sublist.addField({
                id: 'custpage_vencimento',
                type: ui.FieldType.DATE,
                label: 'Data de Vencimento'
            });

            sublist.addField({
                id: 'custpage_status',
                type: ui.FieldType.TEXT,
                label: 'Status'
            });

            sublist.addField({
                id: 'custpage_valor',
                type: ui.FieldType.FLOAT,
                label: 'Valor da Parcela'
            });

            form.addSubmitButton({
                id: 'custpage_criar_lancamento',
                label: 'Criar Lançamento Contábil',
                functionName: 'criar'
            })

            ctx.response.writePage(form)
        
        if (method == 'GET'){

            var resultados = []
            var data = new Date()
            var mes = data.getMonth()
            var ano = data.getFullYear()
            var dataVigencia
            switch(mes){
                case 1:
                    dataVigencia = "31/12/"+ (ano - 1).toString() 
                    break
                case 2:
                    dataVigencia = "31/01/" + ano.toString()
                    break
                case 3:
                    if((ano % 4 == 0 && ano % 100 != 0) || ano % 400 == 0){
                        dataVigencia = "29/02/" + ano.toString()
                        break 
                    }else{
                        dataVigencia = "28/02/" + ano.toString()
                        break}
                case 4:
                    dataVigencia = "31/03/" + ano.toString()
                    break
                case 5:
                    dataVigencia = "30/04/" + ano.toString()
                    break
                case 6:
                    dataVigencia = "31/05/" + ano.toString()
                    break
                case 7:
                    dataVigencia = "30/06/" + ano.toString()
                    break
                case 8:
                    dataVigencia = "31/07/" + ano.toString()
                    break
                case 9:
                    dataVigencia = "31/08/" + ano.toString()
                    break
                case 10:
                    dataVigencia = "30/09/" + ano.toString()
                    break
                case 11:
                    dataVigencia = "31/10/" + ano.toString()
                    break
                case 12:
                    dataVigencia = "30/11/" + ano.toString()
                    break
                }
                // form.setValue('custpage_me_correntes', mes)
                // form.setValue('custpage_data_segregacao', dataVigencia)

            var busca = search.create({
                type: "vendorbill",
                filters:
                [
                ["type","anyof","VendBill"], 
                "AND", 
                ["account","anyof","914"], 
                "AND",  
                ["trandate","within", dataVigencia]
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
            }).run().each(function(result){
                log.audit('valor do result', result)
                resultados.push({
                    data: result.getValue("trandate"),
                    subsidiary: result.getText("subsidiary"),
                    vendor: result.getText("entity"),
                    numeroParcelas: result.values['installment.installmentnumber'],
                    dataVenci: result.values['installment.duedate'],
                    status: result.values['installment.status'],
                    valor: result.values['installment.amount']
                })
                return true
            })

            for(var i = 0; i < resultados.length; i++){
                sublist.setSublistValue({
                    id: "custpage_data",
                    line: i,
                    value: resultados[i].data
                })
                
                sublist.setSublistValue({
                    id: "custpage_subsidiary",
                    line: i,
                    value: resultados[i].subsidiary
                })
                
                sublist.setSublistValue({
                    id: "custpage_vencimento",
                    line: i,
                    value: resultados[i].dataVenci
                })
                
                sublist.setSublistValue({
                    id: "custpage_status",
                    line: i,
                    value: resultados[i].status
                })
                
                sublist.setSublistValue({
                    id: "custpage_fornecedor",
                    line: i,
                    value: resultados[i].vendor
                })
                
                sublist.setSublistValue({
                    id: "custpage_valor",
                    line: i,
                    value: resultados[i].valor
                })
                
                sublist.setSublistValue({
                    id: "custpage_prestacoes",
                    line: i,
                    value: resultados[i].numeroParcelas
                })
            }
            
        }
    }

    return {
        onRequest: onRequest
    }
});
