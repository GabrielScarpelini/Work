/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *
 * ClientCalcularPreco.ts
 *
 * Script com a funcionalidade client-side do botão Calcular Preço da estimativa e pedido de vendas.
 * Informa o usuário sobre a funcionalidade implementada, além de fazer uma chamada GET para o suitelet, que realiza o procedimento server-side
 *
 */
 var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/currentRecord", "N/log", "N/search", "N/runtime", "./rsc_functions"], function (require, exports, currentRecord_1, log_1, search_1, runtime_1, rsc_functions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calcularPreco = exports.fieldChanged = exports.lineInit = exports.pageInit = exports.saveRecord = void 0;
    currentRecord_1 = __importDefault(currentRecord_1);
    log_1 = __importDefault(log_1);
    search_1 = __importDefault(search_1);
    runtime_1 = __importDefault(runtime_1);
    // var saveRecord = function (ctx) {
    //     alert('O processo de cálculo de preço será iniciado ao salvar o registro e pode demorar alguns minutos.'
    //         + ' Quando o processo terminar, se houver erros no cálculo, o campo "Erro no cálculo de preço" estará preenchido com o(s) erro(s).'
    //         + ' No fim do processo, caso haja sucesso, o campo "Erro no cálculo de Preço" estará preenchido com "Cálculo de preço bem-sucedido"'); // o calculo de preço sera realizado por um afterSubmit
    //     return true;
    // };
    //exports.saveRecord = saveRecord;
    var pageInit = function (ctx) {
        //var currRecord = ctx.currentRecord;
        //currRecord.selectLine({
        //    sublistId: "item",
        //    line: currRecord.getLineCount({ sublistId: "item" }) - 1
        //});
    };
    exports.pageInit = pageInit;
    var lineInit = function (ctx) {
        //Log.error("lineInitCtx", ctx);
        var sublistId = ctx.sublistId;
        if (sublistId != "item")
            return;
        // Desabilita os seguintes campos para edicao de usuario: Amount, Rate, "TAX AMT", "Gross AMT"
        var currRecord = ctx.currentRecord;
        var itemCount = currRecord.getLineCount("item");
        //Log.error("itemCount", itemCount);
        var itemSublistFieldsToDisable = ["amount", "rate", "grossamt", "tax1amt"];
        for (var line = 0; line < itemCount; line++) {
            itemSublistFieldsToDisable.forEach(function (fieldId) {
                var field = currRecord.getSublistField({
                    sublistId: "item",
                    fieldId: fieldId,
                    line: line,
                });
                field.isDisabled = true;
            });
        }
    };
    exports.lineInit = lineInit;
    var fieldChanged = function (ctx) {
        //Log.error("fieldChangedTrigger", ctx);
        var currRecord = ctx.currentRecord;
        var sublistName = ctx.sublistId;
        var sublistField = ctx.fieldId;
        if (sublistName == "item" && (sublistField == "item" || sublistField == "custcol_lrc_region_item")) {
            //Log.error("sublistName", sublistName);
            //Log.error("sublistField", sublistField);
            // pega os valores de sublista "item" e "regiao"
            var item = currRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: "item"
            });
            //Log.error("item", item);
            var regiao = currRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: "custcol_lrc_region_item"
            });
            //Log.error("regiao", regiao);
            // faz uma busca nas tabelas de CCT com essa combinação correspondente e preenche a coluna de CCT na sublista
            if (item && regiao) {
                var cctSearch = search_1.default.create({
                    type: "customrecord_lrc_cct",
                    filters: [
                        ["custrecord_lrc_item_cct", "IS", item],
                        "AND",
                        ["custrecord_lrc_regiao_cct", "IS", regiao]
                    ]
                }).run().getRange({
                    start: 0,
                    end: 1
                })[0];
                if (cctSearch) {
                    var cctId = cctSearch.id;
                    //Log.error("cctid", cctId);
                    var currLine = currRecord.getCurrentSublistIndex({ sublistId: "item" });
                    currRecord.setCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: "custcol_lrc_ctt_so",
                        value: cctId,
                        fireSlavingSync: true,
                        forceSyncSourcing: true
                    });
                    currRecord.commitLine({ sublistId: "item" });
                    currRecord.selectLine({
                        sublistId: "item",
                        line: currLine,
                    });
                    currRecord.getSublistField({
                        sublistId: "item",
                        fieldId: "amount",
                        line: currLine
                    }).isDisabled = true;
                }
                else {
                    //Log.error("nao encontrou", "sim");
                    currRecord.setCurrentSublistText({
                        sublistId: sublistName,
                        fieldId: "custcol_lrc_ctt_so",
                        text: ""
                    });
                }
            }
            else {
                //Log.error("nao tem item ou regiao", "sim");
                currRecord.setCurrentSublistText({
                    sublistId: sublistName,
                    fieldId: "custcol_lrc_ctt_so",
                    text: ""
                });
            }
        }
    };
    exports.fieldChanged = fieldChanged;
    var calcularPreco = function () {
        alert('O processo de cálculo de preço será iniciado e pode demorar alguns minutos.'
            + ' Quando o processo terminar, se houver erros no cálculo, o campo "Erro no cálculo de preço" estará preenchido com o(s) erro(s).'
            + ' No fim do processo, caso haja sucesso, o campo "Erro no cálculo de Preço" estará preenchido com "Cálculo de preço bem-sucedido"');
        var record = currentRecord_1.default.get();
        // Error array
        var errors = [];
        // Parametros de script, necessarios para referenciar valores. Se houver algum erro nesse parametro -> ERRO!
        var lrc_params_obj = JSON.parse(String(runtime_1.default.getCurrentScript().getParameter({ name: "custscript_lrc_travadeprecos_params_obj" })));
        //Log.error("lrc_params_obj", lrc_params_obj);
        if ((0, rsc_functions_1.check_errors_lrc_params)(errors, lrc_params_obj)) { // erro
            // Escreve os erros no registro
            record.setValue({
                fieldId: "custbody_lrc_erro_calculando_preco_so",
                value: JSON.stringify(errors)
            });
            alert('Fim do cálculo de preço. Por favor, analise o campo "Erro no cálculo de preço"');
            return true;
        }
        ;
        var LRC_TIPO_EXCECAO = {
            "salario": Number(lrc_params_obj.lrc_tipo_excecao.salario),
            "remuneracao": Number(lrc_params_obj.lrc_tipo_excecao.remuneracao),
            "beneficio": Number(lrc_params_obj.lrc_tipo_excecao.beneficio)
        };
        //Log.error("LRC_TIPO_EXCECAO", LRC_TIPO_EXCECAO);
        var LRC_TIPO_DESCONTO = {
            "valor_base": Number(lrc_params_obj.lrc_tipo_desconto.valor_base),
            "porcentagem_piso_salarial": Number(lrc_params_obj.lrc_tipo_desconto.porcentagem_piso_salarial),
            "porcentagem_salario": Number(lrc_params_obj.lrc_tipo_desconto.porcentagem_salario),
            "porcentagem_valor": Number(lrc_params_obj.lrc_tipo_desconto.porcentagem_valor)
        };
        log_1.default.error("LRC_TIPO_DESCONTO", LRC_TIPO_DESCONTO);
        var LRC_TIPO_ADICIONAL_NOTURNO = {
            "proporcional_hora": Number(lrc_params_obj.lrc_tipo_adicional_noturno.proporcional_hora),
            "salario_dia": Number(lrc_params_obj.lrc_tipo_adicional_noturno.salario_dia),
        };
        //Log.error("LRC_TIPO_DESCONTO", LRC_TIPO_ADICIONAL_NOTURNO);
        var companyInformationObj = (0, rsc_functions_1.getConfigInfo)();
        var inicio_periodo_noturno = companyInformationObj["inicio_periodo_noturno"];
        //Log.error("inicio_periodo_noturno", inicio_periodo_noturno);
        var fim_periodo_noturno = companyInformationObj["fim_periodo_noturno"];
        //Log.error("fim_periodo_noturno", fim_periodo_noturno);
        var inicio_periodo_noturno_adnot = companyInformationObj["custrecord_rsc_inicio_adnot"];
        //Log.error("inicio_periodo_noturno_adnot", inicio_periodo_noturno_adnot);
        var fim_periodo_noturno_adnot = companyInformationObj["custrecord_rsc_fim_adnot"];
        //Log.error("fim_periodo_noturno_adnot", fim_periodo_noturno_adnot);
        var user = runtime_1.default.getCurrentUser();
        var total_taxas = companyInformationObj["total_taxas"];
        //Log.error("total_taxas", total_taxas);
        var total_rate = 0;
        // Atravessa as linhas
        var lineCount = record.getLineCount({
            sublistId: "item",
        });
        var _loop_1 = function () {
            // try {
                record.selectLine({
                    line: line,
                    sublistId: "item"
                });
                // Para a funcionalidade, é necessário que item, regiao, CCT e escala e horário de entrada estejam preenchidos
                //Log.error("line", line);
                var item = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: line
                });
                //Log.error("item", item);
                var regiao = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_lrc_region_item",
                    line: line
                });
                //Log.error("regiao", regiao);
                var CCT = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_lrc_ctt_so",
                    line: line
                });
                //Log.error("CCT", CCT);
                var escala = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_lrc_escalas_so",
                    line: line
                });
                //Log.error("escala", escala);
                var horario_de_entrada = record.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_lrc_horario_entrada_so",
                    line: line
                });
                //Log.error("horario de entrada", horario_de_entrada);
                var horas_por_dia_id = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_lrc_horas_dia_escala_so",
                    line: line
                });
                //Log.error("horas_por_dia_id", horas_por_dia_id);
                // No caso do item ter o campo "Não calcular preço" verdadeiro, o cálculo de preço é ignorado na linha
                if (item) {
                    var itemLookup = search_1.default.lookupFields({
                        type: "item",
                        id: item,
                        columns: [
                            "custitem_lrc_check_calcular_item"
                        ]
                    });
                    //Log.error("itemLookup", itemLookup);
                    if (itemLookup["custitem_lrc_check_calcular_item"])
                        return "continue";
                }
                if (!item || !regiao || !CCT || !escala || !horario_de_entrada || !horas_por_dia_id) {
                    // falta campos importantes no calculo -> Erro
                    errors.push({
                        "name": "MISSING FIELD",
                        "description": 'Falta algum dos seguinte campos para o cálculo de preço: Região, Item, CCT, Escalas, Horario de entrada, Horas por dia da Escala',
                        "line": line
                    });
                    return "continue";
                }
                // Pegando valores de coluna de CCT e CCT Exceções para o cálculo de preço
                var CCTLookup = search_1.default.lookupFields({
                    type: "customrecord_lrc_cct",
                    id: CCT,
                    columns: [
                        "custrecord_lrc_piso_salarial_cct", "custrecord_lrc_acrescimo_dissidio", "custrecord_lrc_adicional_lider_cct", "custrecord_lrc_adicional_func_cct",
                        "custrecord_lrc_max_horas_cct", "custrecord_lrc_base_horas_trabalhadas", "custrecord_lrc_hora_extra_segsab_cct", "custrecord_lrc_hextra_dom_fer_cct",
                        "custrecord_lrc_check_dom_folga_cct", "custrecord_lrc_add_noturno_def_cct", "custrecord_lrc_premio_noturno_cct", "custrecord_lrc_add_noturno_cct",
                        "custrecord_lrc_premio_cct", "custrecord_lrc_periculosidade_cct", "custrecord_lrc_insalubridade_cct", "custrecord_lrc_encargos_cct",
                        "custrecord_lrc_gratificacao_cct", "custrecord_lrc_adicional_permanencia_cct", "custrecord_lrc_plr_cct", "custrecord_lrc_dia_vigilante_cct",
                        "custrecord_lrc_desconto_cesta_basica_cct", "custrecord_lrc_bdesc_ccesta_basica_cct", "custrecord_lrc_desc_vale_alimentacao_cct", "custrecord_lrc_bdesc_vale_alime_cct",
                        "custrecord_lrc_desconto_ass_medica_ccl", "custrecord_lrc_bdesc_ass_medica_cct", "custrecord_lrc_desc_ass_odontologica_cct", "custrecord_lrc_bdesc_ass_odonto_cct",
                        "custrecord_lrc_desc_vale_transporte_cct", "custrecord_lrc_bdesc_vale_transporte_cct", "custrecord_lrc_verf_excecoes_cct", "custrecord_lrc_vale_alimentacao_dia_cct",
                        "custrecord_lrc_ass_odontologica_cct", "custrecord_lrc_fundo_formacao_cct", "custrecord_lrc_contri_sindical_cct", "custrecord_lrc_seguro_vida_cct",
                        "custrecord_lrc_salario_familia_cct", "custrecord_lrc_ass_social_familiar_cct", "custrecord_lrc_contri_social_cct", "custrecord_lrc_cesta_basica_cct",
                        "custrecord_lrc_check_cbasica_ferias_cct", "custrecord_lrc_vale_trans_ferias_cct", "custrecord_lrc_ass_medica_ferias_ccl", "custrecord_lrc_valor_assist_med",
                        "custrecord_lrc_equipamentos_cct", "custrecord_rsc_uniformes", "custrecord_rsc_armamento", "custrecord_rsc_bdesc_fundo_for", "custrecord_rsc_desconto_fundo",
                        "custrecord_rsc_bdesc_plr", "custrecord_rsc_desc_plr", "custrecord_rsc_bdesc_seg_vida", "custrecord_rsc_desconto_seg_vida"
                    ]
                });
                //Log.error("CCTLookup", CCTLookup);
                var err_1 = (0, rsc_functions_1.checkErrorsCCTLookup)(CCTLookup, errors, line, LRC_TIPO_DESCONTO, LRC_TIPO_ADICIONAL_NOTURNO); // se err == true -> proxima linha
                //Log.error("err", err);
                if (err_1)
                    return "continue";
                var CCTObj = {
                    "custrecord_lrc_piso_salarial_cct": CCTLookup["custrecord_lrc_piso_salarial_cct"] || 0,
                    "custrecord_lrc_adicional_lider_cct": CCTLookup["custrecord_lrc_adicional_lider_cct"] || 0,
                    "custrecord_lrc_adicional_func_cct": CCTLookup["custrecord_lrc_adicional_func_cct"] || 0,
                    "custrecord_lrc_acrescimo_dissidio": CCTLookup["custrecord_lrc_acrescimo_dissidio"] || 0,
                    "custrecord_lrc_max_horas_cct": CCTLookup["custrecord_lrc_max_horas_cct"] || 0,
                    "custrecord_lrc_base_horas_trabalhadas": CCTLookup["custrecord_lrc_base_horas_trabalhadas"] || 0,
                    "custrecord_lrc_hora_extra_segsab_cct": CCTLookup["custrecord_lrc_hora_extra_segsab_cct"] || 0,
                    "custrecord_lrc_hextra_dom_fer_cct": CCTLookup["custrecord_lrc_hextra_dom_fer_cct"] || 0,
                    "custrecord_lrc_check_dom_folga_cct": CCTLookup["custrecord_lrc_check_dom_folga_cct"] || 0,
                    "custrecord_lrc_add_noturno_def_cct": CCTLookup["custrecord_lrc_add_noturno_def_cct"][0].value || null,
                    "custrecord_lrc_premio_noturno_cct": CCTLookup["custrecord_lrc_premio_noturno_cct"] || 0,
                    "custrecord_lrc_add_noturno_cct": CCTLookup["custrecord_lrc_add_noturno_cct"] || 0,
                    "custrecord_lrc_premio_cct": CCTLookup["custrecord_lrc_premio_cct"] || 0,
                    "custrecord_lrc_periculosidade_cct": CCTLookup["custrecord_lrc_periculosidade_cct"] || 0,
                    "custrecord_lrc_insalubridade_cct": CCTLookup["custrecord_lrc_insalubridade_cct"] || 0,
                    "custrecord_lrc_encargos_cct": CCTLookup["custrecord_lrc_encargos_cct"] || 0,
                    "custrecord_lrc_gratificacao_cct": CCTLookup["custrecord_lrc_gratificacao_cct"] || 0,
                    "custrecord_lrc_adicional_permanencia_cct": CCTLookup["custrecord_lrc_adicional_permanencia_cct"] || 0,
                    "custrecord_lrc_dia_vigilante_cct": CCTLookup["custrecord_lrc_dia_vigilante_cct"] || 0,
                    "custrecord_lrc_plr_cct": CCTLookup["custrecord_lrc_plr_cct"] || 0,
                    "custrecord_lrc_desconto_cesta_basica_cct": CCTLookup["custrecord_lrc_desconto_cesta_basica_cct"] || 0,
                    "custrecord_lrc_bdesc_ccesta_basica_cct": (CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"] && CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"][0]) ? CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"][0].value : null,
                    "custrecord_lrc_desc_vale_alimentacao_cct": CCTLookup["custrecord_lrc_desc_vale_alimentacao_cct"] || 0,
                    "custrecord_lrc_bdesc_vale_alime_cct": (CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"] && CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"][0]) ? CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"][0].value : null,
                    "custrecord_lrc_desconto_ass_medica_ccl": CCTLookup["custrecord_lrc_desconto_ass_medica_ccl"] || 0,
                    "custrecord_lrc_bdesc_ass_medica_cct": (CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"] && CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"][0]) ? CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"][0].value : null,
                    "custrecord_lrc_desc_ass_odontologica_cct": CCTLookup["custrecord_lrc_desc_ass_odontologica_cct"] || 0,
                    "custrecord_lrc_bdesc_ass_odonto_cct": (CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"] && CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"][0]) ? CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"][0].value : null,
                    "custrecord_lrc_desc_vale_transporte_cct": CCTLookup["custrecord_lrc_desc_vale_transporte_cct"] || 0,
                    "custrecord_lrc_bdesc_vale_transporte_cct": (CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"] && CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"][0]) ? CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"][0].value : null,
                    "custrecord_lrc_verf_excecoes_cct": CCTLookup["custrecord_lrc_verf_excecoes_cct"],
                    "custrecord_lrc_vale_alimentacao_dia_cct": CCTLookup["custrecord_lrc_vale_alimentacao_dia_cct"] || 0,
                    "custrecord_lrc_ass_odontologica_cct": CCTLookup["custrecord_lrc_ass_odontologica_cct"] || 0,
                    "custrecord_lrc_fundo_formacao_cct": CCTLookup["custrecord_lrc_fundo_formacao_cct"] || 0,
                    "custrecord_lrc_contri_sindical_cct": CCTLookup["custrecord_lrc_contri_sindical_cct"] || 0,
                    "custrecord_lrc_seguro_vida_cct": CCTLookup["custrecord_lrc_seguro_vida_cct"] || 0,
                    "custrecord_lrc_salario_familia_cct": CCTLookup["custrecord_lrc_salario_familia_cct"] || 0,
                    "custrecord_lrc_ass_social_familiar_cct": CCTLookup["custrecord_lrc_ass_social_familiar_cct"] || 0,
                    "custrecord_lrc_contri_social_cct": CCTLookup["custrecord_lrc_contri_social_cct"] || 0,
                    "custrecord_lrc_cesta_basica_cct": CCTLookup["custrecord_lrc_cesta_basica_cct"] || 0,
                    "custrecord_lrc_ass_medica_ferias_ccl": CCTLookup["custrecord_lrc_ass_medica_ferias_ccl"],
                    "custrecord_lrc_check_cbasica_ferias_cct": CCTLookup["custrecord_lrc_check_cbasica_ferias_cct"],
                    "custrecord_lrc_vale_trans_ferias_cct": CCTLookup["custrecord_lrc_vale_trans_ferias_cct"],
                    "custrecord_lrc_valor_assist_med": CCTLookup["custrecord_lrc_valor_assist_med"] || 0,
                    "custrecord_lrc_equipamentos_cct": CCTLookup["custrecord_lrc_equipamentos_cct"] || 0,
                    "custrecord_rsc_uniformes": CCTLookup["custrecord_rsc_uniformes"] || 0,
                    "custrecord_rsc_armamento": CCTLookup["custrecord_rsc_armamento"] || 0,
                    "custrecord_rsc_bdesc_fundo_for": CCTLookup["custrecord_rsc_bdesc_fundo_for"] || 0,
                    "custrecord_rsc_desconto_fundo": CCTLookup["custrecord_rsc_desconto_fundo"] || 0,
                    "custrecord_rsc_bdesc_plr": CCTLookup["custrecord_rsc_bdesc_plr"] || 0,
                    "custrecord_rsc_desc_plr": CCTLookup["custrecord_rsc_desc_plr"] || 0,
                    "custrecord_rsc_bdesc_seg_vida": CCTLookup["custrecord_rsc_bdesc_seg_vida"] || 0,
                    "custrecord_rsc_desconto_seg_vida": CCTLookup["custrecord_rsc_desconto_seg_vida"] || 0
                };
                //Log.error("CCTobj", CCTObj);
                // Pegando os valores das colunas de CCT Exceções e checando possiveis erros provenientes desses registros
                var excecoes_1 = [];
                if (CCTObj["custrecord_lrc_verf_excecoes_cct"]) {
                    search_1.default.create({
                        type: "customrecord_lrc_cct_excecoes",
                        filters: ["custrecord_lrc_cct", "IS", CCT],
                        columns: ["custrecord_lrc_descricao_cctex", "custrecord_lrc_tipo_excecao_cctex", "custrecord_lrc_acrescimo_cctex", "custrecord_lrc_tipo_aditivo_cctex",
                            "custrecord_lrc_desconto_cctex", "custrecord_lrc_tipo_desconto_cctex"]
                    }).run().each(function (res) {
                        var descricao = res.getValue("custrecord_lrc_descricao_cctex");
                        //Log.error("descricao", descricao);
                        var tipo_excecao = Number(res.getValue("custrecord_lrc_tipo_excecao_cctex"));
                        //Log.error("tipo_excecao", tipo_excecao);
                        var acrescimo = res.getValue("custrecord_lrc_acrescimo_cctex");
                        //Log.error("acrescimo", acrescimo);
                        var tipo_acrescimo = Number(res.getValue("custrecord_lrc_tipo_aditivo_cctex"));
                        //Log.error("tipo_acrescimo", tipo_acrescimo);
                        var desconto = res.getValue("custrecord_lrc_desconto_cctex");
                        //Log.error("desconto", desconto);
                        var tipo_desconto = Number(res.getValue("custrecord_lrc_tipo_desconto_cctex"));
                        //Log.error("tipo_desconto", tipo_desconto);
                        if (acrescimo || desconto) {
                            if (!tipo_excecao) { // é necessário saber o tipo de exceção -> ERRO
                                errors.push({
                                    "name": "MISSING FIELD",
                                    "description": 'O campo Tipo de Exceção é necessário no registro LRC @ CCT Exceções',
                                    "line": line
                                });
                                err_1 = true;
                                return false;
                            }
                            else if (tipo_excecao != LRC_TIPO_EXCECAO["salario"] && tipo_excecao != LRC_TIPO_EXCECAO["remuneracao"] && tipo_excecao != LRC_TIPO_EXCECAO["beneficio"]) { // valor nao parametrizado
                                errors.push({
                                    "name": "INVALID_VALUE",
                                    "description": 'O valor do campo TIPO DE EXCECAO no registro LRC @ CCT Excecões de ID INTERNO ' + String(res.id) + ' não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                                    "line": line
                                });
                                err_1 = true;
                                return false;
                            }
                            if ((acrescimo && !tipo_acrescimo) || (desconto && !tipo_desconto)) { // é necessário saber o tipo de acrescimo -> ERRO 
                                errors.push({
                                    "name": "MISSING FIELD",
                                    "description": 'Os campos Tipo de Aditivo ou Tipo de Desconto são necessários no registro LRC @ CCT Exceções. ' + "ID interno do registro LRC @ CCT Exceção: " + res.id,
                                    "line": line
                                });
                                err_1 = true;
                                return false;
                            }
                            if (acrescimo && tipo_acrescimo && tipo_acrescimo != LRC_TIPO_DESCONTO["valor_base"] && tipo_acrescimo != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && tipo_acrescimo != LRC_TIPO_DESCONTO["porcentagem_salario"] && tipo_acrescimo != LRC_TIPO_DESCONTO["porcentagem_valor"]) {
                                errors.push({
                                    "name": "INVALID_VALUE",
                                    "description": 'O valor do campo TIPO DE ACRESCIMO no registro LRC @ CCT Excecões de ID INTERNO ' + String(res.id) + ' não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                                    "line": line
                                });
                                err_1 = true;
                                return false;
                            }
                            if (desconto && tipo_desconto && tipo_desconto != LRC_TIPO_DESCONTO["valor_base"] && tipo_desconto != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && tipo_desconto != LRC_TIPO_DESCONTO["porcentagem_salario"] && tipo_desconto != LRC_TIPO_DESCONTO["porcentagem_valor"]) {
                                errors.push({
                                    "name": "INVALID_VALUE",
                                    "description": 'O valor do campo TIPO DE DESCONTO no registro LRC @ CCT Excecões de ID INTERNO ' + String(res.id) + ' não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                                    "line": line
                                });
                                err_1 = true;
                                return false;
                            }
                            var excecao = {
                                "descricao": String(descricao),
                                "tipo_excecao": tipo_excecao ? Number(tipo_excecao) : null,
                                "tipo_acrescimo": tipo_acrescimo ? Number(tipo_acrescimo) : null,
                                "acrescimo": acrescimo ? Number(acrescimo) : null,
                                "tipo_desconto": tipo_desconto ? Number(tipo_desconto) : null,
                                "desconto": desconto ? Number(desconto) : null,
                            };
                            //Log.error("excecao", excecao);
                            excecoes_1.push(excecao);
                        }
                        return true;
                    });
                }
                //Log.error("excecoes", excecoes);
                if (err_1)
                    return "continue";
                CCTObj["excecoes"] = excecoes_1;
                //Log.error("cctobj", CCTObj);
                // Pegando valores da coluna de escala para os calculos de preço
                var escala_lookup = search_1.default.lookupFields({
                    id: escala,
                    type: "customrecord_lrc_escala",
                    columns: [
                        "custrecord_lrc_horas_por_dia", "custrecord_lrc_qtd_segundaf", "custrecord_lrc_qtd_tercaf", "custrecord_lrc_qtd_quartaf",
                        "custrecord_lrc_qtd_quintaf", "custrecord_lrc_qtd_sextaf", "custrecord_lrc_qtd_feriados", "custrecord_lrc_qtd_pessoas",
                        "custrecord_lrc_qtd_domingo", "custrecord_lrc_qtd_sabado", "custrecord_lrc_hextra_domingo", "custrecord_rsc_dsr_porc", "custrecord_rsc_dias_mes_benef"
                    ]
                });
                //Log.error("escala_lookup", escala_lookup);
                var escalaObj = {
                    "custrecord_lrc_qtd_domingo": escala_lookup["custrecord_lrc_qtd_domingo"] || 0,
                    "custrecord_lrc_qtd_segundaf": escala_lookup["custrecord_lrc_qtd_segundaf"] || 0,
                    "custrecord_lrc_qtd_tercaf": escala_lookup["custrecord_lrc_qtd_tercaf"] || 0,
                    "custrecord_lrc_qtd_quartaf": escala_lookup["custrecord_lrc_qtd_quartaf"] || 0,
                    "custrecord_lrc_qtd_quintaf": escala_lookup["custrecord_lrc_qtd_quintaf"] || 0,
                    "custrecord_lrc_qtd_sextaf": escala_lookup["custrecord_lrc_qtd_sextaf"] || 0,
                    "custrecord_lrc_qtd_sabado": escala_lookup["custrecord_lrc_qtd_sabado"] || 0,
                    "custrecord_lrc_qtd_feriados": escala_lookup["custrecord_lrc_qtd_feriados"] || 0,
                    "custrecord_lrc_qtd_pessoas": escala_lookup["custrecord_lrc_qtd_pessoas"] || 0,
                    "custrecord_lrc_hextra_domingo": escala_lookup["custrecord_lrc_hextra_domingo"] || 0,
                    "custrecord_rsc_dsr_porc": escala_lookup["custrecord_rsc_dsr_porc"] || 0,
                    "custrecord_rsc_dias_mes_benef": escala_lookup["custrecord_rsc_dias_mes_benef"] || 0
                };
                //Log.error("escalaObjclient", escalaObj);
                // sublistFields -> campos da sublista de itens para preencher
                var sublistFieldsValue_1 = {}; // setSublistValue
                var sublistFieldsText_1 = {}; // setSublistText
                // Calculo de horario de saida
                var horas_por_dia_lookup = search_1.default.lookupFields({
                    type: "customrecord_lrc_hpdia_escala",
                    id: horas_por_dia_id,
                    columns: ["custrecord_lrc_qtd_horas", "custrecord_lrc_horario_almoco"]
                });
                //Log.error("Horas_por_dia_lookup", horas_por_dia_lookup);
                var horario_de_almoco = horas_por_dia_lookup["custrecord_lrc_horario_almoco"];
                var horas_por_dia_trabalhadas = Number(horas_por_dia_lookup["custrecord_lrc_qtd_horas"]);
                //Log.error("horario_de_almoco", horario_de_almoco);
                //Log.error("horas_por_dia_trabalhadas", horas_por_dia_trabalhadas);
                if (!horas_por_dia_trabalhadas) {
                    errors.push({
                        "name": "MISSING FIELD",
                        "description": 'O campo custrecord_lrc_qtd_hora é necessário no registro LRC @ Horas por dia da Escala',
                        "line": line
                    });
                    return "continue";
                }
                horario_de_entrada = (0, rsc_functions_1.get_lrc_time)(user, horario_de_entrada);
                //Log.error("horario_de_entrada_format", horario_de_entrada);
                var horarios = (0, rsc_functions_1.calculateHorarioSaida)(horario_de_entrada, horas_por_dia_trabalhadas, horario_de_almoco);
                //Log.error("horarios", horarios);
                var horario_de_saida = horarios.set.saida;
                //Log.error("horario_de_saida", horario_de_saida)
                sublistFieldsText_1["custcol_lrc_hora_saida_so"] = String(horario_de_saida.horas + ":" + horario_de_saida.minutos);
                sublistFieldsValue_1["custcol_lrc_horas_dia_escala_so"] = horas_por_dia_id;
                // Calculo de salário
                var cargo_de_lider = record.getSublistValue({
                    fieldId: "custcol_lrc_cargo_lider_so",
                    line: line,
                    sublistId: "item"
                });
                //Log.error("cargo_de_lider", cargo_de_lider);
                var acumulo_de_funcao = record.getSublistValue({
                    fieldId: "custcol_lrc_acumulo_funcao_so",
                    line: line,
                    sublistId: "item"
                });
                //Log.error("acumulo_de_funcao", acumulo_de_funcao);
                var adicao_salarial_cliente = record.getSublistValue({
                    fieldId: "custcol_lrc_add_salarial_cliente_so",
                    line: line,
                    sublistId: "item"
                });
                //Log.error("adicao_salarial_cliente", adicao_salarial_cliente);
                var num_pessoas = Number(escalaObj["custrecord_lrc_qtd_pessoas"]);
                var variaveis_salario_1 = (0, rsc_functions_1.calculateVariaveisSalario)(CCTObj, Boolean(cargo_de_lider), Boolean(acumulo_de_funcao), num_pessoas, Number(adicao_salarial_cliente), LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO);
                //Log.error("variaveis_salario", variaveis_salario);
                Object.keys(variaveis_salario_1.set).forEach(function (key) {
                    sublistFieldsValue_1[key] = variaveis_salario_1.set[key];
                });
                // Calculo de horas extras
                var intrajornada = record.getSublistValue({
                    fieldId: "custcol_lrc_intrajornad_indenizada_so",
                    line: line,
                    sublistId: "item"
                });
                //Log.error("intrajornada", intrajornada);
                var variaveis_horas_extra_1 = (0, rsc_functions_1.calculateHorasExtras)(CCTObj, escalaObj, num_pessoas, Number(variaveis_salario_1.set["custcol_lrc_salario_so"]), horas_por_dia_trabalhadas, Boolean(intrajornada), piso_salarial);
                //Log.error("variaveis_horas_extra", variaveis_horas_extra);
                // const variaveis_horas_extra = calculateHorasExtras(CCTObj, escalaObj1, piso_salarial);
                // Log.error("variaveis_horas_extra", variaveis_horas_extra);
                Object.keys(variaveis_horas_extra_1.set).forEach(function (key) {
                    sublistFieldsValue_1[key] = variaveis_horas_extra_1.set[key];
                });
                var dias_trabalhados_mes = variaveis_horas_extra_1.var.dias_trabalhados_mes;
                // Calculo de adicional noturno
                var variaveis_add_noturno_1 = (0, rsc_functions_1.calculateAdicionalNoturno)(CCTObj, Number(variaveis_salario_1.set["custcol_lrc_salario_so"]), Number(dias_trabalhados_mes), horas_por_dia_trabalhadas, horas_por_dia_trabalhadas, (0, rsc_functions_1.get_lrc_time)(user, String(inicio_periodo_noturno)), (0, rsc_functions_1.get_lrc_time)(user, String(fim_periodo_noturno)), (0, rsc_functions_1.get_lrc_time)(user, String(inicio_periodo_noturno_adnot)), (0, rsc_functions_1.get_lrc_time)(user, String(fim_periodo_noturno_adnot)), horario_de_entrada, horario_de_saida, LRC_TIPO_ADICIONAL_NOTURNO);
                //Log.error("variaveis_add_noturno", variaveis_add_noturno);
                Object.keys(variaveis_add_noturno_1.set).forEach(function (key) {
                    sublistFieldsValue_1[key] = variaveis_add_noturno_1.set[key];
                });
                // Preencher demais campos de remuneração (Premio, Gratificacao, Periculosidade, Total de encargos, Insalubridade, Dia do Vigilante,
                // Adicional de permanencia, Total de descontos - soma dos descontos cesta basica + vale alimentacao + assist medica + assist odontologica + vale transporte,
                // P.L.R, excecoes de remuneracao, remuneracao)
                var piso_salarial = Number(variaveis_salario_1.set["custcol_lrc_piso_salarial_so"]);
                var salario = Number(variaveis_salario_1.set["custcol_lrc_salario_so"]);
                var adicional_noturno = Number(variaveis_add_noturno_1.set["custcol_lrc_add_noturno_so"]);
                var valor_horas_extras = Number(variaveis_horas_extra_1.set["custcol_lrc_hextra_prevista_so"]);
                var alimentacao_cliente = Boolean(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_check_refeicao_cliente_so",
                    "line": line,
                }));
                var adicional_vale_refeicao = Number(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_adicao_vale_refeicao",
                    "line": line
                }));
                var variaveis_remuneracao_1 = (0, rsc_functions_1.calculateRemuneracao)(CCTObj, escalaObj, num_pessoas, piso_salarial, salario, adicional_noturno, valor_horas_extras, LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO);
                Object.keys(variaveis_remuneracao_1.set).forEach(function (key) {
                    sublistFieldsValue_1[key] = variaveis_remuneracao_1.set[key];
                });
                // Cálculo de benefícios e preencher demais campos de benefícios 
                var regiaoLookup = search_1.default.lookupFields({
                    type: "customrecord_lrc_regiao",
                    id: regiao,
                    columns: "custrecord_lrc_vale_transporte",
                });
                //Log.error("regiaoLookup", regiaoLookup);
                var vale_transporte_regiao = Number(regiaoLookup["custrecord_lrc_vale_transporte"]) || 0;
                //Log.error("vale_transporte_regiao", vale_transporte_regiao);
                var adicional_vale_transporte = Number(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_add_vale_transporte",
                    "line": line
                }));
                //Log.error("adicional_vale_transporte", adicional_vale_transporte);
                var adicional_cesta_basica = Number(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_ass_cesta_cliente_so",
                    "line": line
                }));
                //Log.error("adicional_cesta_basica", adicional_cesta_basica);
                var adicional_beneficio = Number(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_acrescimo_benef_user_so",
                    "line": line
                }));
                //Log.error("adicional_beneficio", adicional_beneficio);
                var descricao_adicional_beneficio = String(record.getSublistValue({
                    "sublistId": "item",
                    "fieldId": "custcol_lrc_desc_acresc_benef_user_so",
                    "line": line
                }));
                //Log.error("descricao_adicional_beneficio", descricao_adicional_beneficio);
                var dias_trabalhados_mes_ben = Number(escalaObj["custrecord_rsc_dias_mes_benef"]);
                var variaveis_beneficios_1 = (0, rsc_functions_1.calculateBeneficios)(CCTObj, dias_trabalhados_mes_ben, num_pessoas, piso_salarial, salario, vale_transporte_regiao, adicional_vale_transporte, adicional_cesta_basica, alimentacao_cliente, Boolean(horario_de_almoco), adicional_beneficio, adicional_vale_refeicao, LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO);
                Object.keys(variaveis_beneficios_1.set).forEach(function (key) {
                    sublistFieldsValue_1[key] = variaveis_beneficios_1.set[key];
                });
                // Calculo de preço na linha no campo rate da sublista de itens 
                var beneficios = variaveis_beneficios_1.set["custcol_lrc_beneficios_so"];
                var remuneracao = variaveis_remuneracao_1.set["custcol_lrc_remuneracao_so"];
                var total_impostos = (0, rsc_functions_1.calculateImpostos)(Number(item), Number(regiao));
                log_1.default.error("total_impostos2", total_impostos);
                var line_rate = (0, rsc_functions_1.calculateLineRate)(CCTObj, remuneracao, beneficios, total_impostos, total_taxas, Number(item));
                ;
                log_1.default.error("valor do line rate", line_rate);
                console.log("valor do line rate", line_rate);
                
                sublistFieldsValue_1["custcol_lrc_impostos_so"] = total_impostos;
                sublistFieldsValue_1["rate"] = line_rate;
                total_rate += line_rate;
                // set lineFields
                //Log.error("sublistFieldsValue", sublistFieldsValue);
                //Log.error("sublistFieldsText", sublistFieldsText);
                Object.keys(sublistFieldsValue_1).forEach(function (key) {
                    record.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: String(key),
                        value: sublistFieldsValue_1[key]
                    });
                });
                Object.keys(sublistFieldsText_1).forEach(function (key) {
                    record.setCurrentSublistText({
                        sublistId: "item",
                        fieldId: String(key),
                        text: sublistFieldsText_1[key]
                    });
                });
                record.commitLine({
                    sublistId: "item"
                });
            //}
            // catch (e) {
            //     errors.push({
            //         "name": e.name,
            //         "description": e.message,
            //         "line": line
            //     });
            // }
        };
        for (var line = 0; line < lineCount; line++) {
            _loop_1();
        }
        // Escreve os erros no registro
        record.setValue({
            fieldId: "custbody_lrc_erro_calculando_preco_so",
            value: errors.length == 0 ? "Cálculo de preço bem-sucedido!" : JSON.stringify(errors)
        });
        // Se não há erros, faça o cálculo das taxas no registro de estimativa ou pedido de vendas, considerando o valor total e o valor total das taxas 
        if (errors.length == 0) {
            var discountRate = String(record.getText("discountrate")); // pode ser uma porcentagem ou valor absoluto;
            // transformar o discountRate em porcentagem
            if (discountRate == "") {
                discountRate = 0;
            }
            else if (discountRate.indexOf("%") == -1) { // nao esta em porcentagem -> transformar em porcentagem
                if (total_rate == 0)
                    discountRate = 0; // divisao por zero
                else
                    discountRate = (Number(record.getValue("discountrate")) / total_rate) * 100;
            }
            else { // retira o % da string
                discountRate = Number(record.getValue("discountrate"));
            }
            //Log.error("discountRate", discountRate);
            if (discountRate) {
                var p = (-discountRate) / total_taxas;
                //Log.error("p", p);
                var subsidiaria_taxa_operacional = companyInformationObj["subsidiaria_taxa_operacional"];
                //Log.error("sub_taxa_operacional", subsidiaria_taxa_operacional);
                var subsidiaria_reserva_tecnica = companyInformationObj["subsidiaria_reserva_tecnica"];
                //Log.error("sub_reserva_tecnica", subsidiaria_reserva_tecnica);
                var subsidiaria_lucro = companyInformationObj["subsidiaria_lucro"];
                //Log.error("sub_lucro", subsidiaria_lucro);
                var taxa_operacional = (1 - p) * subsidiaria_taxa_operacional;
                //Log.error("taxa_operacional", taxa_operacional);
                record.setValue({
                    fieldId: "custbody_lrc_taxa_adm_operacional",
                    value: taxa_operacional
                });
                var reserva_tecnica = (1 - p) * subsidiaria_reserva_tecnica;
                //Log.error("reserva_tecnica", reserva_tecnica);
                record.setValue({
                    fieldId: "custbody_lrc_reserva_tecnica",
                    value: reserva_tecnica
                });
                var lucro = (1 - p) * subsidiaria_lucro;
                //Log.error("lucro", lucro);
                record.setValue({
                    fieldId: "custbody_lrc_lucro",
                    value: lucro
                });
                record.setValue({
                    fieldId: "custbody_lrc_total_taxas",
                    value: taxa_operacional + reserva_tecnica + lucro
                });
            }
        }
        alert('Fim do cálculo de preço. Por favor, analise o campo "Erro no cálculo de preço"');
        return true;
    };
    exports.calcularPreco = calcularPreco;
});
