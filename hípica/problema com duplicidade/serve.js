/**
 *@NApiVersion 2.1
*@NScriptType ScheduledScript
*/
const cotationId = 107 

var fromRecord,
newRecord,
cotacaoId,
compraId,
id,
valuesToSet,
valuesToSetLine,
loteId,
fornecedorLote

define(['N/search', 'N/record', 'N/task', 'N/log', 'N/runtime'], function (search, record, task, log, runtime) {
var objLC = {};

const opcoes = {
    enableSourcing: true,
    ignoreMandatoryFields: true    
}

function atualizarTransacao(tipo, idInterno, valores) {
    log.audit('atualizarTransacao', {tipo: tipo, idInterno: idInterno, valores: valores});
    
    record.submitFields({type: tipo,
        id: idInterno,
        values: valores,
        options: opcoes            
    });
}

function REQUISICAO(idReq, valores) {
    log.audit('REQUISICAO', {idReq: idReq, valores: valores});

    const lookupRC = search.lookupFields({type: 'purchaserequisition',
        id: idReq,
        columns: ['custbody_rsc_requisicao_cotacao_criada','approvalstatus','status']
    });
    log.audit('lookupRC', lookupRC);

    if (lookupRC.status[0].value == 'pendingOrder' || lookupRC.approvalstatus[0].value != 2 || !lookupRC.custbody_rsc_requisicao_cotacao_criada[0]) {
        atualizarTransacao('purchaserequisition', idReq, valores);
    }
}

function LC (dados) {
    log.audit('LC', dados);
    
    var searchResults = search.create({
        type: "customrecord_rsc_lotes_compra",
        filters: dados.filtros,
        columns:
            [
                search.createColumn({ name: "custrecord_rsc_lotes_compra_transorigem", label: "Transação Origem" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_tipo", label: "Tipo" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_inicio", label: "Ínicio" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_status", label: "Status" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_fim", label: "Fim" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_transcriada", label: "Transação criada" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_memo", label: "Memo" }),
                search.createColumn({ name: "custrecord_rsc_lotes_compra_fornecedor", label: "Fornecedor" })
            ]
    }).run().getRange(0,1)[0];
    log.audit('LC', {searchResults: searchResults});

    if (searchResults) {
        record.submitFields({
            type: 'customrecord_rsc_lotes_compra',
            id: searchResults.id,
            values: dados.valores,
            options: opcoes
        });
    }
}

function _createQuotation() {
    log.debug('criando cotação', 'scheduled')
    var item,
        itemName,
        quantity

    objLC.filtros = [
        ["custrecord_rsc_lotes_compra_status", "anyof", "1"],//aguardando
        "AND", 
        ["custrecord_rsc_lotes_compra_transorigem","anyof",cotacaoId ? cotacaoId : fromRecord.id],
        "AND", 
        ["isinactive", "anyof", 'F']
    ];
        
    try {
        valuesToSet = {
            subsidiary: fromRecord.getValue({ fieldId: 'subsidiary' }),
            custbody_rsc_solicitante: fromRecord.getValue({ fieldId: 'entity' }),
            custbody_rsc_cotacao_origem: fromRecord.id,
            trandate: fromRecord.getValue({ fieldId: 'trandate' }),
            memo: fromRecord.getValue({ fieldId: 'memo' }),
            location: fromRecord.getValue({ fieldId: 'location' }),
            class: fromRecord.getValue({ fieldId: 'class' }),
            custbody_rsc_cotacao_data_inicio: fromRecord.getValue({ fieldId: 'trandate' }),
            custbody_rsc_cotacao_data_termino: fromRecord.getValue({ fieldId: 'duedate' }),
            custbody3: fromRecord.getValue({ fieldId: 'custbody3' }),
        }

        log.audit({ title: 'value', details: valuesToSet })

        Object.keys(valuesToSet).forEach(function (field) {
            // log.audit(field, valuesToSet[field]);
            newRecord.setValue({ fieldId: field, value: valuesToSet[field] })
        })

        cotacaoId = newRecord.save(opcoes)

        var array_cotacao_line = []

        var lineCount = fromRecord.getLineCount({ sublistId: 'item' })
        for (var i = 0; i < lineCount; i++) {
            fromRecord.selectLine({ sublistId: 'item', line: i })

            item = fromRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            })
            itemName = fromRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'description'
            })
            quantity = fromRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity'
            })

            valuesToSetLine = {
                custrecord_rsc_cotacao_compras_id: cotacaoId,
                custrecord_rsc_cotacao_compras_item: item,
                custrecord_rsc_cotacao_compras_desc: itemName,
                custrecord_rsc_cotacao_compras_qtd: quantity
            }

            var cotacaoLine = record.create({
                type: 'customrecord_rsc_cotacao_compras_linhas',
                isDynamic: true
            })

            Object.keys(valuesToSetLine).forEach(function (field) {
                cotacaoLine.setValue({ fieldId: field, value: valuesToSetLine[field] })
            })

            var id_cotacao_line = cotacaoLine.save(opcoes)
            array_cotacao_line.push(id_cotacao_line);
        }
        
        log.audit('_createQuotation', {cotacaoId: cotacaoId, array_cotacao_line: array_cotacao_line});
        
        // Atualiza Requisição
        fromRecord.setValue('custbody_rsc_requisicao_cotacao_criada', cotacaoId)
        .setValue('approvalstatus', 2)
        .setText('status', 'Requisition:Closed')
        .save(opcoes);

        // record.submitFields({
        //     type: 'purchaserequisition',
        //     id: id,
        //     values: {
        //         'custbody_rsc_requisicao_cotacao_criada': cotacaoId,
        //         'approvalstatus': 2,
        //         'status': 'Requisition:Closed'                  
        //     }
        // })

        objLC.valores = {
            'custrecord_rsc_lotes_compra_status': 2,//concluído
            'custrecord_rsc_lotes_compra_fim': new Date(),
            'custrecord_rsc_lotes_compra_transcriada': cotacaoId
        }

        LC(objLC); // Lotes de Compra        
    } catch (error) {
        log.error('Erro', error);

        objLC.valores = {
            'custrecord_rsc_lotes_compra_status': 3, //erro
            'custrecord_rsc_lotes_compra_memo': error
        } 
        
        LC(objLC); // Lotes de Compra
    }
}

