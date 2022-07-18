    /**
    *@NApiVersion 2.1
    *@NScriptType Suitelet
    */

    var dat = new Date()
    var mes = dat.getMonth()
    var year = dat.getFullYear()
    const periodo = {
        jan:'JAN/'+ year,
        fev:'FEV/'+ year,
        mar:'MAR/'+ year,
        abr:'ABR/'+ year,
        mai:'MAI/'+ year,
        jun:'JUN/'+ year,
        jul:'JUL/'+ year,
        ago:'AGO/'+ year,
        set:'SET/'+ year,
        out:'OUT/'+ year,
        nov:'NOV/'+ year,
        dez:'DEZ/'+ year
    }

    define(['N/ui/serverWidget', 'N/record', 'N/log', 'N/url', 'N/search', 'N/file', 'N/ui/message', 'N/redirect'], function(ui, record, log, url, search, file, message, redirect) {

        function onRequest(ctx) {
            const request = ctx.request;
            const method = request.method;
            const response = ctx.response;
            const parameters = request.parameters;
            var form = ui.createForm({
                title: "Segregação de curto e longo prazo"
            })
                var dataSegregacao = form.addField({
                    label: "Data de Segregação",
                    type: ui.FieldType.DATE,
                    id: "custpage_data_segregacao",
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE});

                var mesCorrente = form.addField({
                    label: "Mês Corrente",
                    type: ui.FieldType.TEXT,
                    id: "custpage_me_correntes",
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE})
                
                var idBusca = form.addField({
                    label: "ID da Busca",
                    type: ui.FieldType.TEXT,
                    id: "custpage_id_busca",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})
                
                var processado = form.addField({
                    label: "Processado com Sucesso",
                    type: ui.FieldType.CHECKBOX,
                    id: "custpage_process",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})
                
                var parcialProcess = form.addField({
                    label: "Processado Parcialmente",
                    type: ui.FieldType.CHECKBOX,
                    id: "custpage_processa_parc",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})
                
                var naoProcess = form.addField({
                    label: "Processado Parcialmente",
                    type: ui.FieldType.CHECKBOX,
                    id: "custpage_nao_process",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})

                var textArea = form.addField({
                    label: "Texto JSON",
                    type: ui.FieldType.TEXTAREA,
                    id: "custpage_json_holder",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})

                var campo_jsonSP = form.getField({id:"custpage_json_holder"});
                    campo_jsonSP.maxLength = 400000;

                var sublist = form.addSublist({
                    id: 'custpage_sublist',
                    label: 'Faturas',
                    type: ui.SublistType.LIST
                });

                //sublist.addMarkAllButtons();

                var marcaTudo = sublist.addButton({
                    id: 'custpage_marar_all_parcela',
                    label: 'Marcar Tudo',
                    functionName: 'selecionar'
                })
                var desmarcaTudo = sublist.addButton({
                    id: 'custpage_desmarcar_all_parcela',
                    label: 'Desamarcar Tudo',
                    functionName: 'desmarcar'
                })

                var checkBox = sublist.addField({
                    id: 'custpage_pegar_parcela',
                    type: ui.FieldType.CHECKBOX,
                    label: 'Selecionar'
                });

                var idFatura = sublist.addField({
                    id: 'custpage_id_fatura',
                    type: ui.FieldType.TEXT,
                    label: 'Id fatura'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})
                
                var Idcriado = sublist.addField({
                    id: 'custpage_id_criado',
                    type: ui.FieldType.TEXT,
                    label: 'Id fatura'
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN})

                var numFaturaFornece = sublist.addField({
                    id: 'custpage_num_fatura',
                    label: 'Número da fatura',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
                
                var tipoSegregação = sublist.addField({
                    id: 'custpage_tipo',
                    label: 'Tipo de Segregação',
                    type: ui.FieldType.TEXT
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})

                var numPrestacoes = sublist.addField({
                    id: 'custpage_prestacoes',
                    type: ui.FieldType.INTEGER,
                    label: 'Número de Prestações'
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
                
                
                var date = sublist.addField({
                    id: 'custpage_data',
                    type: ui.FieldType.DATE,
                    label: 'Data'
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})
                
                var sub = sublist.addField({
                    id: 'custpage_subsidiary',
                    type: ui.FieldType.SELECT,
                    source: 'subsidiary',
                    label: 'Subsidiária'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE})
                
                var fornece = sublist.addField({
                    id: 'custpage_fornecedor',
                    type: ui.FieldType.SELECT,
                    source: 'vendor',
                    label: 'Fornecedor'
                }).updateDisplayType({displayType: ui.FieldDisplayType.INLINE})

                var statusFatura = sublist.addField({
                    id: 'custpage_status',
                    type: ui.FieldType.TEXT,
                    label: 'Status'
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})

                var valorCompra = sublist.addField({
                    id: 'custpage_valor',
                    type: ui.FieldType.CURRENCY,
                    label: 'Valor Total'
                }).updateDisplayType({displayType: ui.FieldDisplayType.DISABLED})

                form.addSubmitButton({
                    id: 'custpage_criar_lancamento',
                    label: 'Criar Lançamento Contábil',
                    functionName: 'criar'
                })

                form.clientScriptModulePath = './gaf_segreg_funcbotoes_gp_cs.js'
                ctx.response.writePage(form)

            if (method == 'GET'){
                try{
                    var resultados = []
                    var data = new Date()
                    var mes = data.getMonth() + 1 
                    var ano = data.getFullYear()
                    var dataVigencia, month
                    switch(mes){
                        case 1:
                            dataVigencia = "31/12/"+ (ano - 1).toString()
                            month = periodo.jan
                            break
                        case 2:
                            dataVigencia = "31/01/" + ano.toString()
                            month = periodo.fev
                            break
                        case 3:
                            month = periodo.mar
                            if((ano % 4 == 0 && ano % 100 != 0) || ano % 400 == 0){
                                dataVigencia = "29/02/" + ano.toString()
                                break 
                            }else{
                                dataVigencia = "28/02/" + ano.toString()
                                break}
                        case 4:
                            dataVigencia = "31/03/" + ano.toString()
                            month = periodo.abr
                            break
                        case 5:
                            dataVigencia = "30/04/" + ano.toString()
                            month = periodo.mai
                            break
                        case 6:
                            dataVigencia = "31/05/" + ano.toString()
                            month = periodo.jun
                            break
                        case 7:
                            dataVigencia = "30/06/" + ano.toString()
                            month = periodo.jul
                            break
                        case 8:
                            dataVigencia = "31/07/" + ano.toString()
                            month = periodo.ago
                            break
                        case 9:
                            dataVigencia = "31/08/" + ano.toString()
                            month = periodo.set
                            break
                        case 10:
                            dataVigencia = "30/09/" + ano.toString()
                            month = periodo.out
                            break
                        case 11:
                            dataVigencia = "31/10/" + ano.toString()
                            month = periodo.nov
                            break
                        case 12:
                            dataVigencia = "30/11/" + (ano - 1).toString()
                            month = periodo.dez
                            break
                        }
                        log.audit('mes Corrente', mes)
                        log.audit('data', data)
                        log.audit('data vigencia', dataVigencia)
                        mesCorrente.defaultValue = month 
                        dataSegregacao.defaultValue = dataVigencia


                    var busca = search.create({
                        type: "vendorbill",
                        filters:
                        [
                        ["type","anyof","VendBill"], 
                        "AND", 
                        ["account","anyof","914"], 
                        "AND",  
                        ["trandate","within", '29/03/2022'],
                        'AND',
                        ['internalid', 'IS', 225110],
                        "AND", 
                        ["status","anyof","VendBill:A"]
                        ],
                        columns:
                        [
                            search.createColumn({name: "ordertype", label: "Tipo de pedido"}),
                            search.createColumn({name: "class", label: "Etapa do projeto"}),
                            search.createColumn({name: "custbody_rsc_projeto_obra_gasto_compra", label: "Nome do projeto"}),
                            search.createColumn({name: "department", label: "Departamento"}),
                            search.createColumn({name: "location", label: "Localidade"}),
                            search.createColumn({name: "tranid", label: "Algo aqui"}),
                            search.createColumn({
                                name: "trandate",
                                sort: search.Sort.ASC,
                                label: "Data"
                            }),
                            search.createColumn({name: "subsidiary", label: "Subsidiária"}),
                            search.createColumn({name: "custbody_rsc_projeto_obra_gasto_compra", label: "Nome do projeto"}),

                            search.createColumn({
                                name: "entity",
                                sort: search.Sort.ASC,
                                label: "Nome"
                            }),
                            search.createColumn({name: "datecreated", label: "Data de criação"}),

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
                        if(result.getValue({name: "status", join: "installment"}) == 'Não pago' ){
                            resultados.push({
                                data: result.getValue("trandate"),
                                subsidiary: result.getValue("subsidiary"),
                                vendor: result.getValue("entity"),
                                numeroParcelas: result.getValue({ name: "installmentnumber", join: "installment"}),
                                dataVenci: result.getValue({name: "duedate", join: "installment"}),
                                status: result.getValue({name: "status", join: "installment"}),
                                valor: result.getValue({name: "amount", join: "installment"}),
                                fatura: result.getValue("tranid"),
                                etapaProjeto: result.getValue('class'),
                                nomeProjeto: result.getValue('custbody_rsc_projeto_obra_gasto_compra'),
                                departamento: result.getValue('department'),
                                location: result.getValue('location'),
                                checkbox: false,
                                idFatura: result.id,
                            })
                            return true
                        }
                    })
                    
                    var dataSegreg = dataVigencia.split('/')
                    var dataSeg = new Date(Number(dataSegreg[2]) + 1,dataSegreg[1] - 1,dataSegreg[0])
                    var totalCurto = 0
                    var totalLongo = 0
                    var contCurto = 0
                    var contLongo = 0
                    log.audit('valor de corte', dataSeg)

                    for(var i = 0; i < resultados.length; i++){
                        var dataVencimento = resultados[i].dataVenci.split('/')
                        var dataApuracao = new Date(dataVencimento[2], dataVencimento[1], dataVencimento[0])
                        if (dataApuracao < dataSeg){
                            totalCurto += Number(resultados[i].valor)
                            contCurto ++
                        }else{
                            totalLongo += Number(resultados[i].valor)
                            contLongo++
                        }
                    }
                    log.audit('total longo', totalLongo)
                    log.audit('total curto', totalCurto)
                    log.audit('cont longo', contLongo)
                    log.audit('cont curto', contCurto)
                    
                    
                    
                    sublist.setSublistValue({
                        id: "custpage_data",
                        line: 0,
                        value: resultados[0].data
                    })

                    sublist.setSublistValue({
                        id: "custpage_subsidiary",
                        line: 0,
                        value: resultados[0].subsidiary
                    })

                    sublist.setSublistValue({
                        id: "custpage_status",
                        line: 0,
                        value: resultados[0].status
                    })

                    sublist.setSublistValue({
                        id: "custpage_fornecedor",
                        line: 0,
                        value: resultados[0].vendor
                    })

                    sublist.setSublistValue({
                        id: "custpage_valor",
                        line: 0,
                        value: resultados[0].valor
                    })

                    sublist.setSublistValue({
                        id: "custpage_prestacoes",
                        line: 0,
                        value: resultados[0].numeroParcelas
                    })

                    sublist.setSublistValue({
                        id: "custpage_id_fatura",
                        line: 0,
                        value: resultados[0].idFatura
                    })

                    if(resultados[0].fatura){
                        sublist.setSublistValue({
                            id: "custpage_num_fatura",
                            line: 0,
                            value: resultados[0].fatura
                        })
                    }
                    
                    textArea.defaultValue = JSON.stringify(resultados)
                }catch(e){
                    log.error('error', e)
                }
            }else{
                var json = JSON.parse(parameters.custpage_json_holder)
                var idBusca = parameters.custpage_id_busca
                var dataSegreg = parameters.custpage_data_segregacao.split('/')
                var dataSeg = new Date(Number(dataSegreg[2]) + 1,dataSegreg[1],dataSegreg[0])
                // log.audit('valor da data segregação', dataSegreg)
                // log.audit('valor da data', dataSeg)
                // log.audit('valor do listaJSON', json)
                var process = 0
                var noProcess = 0
                    for(var i = 0; i<json.length; i++){
                        try{
                            var dataVencimento = json[i].dataVenci.split('/')
                            var dataApuracao = new Date(dataVencimento[2], dataVencimento[1], dataVencimento[0]) 
                            var lancamento = record.create({
                                type: 'journalentry',
                                isDynamic: true
                            })
                            lancamento.setValue('custbody_gaf_vendor', json[i].vendor)
                            lancamento.setValue('subsidiary', json[i].subsidiary)
                            lancamento.setValue('custbodysegregacao_curt_long', true)
                            lancamento.setValue('custbody_ref_parcela',json[i].idFatura)

                            if (dataApuracao < dataSeg){
                                lancamento.setValue('memo', 'Segregação de Curto Prazo')
                                lancamento.selectNewLine('line')
                                lancamento.setCurrentSublistValue('line','debit', json[i].valor)
                                lancamento.setCurrentSublistValue('line','memo',"Segregação de Curto Prazo")
                                lancamento.setCurrentSublistValue('line','department',json[0].departamento)
                                lancamento.setCurrentSublistValue('line','class',json[0].etapaProjeto)
                                lancamento.setCurrentSublistValue('line','custcol_rsc_fieldcliente',json[0].nomeProjeto)
                                lancamento.setCurrentSublistValue('line','entity',json[0].vendor)
                                lancamento.setCurrentSublistValue('line','location',json[0].location)
                                lancamento.setCurrentSublistValue('line',"account", 924)
                                lancamento.commitLine('line')
                            }else{
                                lancamento.setValue('memo', 'Segregação de Longo Prazo')
                                lancamento.selectNewLine('line')
                                lancamento.setCurrentSublistValue('line','debit', json[i].valor)
                                lancamento.setCurrentSublistValue('line','memo',"Segregação de Longo Prazo")
                                lancamento.setCurrentSublistValue('line','department',json[0].departamento)
                                lancamento.setCurrentSublistValue('line','class',json[0].etapaProjeto)
                                lancamento.setCurrentSublistValue('line','custcol_rsc_fieldcliente',json[0].nomeProjeto)
                                lancamento.setCurrentSublistValue('line','entity',json[0].vendor)
                                lancamento.setCurrentSublistValue('line','location',json[0].location)
                                lancamento.setCurrentSublistValue('line',"account", 1331)
                                lancamento.commitLine('line')
                            }
                            lancamento.selectNewLine('line')
                            lancamento.setCurrentSublistValue('line','credit', json[i].valor)
                            lancamento.setCurrentSublistValue('line','memo',"Segregação de Fornecedores")
                            lancamento.setCurrentSublistValue('line','department',json[0].departamento)
                            lancamento.setCurrentSublistValue('line','class',json[0].etapaProjeto)
                            lancamento.setCurrentSublistValue('line','custcol_rsc_fieldcliente',json[0].nomeProjeto)
                            lancamento.setCurrentSublistValue('line','entity',json[0].vendor)
                            lancamento.setCurrentSublistValue('line','location',json[0].location)
                            lancamento.setCurrentSublistValue('line','account', 914)
                            lancamento.commitLine('line')
                            var saved = lancamento.save()
                            //process++
                            var fat = record.load({
                                type: 'vendorbill',
                                id: json[i].idFatura,
                                isDynamic: true,
                            })
                            fat.setValue('custbody_lanc_cont', saved)
                            fat.save()
                            log.audit('ids criados', saved)
                        }catch(e){
                            log.error('Error', e)
                            //noProcess++
                        }
                        redirect.toSavedSearchResult({
                            id: idBusca
                        })
                    }
                    // if(noProcess == 0){
                    //     processado.defaultValue = "T"
                    //     redirect.toSavedSearchResult({
                    //         id: 1852
                    //     })
                    // }else if (noProcess > 0 && process > 0){
                    //     parcialProcess.defaultValue = "T"
                    //     redirect.toSavedSearchResult({
                    //         id: 1852
                    //     })
                    // }else{
                    //     naoProcess.defaultValue = "T"
                    //     redirect.toSavedSearchResult({
                    //         id: 1852
                    //     })
                    // }
                }
        }

        return {
            onRequest: onRequest
        }
    });
