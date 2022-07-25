/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var cotacao = '',
    recipientId = '',
    senderId = '',
    dataEnvio = '',
    vendor = '',
    cotacao_vendor = '',
    dataInicio = '',
    dataFim = '',
    form,
    sublist,
    requested = false,
    sendEmail = false

define(['N/email', 'N/search', 'N/record', 'N/config', 'N/ui/serverWidget'], function (email, search, record, config, serverWidget) {

    function _createSubListPremio(context) {
        sublist = form.addSublist({
            id: 'custpage_premios',
            type: serverWidget.SublistType.LIST,
            label: ' ',
            tab: 'custom113'//AJUSTAR ID DA TAB
        });
        if (context.type == context.UserEventType.VIEW) {
            var selecionar_field = sublist.addField({
                id: 'selecionar',
                label: 'Selecionar',
                type: serverWidget.FieldType.TEXT
            });
        } else {
            var selecionar_field = sublist.addField({
                id: 'selecionar',
                label: 'Selecionar',
                type: serverWidget.FieldType.CHECKBOX
            });
        }
        sublist.addField({
            id: 'item',
            label: 'Item',
            type: serverWidget.FieldType.SELECT,
            source: 'item'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        sublist.addField({
            id: 'itemname',
            label: 'Descrição',
            type: serverWidget.FieldType.TEXT
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        sublist.addField({
            id: 'unittype',
            label: 'Unidade de Medida',
            type: serverWidget.FieldType.TEXT
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        sublist.addField({
            id: 'fornecedor',
            label: 'Fornecedor',
            type: serverWidget.FieldType.SELECT,
            source: 'vendor'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        sublist.addField({
            id: 'preco_unitario',
            label: 'Preço unitário',
            type: serverWidget.FieldType.CURRENCY
        });
        sublist.addField({
            id: 'quantidade',
            label: 'Quantidade',
            type: serverWidget.FieldType.INTEGER
        });
        sublist.addField({
            id: 'taxatotal',
            label: 'Taxa total',
            type: serverWidget.FieldType.CURRENCY
        });
        sublist.addField({
            id: 'memo',
            label: 'Memo',
            type: serverWidget.FieldType.TEXT
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.ENTRY });
        sublist.addField({
            id: 'prazo',
            label: 'Prazo',
            type: serverWidget.FieldType.DATE
        });
        sublist.addField({
            id: 'condicao',
            label: 'Condição',
            type: serverWidget.FieldType.SELECT,
            source: 'term'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        sublist.addField({
            id: 'id',
            label: 'Id',
            type: serverWidget.FieldType.INTEGER
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        if (cotacao.getValue('transtatus') == 'E')
            selecionar_field.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            })
    }

    function beforeLoad(context) {
        var line = 0
        form = context.form
        cotacao = context.newRecord

        var tabs = form.getTabs();

        log.audit('tabs', tabs)

        if (!cotacao.id) return// || cotacao.getValue('transtatus') == 'A' ||  cotacao.getValue({ fieldId: 'custbody_rsc_transacao_criada' })) return

        //somente criar a aba prêmios se tiver resposta do fornecedor
        _createSubListPremio(context)
        var customrecord_rsc_resp_cotacao_linhasSearchObj = search.create({
            type: "customrecord_rsc_resp_cotacao_linhas",
            filters:
                [
                    ["custrecord_rsc_resp_cotacaolinhas_id.custrecord_rsc_respforn_cotacaoid", "anyof", cotacao.id]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_rsc_respforn_fornecedor",
                        join: "custrecord_rsc_resp_cotacaolinhas_id",
                        label: "Fornecedor"
                    }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacao_linhas_item", label: "Item", sort: search.Sort.ASC }),
                    search.createColumn({ name: "purchasedescription", join: 'custrecord_rsc_resp_cotacao_linhas_item', label: "Nome do Item" }),
                    search.createColumn({ name: "purchaseunit", join: 'custrecord_rsc_resp_cotacao_linhas_item', label: "Unidade de medida" }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacao_linhas_qtd", label: "Quantidade original" }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacao_linhas_qtdof", label: "Quantidade ofertada" }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacao_linhas_preco", label: "Preço" }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacao_linhas_total", label: "Total" }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacaolinhas_prazo", label: "Prazo entrega" }),
                    search.createColumn({
                        name: "custrecord_rsc_respforn_condicoes_pag",
                        join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                        label: "Condições de pagamento"
                    }),
                    search.createColumn({ name: "custrecord_rsc_resp_cotacaolinhas_select", label: "Selecionado" })
                ]
        });
        customrecord_rsc_resp_cotacao_linhasSearchObj.run().each(function (result) {
            var price = result.getValue({ name: 'custrecord_rsc_resp_cotacao_linhas_preco' }),
                total = result.getValue({ name: 'custrecord_rsc_resp_cotacao_linhas_total' }),
                prazo = result.getValue({ name: 'custrecord_rsc_resp_cotacaolinhas_prazo' }),
                selecionado = result.getValue({ name: 'custrecord_rsc_resp_cotacaolinhas_select' })
            
            log.audit('selecionado',selecionado)

            sublist.setSublistValue({
                id: 'selecionar',
                line: line,
                value: selecionado == true ? 'T' : 'F'
            });
            sublist.setSublistValue({
                id: 'id',
                line: line,
                value: result.id
            });
            sublist.setSublistValue({
                id: 'item',
                line: line,
                value: result.getValue({ name: 'custrecord_rsc_resp_cotacao_linhas_item' })
            });
            // sublist.setSublistValue({
            //     id: 'itemname',
            //     line: line,
            //     value: result.getValue({ name: 'purchasedescription', join: 'custrecord_rsc_resp_cotacao_linhas_item' }) || ''
            // });
            if(result.getText({ name: 'purchaseunit', join: 'custrecord_rsc_resp_cotacao_linhas_item' })){
                sublist.setSublistValue({
                    id: 'unittype',
                    line: line,
                    value: result.getText({ name: 'purchaseunit', join: 'custrecord_rsc_resp_cotacao_linhas_item' })
                });
            }
            sublist.setSublistValue({
                id: 'fornecedor',
                line: line,
                value: result.getValue({ name: 'custrecord_rsc_respforn_fornecedor', join: 'custrecord_rsc_resp_cotacaolinhas_id' })
            });
            sublist.setSublistValue({
                id: 'preco_unitario',
                line: line,
                value: price ? price : 0
            });
            sublist.setSublistValue({
                id: 'taxatotal',
                line: line,
                value: total ? total : 0
            });
            sublist.setSublistValue({
                id: 'quantidade',
                line: line,
                value: result.getValue({ name: 'custrecord_rsc_resp_cotacao_linhas_qtdof' })
            });
            var condicao = result.getValue({
                name: 'custrecord_rsc_respforn_condicoes_pag',
                join: 'CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID'
            })

            if (!condicao) {
                condicao = 0
            }

            sublist.setSublistValue({
                id: 'condicao',
                line: line,
                value: condicao
            })
            
            if (prazo)
                sublist.setSublistValue({
                    id: 'prazo',
                    line: line,
                    value: prazo
                });
            line++
            return true;
        });
        if (cotacao.getValue('transtatus') == 'E' && !cotacao.getValue('custbody_rsc_cotacao_compra') && cotacao.getValue('custbody_rsc_cotation_create') == false) {//status encerrado
            //criar botão de criar pedido de compra
            form.addButton({
                id: 'custpage_criar_compra',
                label: 'Criar Ordem de Compra',
                functionName: 'criar_compra'
            })
            form.clientScriptModulePath = './rsc_client_cotacao.js'
        }
    }


    function _createResponseVendor() {

        var resp_cotacao,
            resp_cotacao_id,
            itemCount,
            item,
            quantity,
            resp_cotacao_lines

        resp_cotacao = record.create({
            type: 'customrecord_rsc_resp_cotacao_compras'
        })

        resp_cotacao.setValue({
            fieldId: 'custrecord_rsc_respforn_cotacaoid',
            value: cotacao.id
        })
        resp_cotacao.setValue({
            fieldId: 'custrecord_rsc_respforn_fornecedor',
            value: vendor
        })
        resp_cotacao.setValue({
            fieldId: 'custrecord_rsc_respforn_cotacao_forneced',
            value: cotacao_vendor
        })
        resp_cotacao.setValue({
            fieldId: 'custrecord_rsc_respforn_data_inicio',
            value: dataInicio
        })
        resp_cotacao.setValue({
            fieldId: 'custrecord_rsc_respforn_data_termino',
            value: dataFim
        })

        resp_cotacao_id = resp_cotacao.save()

        itemCount = cotacao.getLineCount({ sublistId: 'recmachcustrecord_rsc_cotacao_compras_id' })

        for (var i = 0; i < itemCount; i++) {

            item = cotacao.getSublistValue({
                sublistId: 'recmachcustrecord_rsc_cotacao_compras_id',
                fieldId: 'custrecord_rsc_cotacao_compras_item',
                line: i
            })
            quantity = cotacao.getSublistValue({
                sublistId: 'recmachcustrecord_rsc_cotacao_compras_id',
                fieldId: 'custrecord_rsc_cotacao_compras_qtd',
                line: i
            })

            resp_cotacao_lines = record.create({
                type: 'customrecord_rsc_resp_cotacao_linhas'
            })
            resp_cotacao_lines.setValue({
                fieldId: 'custrecord_rsc_resp_cotacaolinhas_id',
                value: resp_cotacao_id
            })
            resp_cotacao_lines.setValue({
                fieldId: 'custrecord_rsc_resp_cotacao_linhas_item',
                value: item
            })
            resp_cotacao_lines.setValue({
                fieldId: 'custrecord_rsc_resp_cotacao_linhas_qtd',
                value: quantity
            })
            resp_cotacao_lines.setValue({
                fieldId: 'custrecord_rsc_resp_cotacao_linhas_qtdof',
                value: quantity
            })
            resp_cotacao_lines.save()
        }
    }

    function _sendEmail() {
        var companyInfo,
            url,
            body,
            author

        companyInfo = config.load({ type: config.Type.COMPANY_INFORMATION });
        url = companyInfo.getValue({ fieldId: 'appurl' });
        author = cotacao.getValue({ fieldId: 'custbody_rsc_solicitante' })
        //criar parametro

        body = '<p>' + cotacao.getValue({ fieldId: 'custbody_rsc_cotacao_compras_int_email' }) + '</p> ' +
            '<p> Sociedade Hipica Paulista lhe enviou uma Cotação com a data de fechamento do lance de ' + dataFim.toLocaleDateString() + '</p>' +
            '<p> Você pode acessar esta cotação entre ' + dataInicio.toLocaleDateString() + ' e ' + dataFim.toLocaleDateString() +
            ' visitando a <a href= ' + url + '>Central do fornecedor</a>.</p>' +
            '<p> Insira suas taxas para os itens e quaisquer termos que deseje incluir e depois clique no botão Salvar. ' +
            'É possível inserir/modificar as taxas e condições e salvá-las conforme o necessário antes da data de fechamento do lance.</p>'

        email.send({
            author: author,
            recipients: recipientId,
            subject: 'Sociedade Hipica Paulista - Cotação ' + cotacao.getValue({ fieldId: 'tranid' }),
            body: body
        });
    }

    function _runVendors() {

        var customrecord_rsc_cotacao_fornecedoresSearchObj = search.create({
            type: "customrecord_rsc_cotacao_fornecedores",
            filters:
                [
                    ["custrecord_rsc_cot_forn_cotid", "anyof", cotacao.id],
                    //"AND",
                    //["custrecord_rsc_cotacao_compras_email", "is", "T"],
                    "AND",
                    ["custrecord_rsc_cot_forn_data_envio", "isempty", ""]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_rsc_cot_fornid", label: "Fornecedor" }),
                    search.createColumn({ name: "custrecord_rsc_cot_forn_contato", label: "Contato" }),
                    search.createColumn({ name: "custrecord_rsc_cot_forn_data_envio", label: "Data de envio" }),
                    search.createColumn({ name: "custrecord_rsc_cot_forn_data_resposta", label: "Data de resposta" }),
                    search.createColumn({ name: "custrecord_rsc_cotacao_fornecedor_memo", label: "Memo" }),
                    search.createColumn({ name: "custrecord_rsc_cotacao_compras_email", label: "Enviar e-mail" }),
                    search.createColumn({
                        name: "email",
                        join: "CUSTRECORD_RSC_COT_FORN_CONTATO",
                        label: "E-mail"
                    })
                ]
        });
        customrecord_rsc_cotacao_fornecedoresSearchObj.run().each(function (result) {
            try {
                cotacao_vendor = result.id
                log.audit('teste', result.id)

                recipientId = result.getValue({
                    name: "email",
                    join: "CUSTRECORD_RSC_COT_FORN_CONTATO",
                })

                vendor = result.getValue({ name: 'custrecord_rsc_cot_fornid' })
                sendEmail = result.getValue({ name: 'custrecord_rsc_cotacao_compras_email' })

                _createResponseVendor()

                if (sendEmail) {
                    _sendEmail()

                    record.submitFields({
                        type: 'customtransaction_rsc_cotacao_compras',
                        id: cotacao.id,
                        values: {
                            'transtatus': 'B'
                        }
                    })
                }
                record.submitFields({
                    type: 'customrecord_rsc_cotacao_fornecedores',
                    id: result.id,
                    values: {
                        'custrecord_rsc_cot_forn_data_envio': dataEnvio
                    }
                })
            } catch (error) {
                log.error('Erro', error)
            }
            return true;
        });
    }

    function afterSubmit(context) {
      
        if (context.type == context.UserEventType.DELETE)
            return;
      
        dataEnvio = new Date()
        cotacao = context.newRecord
        form = context.form
        dataInicio = new Date(cotacao.getValue({ fieldId: 'custbody_rsc_cotacao_data_inicio' }))
        dataFim = new Date(cotacao.getValue({ fieldId: 'custbody_rsc_cotacao_data_termino' }))
        var total = cotacao.getValue({ fieldId: 'custbody_rsc_cotacao_total' })
        _runVendors()

        var lineCount = cotacao.getLineCount({ sublistId: 'custpage_premios' })
        for (var index = 0; index < lineCount; index++) {
            var selecionado = cotacao.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'selecionar', line: index })
            var id = cotacao.getSublistValue({ sublistId: 'custpage_premios', fieldId: 'id', line: index })
            if (selecionado == 'T') {
                log.audit('id', id)
                log.audit('selecionado', selecionado)

                record.submitFields({
                    type: 'customrecord_rsc_resp_cotacao_linhas',
                    id: id,
                    values: {
                        'custrecord_rsc_resp_cotacaolinhas_select': (selecionado == 'T' ? true : false)
                    }
                })

                requested = true
            }
        }
        if (requested)
            record.submitFields({
                type: 'customtransaction_rsc_cotacao_compras',
                id: cotacao.id,
                values: {
                    'transtatus': 'E',
                    'custbody_rsc_cotacao_total': total
                }
            })
    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }
});