function _createPurchaseOrder() { //AJUSTAR OS CAMPOS PARA CRIAR A ORDEM DE COMPRA

    var itemId,
        quantidade,
        fornecedor,
        preco_unitario,
        prazo_entrega,
        valuesToSetLine,
        parcelamento,
        incoterm,
        first = true

    function _createCompra() {
        newRecord = record.create({
            type: 'purchaseorder',
            isDynamic: true
        })

        valuesToSet = {
            entity: fornecedor,
            subsidiary: fromRecord.getValue({ fieldId: 'subsidiary' }),
            employee: fromRecord.getValue({ fieldId: 'custbody_rsc_solicitante' }),
            class: fromRecord.getValue({ fieldId: 'class' }),
            location: fromRecord.getValue({ fieldId: 'location' }),
            memo: fromRecord.getValue({ fieldId: 'memo' }),
            duedate: fromRecord.getValue({ fieldId: 'custbody_rsc_cotacao_data_termino' }), //ajustar data
            custbody3: fromRecord.getValue({ fieldId: 'custbody3' }),
            terms: parcelamento,
            incoterm: incoterm,
            custbody_rsc_cotacao_compras_id: id//ajustar origem,
            //custbody_enl_operationtypeid: 4,//somente dux
            //custbody_enl_order_documenttype: 1
        }

        log.audit({ title: 'value', details: valuesToSet })

        Object.keys(valuesToSet).forEach(function (field) {
            newRecord.setValue({ fieldId: field, value: valuesToSet[field] })
        })
    }

    function _compraAddLines() {   
        try {
            newRecord.selectNewLine({ sublistId: 'item' })

            valuesToSetLine = {
                item: itemId,
                quantity: quantidade,
                rate: preco_unitario
            };

            Object.keys(valuesToSetLine).forEach(function (field) {
                newRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: field, value: valuesToSetLine[field] })
            });
            newRecord.commitLine({ sublistId: 'item' });
            
        } catch (error) {
            log.error('error', error.message)
            record.submitFields({
                type: 'customrecord_rsc_lotes_compra',
                id: loteId,
                values: {
                    'custrecord_rsc_lotes_compra_status': 3,//concluído
                    'custrecord_rsc_lotes_compra_memo': error.message
                }
            })
        }
    }

    var customrecord_rsc_resp_cotacao_comprasSearchObj = search.create({
        type: "customrecord_rsc_resp_cotacao_compras",
        filters:
            [
                ["custrecord_rsc_respforn_cotacaoid", "anyof", id],
                "AND",
                ["custrecord_rsc_resp_cotacaolinhas_id.custrecord_rsc_resp_cotacaolinhas_select", "is", "T"],
                "AND",
                ["custrecord_rsc_respforn_fornecedor", "anyof", fornecedorLote]
            ],
        columns:
            [
                search.createColumn({
                    name: "custrecord_rsc_respforn_fornecedor",
                    sort: search.Sort.ASC,
                    label: "Fornecedor"
                }),
                search.createColumn({ name: "custrecord_rsc_respforn_incoterm", label: "Incoterm" }),
                search.createColumn({ name: "custrecord_rsc_respforn_condicoes_pag", label: "Forma de Parcelamento" }),
                search.createColumn({
                    name: "custrecord_rsc_resp_cotacao_linhas_item",
                    join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                    label: "Item"
                }),
                search.createColumn({
                    name: "custrecord_rsc_resp_cotacao_linhas_preco",
                    join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                    label: "Preço"
                }),
                search.createColumn({
                    name: "custrecord_rsc_resp_cotacao_linhas_qtdof",
                    join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                    label: "Quantidade ofertada"
                }),
                search.createColumn({
                    name: "custrecord_rsc_resp_cotacaolinhas_prazo",
                    join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
                    label: "Prazo entrega"
                })
            ]
    });
    customrecord_rsc_resp_cotacao_comprasSearchObj.run().each(function (result) {

        itemId = result.getValue({
            name: "custrecord_rsc_resp_cotacao_linhas_item",
            join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
        })

        quantidade = result.getValue({
            name: "custrecord_rsc_resp_cotacao_linhas_qtdof",
            join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
        })
        preco_unitario = result.getValue({
            name: "custrecord_rsc_resp_cotacao_linhas_preco",
            join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
        })
        prazo_entrega = result.getValue({
            name: "custrecord_rsc_resp_cotacaolinhas_prazo",
            join: "CUSTRECORD_RSC_RESP_COTACAOLINHAS_ID",
        })
        parcelamento = result.getValue({
            name: 'custrecord_rsc_respforn_condicoes_pag'
        })
        incoterm = result.getValue({
            name: 'custrecord_rsc_respforn_incoterm'
        })
        log.audit('fornecedor', fornecedor)
        if (first) {
            fornecedor = result.getValue({ name: 'custrecord_rsc_respforn_fornecedor' })
            _createCompra()
            _compraAddLines()
            log.audit("newRecord1",newRecord)
            first = false
        } else {
            log.audit("newRecord2",newRecord)
            _compraAddLines()
        }
        return true;
    });

    compraId = newRecord.save()

    if (!compraId)
        return

    record.submitFields({
        type: 'customtransaction_rsc_cotacao_compras',
        id: id,
        values: {
            'custbody_rsc_cotacao_compra': 'T'
        }
    })

    record.submitFields({
        type: 'customrecord_rsc_lotes_compra',
        id: loteId,
        values: {
            'custrecord_rsc_lotes_compra_status': 2,//concluído
            'custrecord_rsc_lotes_compra_fim': new Date(),
            'custrecord_rsc_lotes_compra_transcriada': compraId
        }
    })
}

function execute(context) {    
    log.audit('execute', context);
    
    const activated = false 
    const scriptAtual = runtime.getCurrentScript();
    
    const parametro = { 
        custscript_rsc_id_requisicao: scriptAtual.getParameter({name: 'custscript_rsc_id_requisicao'}),
        custscript_rsc_id_cotacao: scriptAtual.getParameter({name: 'custscript_rsc_id_cotacao'})        
    }    
    log.audit('parametro', {custscript_rsc_id_requisicao: parametro.custscript_rsc_id_requisicao, custscript_rsc_id_cotacao: parametro.custscript_rsc_id_cotacao});
    
    if(parametro.custscript_rsc_id_requisicao && parametro.custscript_rsc_id_requisicao != null) {
        newRecord = record.create({type: 'customtransaction_rsc_cotacao_compras', isDynamic: true});
        const requisicaoCompras = record.load({type: 'purchaserequisition', id: parametro.custscript_rsc_id_requisicao, isDynamic: true});
        
        var item, itemName, quantity;
        
        objLC.filtros = [
            ["custrecord_rsc_lotes_compra_status", "anyof", "1"],//aguardando
            "AND", 
            ["custrecord_rsc_lotes_compra_transorigem","anyof",cotacaoId ? cotacaoId : requisicaoCompras.id],
            "AND", 
            ["isinactive", "anyof", 'F']
        ];
            
        try {
            valuesToSet = {
                subsidiary: requisicaoCompras.getValue('subsidiary'),
                custbody_rsc_solicitante: requisicaoCompras.getValue('entity'),
                custbody_rsc_cotacao_origem: requisicaoCompras.id,
                trandate: requisicaoCompras.getValue('trandate'),
                memo: requisicaoCompras.getValue('memo'),
                location: requisicaoCompras.getValue('location'),
                class: requisicaoCompras.getValue('class'),
                custbody_rsc_cotacao_data_inicio: requisicaoCompras.getValue('trandate'),
                custbody_rsc_cotacao_data_termino: requisicaoCompras.getValue('duedate'),
                custbody3: requisicaoCompras.getValue('custbody3'),
            }

            log.audit('valuesToSet', valuesToSet);

            Object.keys(valuesToSet).forEach(function (field) {
                log.audit(field, valuesToSet[field]);
                newRecord.setValue({ fieldId: field, value: valuesToSet[field] })
            })

            cotacaoId = newRecord.save(opcoes)

            var array_cotacao_line = []

            var lineCount = requisicaoCompras.getLineCount({ sublistId: 'item' })
            for (var i = 0; i < lineCount; i++) {
                requisicaoCompras.selectLine({ sublistId: 'item', line: i })

                item = requisicaoCompras.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item'
                })
                itemName = requisicaoCompras.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'description'
                })
                quantity = requisicaoCompras.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity'
                })

                valuesToSetLine = {
                    custrecord_rsc_cotacao_compras_id: cotacaoId,
                    custrecord_rsc_cotacao_compras_item: item,
                    custrecord_rsc_cotacao_compras_desc: itemName,
                    custrecord_rsc_cotacao_compras_qtd: quantity
                }

                var cotacaoLine = record.create({
                    type: 'customrecord_rsc_cotacao_compras_linhas',
                    isDynamic: true
                })

                Object.keys(valuesToSetLine).forEach(function (field) {
                    cotacaoLine.setValue({ fieldId: field, value: valuesToSetLine[field] })
                })

                var id_cotacao_line = cotacaoLine.save(opcoes)
                array_cotacao_line.push(id_cotacao_line);
            }
            
            log.audit('_createQuotation', {cotacaoId: cotacaoId, array_cotacao_line: array_cotacao_line});
            
            // Atualiza Requisição
            requisicaoCompras.setValue('custbody_rsc_requisicao_cotacao_criada', cotacaoId)
            .setValue('approvalstatus', 2)
            .setValue('status', 'Requisition:Closed') 
            .save(opcoes);

            objLC.valores = {
                'custrecord_rsc_lotes_compra_status': 2,//concluído
                'custrecord_rsc_lotes_compra_fim': new Date(),
                'custrecord_rsc_lotes_compra_transcriada': cotacaoId
            }

            LC(objLC); // Lotes de Compra    
            REQUISICAO(parametro.custscript_rsc_id_requisicao, {
                custbody_rsc_requisicao_cotacao_criada: cotacaoId, 
                approvalstatus: 2, 
                status: 'H' // Fechadas
            });
        } catch (error) {
            log.error('Erro', error);

            objLC.valores = {
                'custrecord_rsc_lotes_compra_status': 3, //erro
                'custrecord_rsc_lotes_compra_memo': error
            } 
            
            LC(objLC); // Lotes de Compra
        }

        // _createQuotation()
    } 
    
    if (parametro.custscript_rsc_id_cotacao && parametro.custscript_rsc_id_cotacao != null) {
        var itens = []; var premio = []; var vendor = []; var respCota = []; var listaForn = []
        
        var cotacaoCompra = record.load({type: 'customtransaction_rsc_cotacao_compras', id: parametro.custscript_rsc_id_cotacao});
    
        var linhaItem = cotacaoCompra.getLineCount('recmachcustrecord_rsc_cotacao_compras_id');
        var linhaPrize = cotacaoCompra.getLineCount('custpage_premios');
        var linhaForn = cotacaoCompra.getLineCount('recmachcustrecord_rsc_cot_forn_cotid');
        var linhaResp = cotacaoCompra.getLineCount('recmachcustrecord_rsc_respforn_cotacaoid');
        
        for (var i = 0; i<linhaItem; i++){
            itens.push({
                custrecord_rsc_cotacao_compras_desc: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cotacao_compras_id','custrecord_rsc_cotacao_compras_desc', i),
                custrecord_rsc_cotacao_compras_item: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cotacao_compras_id','custrecord_rsc_cotacao_compras_item', i),
                custrecord_rsc_cotacao_compras_qtd: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cotacao_compras_id','custrecord_rsc_cotacao_compras_qtd', i),
                id: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cotacao_compras_id','id', i)
            });
        }
    
        for (var i = 0; i<linhaPrize; i++) {
            var select = cotacaoCompra.getSublistValue('custpage_premios','selecionar', i)
            if (select == true || select == "T"){ 
                if(listaForn.length == 0){
                    var objForn = {
                        fornecedor: cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i),
                        condicao: cotacaoCompra.getSublistValue('custpage_premios','condicao', i),
                        premio: [{
                            item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                            quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                            preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                            prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i)
                        }]
                    }
                    listaForn.push(objForn)
                    // premio.push({
                    //     condicao: cotacaoCompra.getSublistValue('custpage_premios','condicao', i),
                    //     fornecedor: cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i),
                    //     id: cotacaoCompra.getSublistValue('custpage_premios','id', i),
                    //     item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                    //     itemname: cotacaoCompra.getSublistValue('custpage_premios','itemname', i),
                    //     memo: cotacaoCompra.getSublistValue('custpage_premios','memo', i),
                    //     prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i),
                    //     preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                    //     quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                    //     selecionar: cotacaoCompra.getSublistValue('custpage_premios','selecionar', i),
                    //     taxatotal: cotacaoCompra.getSublistValue('custpage_premios','taxatotal', i),
                    //     unittype: cotacaoCompra.getSublistValue('custpage_premios','unittype', i),
                    //     forneceList: []

                    // });
                }
                else{
                    var LF = listaForn.find(element => element.fornecedor === cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i));
                    if (LF){
                        if(LF.item == cotacaoCompra.getSublistValue('custpage_premios','item', i)){
                            listaForn.premio.push({
                                item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                                quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                                preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                                prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i)
                            })
                        }
                        // premio[i].forneceList.push({
                        //     condicao: cotacaoCompra.getSublistValue('custpage_premios','condicao', i),
                        //     fornecedor: cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i),
                        //     id: cotacaoCompra.getSublistValue('custpage_premios','id', i),
                        //     item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                        //     itemname: cotacaoCompra.getSublistValue('custpage_premios','itemname', i),
                        //     memo: cotacaoCompra.getSublistValue('custpage_premios','memo', i),
                        //     prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i),
                        //     preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                        //     quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                        //     selecionar: cotacaoCompra.getSublistValue('custpage_premios','selecionar', i),
                        //     taxatotal: cotacaoCompra.getSublistValue('custpage_premios','taxatotal', i),
                        //     unittype: cotacaoCompra.getSublistValue('custpage_premios','unittype', i)
                        // })
                    }else{
                        var objForn = {
                            fornecedor: cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i),
                            condicao: cotacaoCompra.getSublistValue('custpage_premios','condicao', i),
                            premio: [{
                                item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                                quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                                preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                                prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i)
                            }]
                        }
                        listaForn.push(objForn)
                        // premio.push({
                        //     condicao: cotacaoCompra.getSublistValue('custpage_premios','condicao', i),
                        //     fornecedor: cotacaoCompra.getSublistValue('custpage_premios','fornecedor', i),
                        //     id: cotacaoCompra.getSublistValue('custpage_premios','id', i),
                        //     item: cotacaoCompra.getSublistValue('custpage_premios','item', i),
                        //     itemname: cotacaoCompra.getSublistValue('custpage_premios','itemname', i),
                        //     memo: cotacaoCompra.getSublistValue('custpage_premios','memo', i),
                        //     prazo: cotacaoCompra.getSublistValue('custpage_premios','prazo', i),
                        //     preco_unitario: cotacaoCompra.getSublistValue('custpage_premios','preco_unitario', i),
                        //     quantidade: cotacaoCompra.getSublistValue('custpage_premios','quantidade', i),
                        //     selecionar: cotacaoCompra.getSublistValue('custpage_premios','selecionar', i),
                        //     taxatotal: cotacaoCompra.getSublistValue('custpage_premios','taxatotal', i),
                        //     unittype: cotacaoCompra.getSublistValue('custpage_premios','unittype', i),
                        //     forneceList: []
                        // });
                    }
                }
            }
        }
    
        for (var i = 0; i<linhaForn; i++) {
            vendor.push({
                custrecord_rsc_cot_forn_contato: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cot_forn_contato', i),
                custrecord_rsc_cot_forn_data_envio: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cot_forn_data_envio', i),
                custrecord_rsc_cot_forn_data_resposta: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cot_forn_data_resposta', i),
                custrecord_rsc_cot_fornid: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cot_fornid', i),
                custrecord_rsc_cotacao_compras_email: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cotacao_compras_email', i),
                custrecord_rsc_cotacao_fornecedor_memo: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','custrecord_rsc_cotacao_fornecedor_memo', i),
                id: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_cot_forn_cotid','id', i)
            });
        }
    
        for (var i = 0; i<linhaResp; i++) {
            respCota.push({
                custrecord_rsc_respforn_cotacaoid: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','custrecord_rsc_respforn_cotacaoid', i),
                custrecord_rsc_respforn_data_inicio: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','custrecord_rsc_respforn_data_inicio', i),
                custrecord_rsc_respforn_data_resposta: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','custrecord_rsc_respforn_data_resposta', i),
                custrecord_rsc_respforn_data_termino: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','custrecord_rsc_respforn_data_termino', i),
                custrecord_rsc_respforn_fornecedor: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','custrecord_rsc_respforn_fornecedor', i),
                id: cotacaoCompra.getSublistValue('recmachcustrecord_rsc_respforn_cotacaoid','id', i)
            });
        }
    
        log.audit('premio', premio);
        log.audit('itens', itens);
        log.audit('respCota', respCota);
        log.audit('vendor', vendor);

        var relacao = {
            sucesso: [],
            erro: []
        }
    
        
        for(var i = 0; i< listaForn.length; i++){
            
            var newRecord = record.create({
                type: 'purchaseorder',
                isDynamic: true
            });
        
            newRecord.setValue('entity', listaForn[i].fornecedor),
            newRecord.setValue('employee', cotacaoCompra.getValue('custbody_rsc_solicitante')),
            newRecord.setValue('custbody3', cotacaoCompra.getValue('custbody3')),
            newRecord.setValue('memo', cotacaoCompra.getValue('memo')),
            newRecord.setValue('subsidiary', cotacaoCompra.getValue('subsidiary')),
            newRecord.setValue('location', cotacaoCompra.getValue('location')),
            newRecord.setValue('class', cotacaoCompra.getValue('class')),
            newRecord.setValue('duedate', cotacaoCompra.getValue('custbody_rsc_cotacao_data_termino')),
            newRecord.setValue('terms', listaForn[i].condicao)
            newRecord.setValue('custbody_rsc_cotacao_compras_id', cotacaoCompra.id)
            
            for (var x = 0; x < listaForn[i].premio.length; x++){
                newRecord.selectNewLine('item')
                .setCurrentSublistValue('item', 'item', listaForn[i].premio[x].item)
                .setCurrentSublistValue('item', 'quantity', listaForn[i].premio[x].quantidade)
                .setCurrentSublistValue('item', 'rate', listaForn[i].premio[x].preco_unitario)
                .setCurrentSublistValue('item', 'expectedreceiptdate', listaForn[i].premio[x].prazo)
                .commitLine('item');
            }
            
            try{
                var id_ordem_compra = newRecord.save({ignoreMandatoryFields: true});
                //log.audit('id_ordem_compra', id_ordem_compra);
                relacao.sucesso.push(id_ordem_compra)
            }catch(e){
                relacao.erro.push({
                    fornecedor: listaForn[i].fornecedor,
                    erro: e
                })
            }
        }
        log.audit('processados', relacao)
        

        objLC.filtros = [
            ["custrecord_rsc_lotes_compra_transorigem","anyof", parametro.custscript_rsc_id_cotacao]
        ];

        objLC.valores = {
            custrecord_rsc_lotes_compra_transcriada: id_ordem_compra,
            custrecord_rsc_lotes_compra_status: 2
        }

        LC(objLC); // Lotes de Compra
    }   

    //  searchResults.run().each(function (result) {
    //      loteId = result.id
    //      typeId = result.getValue({ name: 'custrecord_rsc_lotes_compra_tipo' })
    //      id = result.getValue({ name: 'custrecord_rsc_lotes_compra_transorigem' })
    //      fornecedorLote = result.getValue({ name: 'custrecord_rsc_lotes_compra_fornecedor' })

    //      log.audit({ title: 'type', details: typeId })
    //      log.audit({ title: 'id', details: id })
    //      try {
    //          if (typeId == cotationId) {
    //              newRecord = record.create({
    //                  type: 'customtransaction_rsc_cotacao_compras',
    //                  isDynamic: true
    //              })

    //              fromRecord = record.load({
    //                  type: 'purchaserequisition',
    //                  id: id,
    //                  isDynamic: true,
    //              })
    //              log.audit({ title: 'fromRecord', details: fromRecord })
    //              _createQuotation()
            //  } else if (typeId == 15) {
            //      if(id == parametro){
            //         activated = true 
            //         fromRecord = record.load({
            //              type: 'customtransaction_rsc_cotacao_compras',
            //              id: id,
            //              isDynamic: true,
            //             })
            //         _createPurchaseOrder()
                // }
            //  }

    //      } catch (error) {
    //          log.error('erro', error)
    //      }

    //      return true;
    //  });

    //  if(activated == false){
    //     log.audit('entrei no ulitmo if')
    //     fromRecord = record.load({
    //         type: 'customtransaction_rsc_cotacao_compras',
    //         id: parametro,
    //         isDynamic: true,
    //        })
    //    _createPurchaseOrder()
    //  }


    //  var customrecord_rsc_lotes_compraSearchObj = search.create({
    //      type: "customrecord_rsc_lotes_compra",
    //      filters:
    //          [
    //              ["custrecord_rsc_lotes_compra_status", "anyof", "1"],
    //              "AND",
    //              ["custrecord_rsc_lotes_compra_transorigem","noneof","@NONE@"]
    //          ],
    //      columns:
    //          [
    //              search.createColumn({
    //                  name: "internalid",
    //                  summary: "COUNT",
    //                  label: "ID interna"
    //              })
    //          ]
    //  });

    //  customrecord_rsc_lotes_compraSearchObj.run().each(function (result) {
    //      var count = result.getValue({
    //          name: "internalid",
    //          summary: "COUNT"
    //      })
    //      if (count > 0) {
    //          var scriptTask = task.create({
    //              taskType: task.TaskType.SCHEDULED_SCRIPT,
    //              scriptId: 'customscript_rsc_scheduled_executar_lote',
    //              deploymentId: 'customdeploy_rsc_scheduled_executar_lote'
    //          })
    //          var scriptTaskId = scriptTask.submit()
    //          log.error('Status', 'Novo script será executado - ' + scriptTaskId);
    //      }
    //      return true;
    //  });
}

return {
    execute: execute
}
});