/**
* rsc_functions.ts
* @NApiVersion 2.1
* @NModuleScope Public
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/log", "N/search", "N/https", "N/url"], function (require, exports, log_1, search_1, https_1, url_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkErrorsCCTLookup = exports.calculateLineRate = exports.calculateImpostos = exports.calculateBeneficios = exports.calculateRemuneracao = exports.calculateAdicionalNoturno = exports.getNightHoursOnSingleDay = exports.calculateHorasExtras = exports.calculateVariaveisSalario = exports.calculateHorarioSaida = exports.subtract_lrc_time = exports.cmp_lrc_time = exports.cmp = exports.get_lrc_time = exports.check_errors_lrc_params = exports.getConfigInfo = void 0;
    log_1 = __importDefault(log_1);
    search_1 = __importDefault(search_1);
    https_1 = __importDefault(https_1);
    url_1 = __importDefault(url_1);
    // Funcoes
    //Só do src_lrc_ClientCalcularPreco_1
    function getConfigInfo() {
        var url = url_1.default.resolveScript({
            scriptId: "customscript_lrc_calcularpreco_st",
            deploymentId: "customdeploy_lrc_calcularpreco_st"
        });
        //log_1.default.error("url", url);
        var response = https_1.default.get({
            url: url,
        });
        //log_1.default.error("response", response);
        return JSON.parse(response.body);
    }
    exports.getConfigInfo = getConfigInfo;
    // Funcoes presente em ambos
    function check_errors_lrc_params(errors, lrc_params_obj) {
        //log_1.default.error("lrc_params_obj", lrc_params_obj);
        var clause = !lrc_params_obj;
        clause = clause || !lrc_params_obj.lrc_tipo_adicional_noturno || !lrc_params_obj.lrc_tipo_adicional_noturno.proporcional_hora || !lrc_params_obj.lrc_tipo_adicional_noturno.salario_dia;
        clause = clause || !lrc_params_obj.lrc_tipo_desconto.valor_base || !lrc_params_obj.lrc_tipo_desconto.porcentagem_piso_salarial || !lrc_params_obj.lrc_tipo_desconto.porcentagem_salario || !lrc_params_obj.lrc_tipo_desconto.porcentagem_valor;
        clause = clause || !lrc_params_obj.lrc_tipo_excecao || !lrc_params_obj.lrc_tipo_excecao.salario || !lrc_params_obj.lrc_tipo_excecao.remuneracao || !lrc_params_obj.lrc_tipo_excecao.beneficio;
        if (clause) {
            errors.push({
                "name": "MISSING_PARAMS OR INVALID_FORMAT",
                "description": 'É necessário preencher o parâmetro de script custscript_lrc_travadeprecos_params_obj presenta no registro Preferências Gerais na aba Personalizado.'
                    + 'O parâmetro deve estar em formato JSON, no seguinte formato: {"lrc_tipo_adicional_noturno":{"proporcional_hora":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Adicional Noturno,"salario_dia":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Adicional Noturno},"lrc_tipo_desconto":{"valor_base":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Desconto,"porcentagem_piso_salarial":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Desconto,"porcentagem_salario":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Desconto},"lrc_tipo_excecao":{"salario":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Excecao,"remuneracao":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Excecao,"beneficio":VALOR CORRESPONDENTE NA LISTA LRC @ Tipo Excecao}}',
            });
            return true;
        }
        return false;
    }
    exports.check_errors_lrc_params = check_errors_lrc_params;
    // Recebe uma String que representa um field do tipo "Time of Day" e retorna um objeto no formato LRC_TIME = {"horas": number, "minutos": number}
    function get_lrc_time(user, horario) {
        var timeFormat = user.getPreference({
            name: 'TIMEFORMAT'
        });
        //log_1.default.error("timeformat", timeFormat);
        var horas, minutos;
        if (timeFormat == "h:mm a") { // am pm :
            var am = horario.split(" ")[1] == "am";
            //log_1.default.error("am", am);
            horas = parseInt(horario.split(" ")[0].split(":")[0]);
            minutos = parseInt(horario.split(" ")[0].split(":")[1]);
            if (!am)
                horas += 12; // pm
        }
        else if (timeFormat == "H:mm") { // 24 :
            horas = parseInt(horario.split(":")[0]);
            minutos = parseInt(horario.split(":")[1]);
        }
        else if (timeFormat == "h-mm a") { // am pm -
            var am = horario.split(" ")[1] == "am";
            //log_1.default.error("am", am);
            horas = parseInt(horario.split(" ")[0].split("-")[0]);
            minutos = parseInt(horario.split(" ")[0].split("-")[1]);
            if (!am)
                horas += 12; // pm
        }
        else { // 24 - 
            horas = parseInt(horario.split(":")[0]);
            minutos = parseInt(horario.split(":")[1]);
            ;
        }
        return {
            "horas": horas,
            "minutos": minutos
        };
    }
    exports.get_lrc_time = get_lrc_time;
    // compara dois valores numericos (0 se igual, 1 se (x > y) , -1 se (x < y) )
    function cmp(x, y) {
        return Number((x > y)) - Number((x < y));
    }
    exports.cmp = cmp;
    // compara dois valores LRC_TIME (0 se igual, 1 se (h1 > h2) , -1 se (h1 < h2) )
    function cmp_lrc_time(h1, h2) {
        var c1 = cmp(h1.horas, h2.horas);
        //Log.error('c1', c1)
        return (c1 == 0) ? cmp(h1.minutos, h2.minutos) : c1;
    }
    exports.cmp_lrc_time = cmp_lrc_time;
    // subtrai dois valores LRC_TIME e retorna um decimal float 
    function subtract_lrc_time(h1, h2) {
        return Number((h1.horas + h1.minutos / 60)) - Number((h2.horas + h2.minutos / 60));
    }
    exports.subtract_lrc_time = subtract_lrc_time;
    // calculateHorarioSaida
    // Calcula o horario de saida no seguinte formato
    /*
        "set":{
            "saida":{
                "horas": horas_saida, // 0 - 24
                "minutos": minutos_saida // 0 - 59
              }
        },
    */
    function calculateHorarioSaida(horario_de_entrada, horas_por_dia, horario_de_almoco) {
        var horas_saida, minutos_saida, horas_entrada, minutos_entrada;
        //log_1.default.error("horas_minutos_entrada", horario_de_entrada);
        horas_entrada = horario_de_entrada.horas;
       // log_1.default.error("horas_entrada", horas_entrada);
        minutos_entrada = horario_de_entrada.minutos;
        //log_1.default.error("minutos_entrada", minutos_entrada);
        var horas_trabalhadas = Math.floor(horas_por_dia);
        var minutos_trabalhados = Math.round(((horas_por_dia - horas_trabalhadas) * 60));
        //log_1.default.error("horas_trabalhadas", horas_trabalhadas);
        //log_1.default.error("minutos_trabalhados", minutos_trabalhados);
        horas_saida = horas_entrada + horas_trabalhadas + (horario_de_almoco ? 1 : 0) + Math.floor((minutos_trabalhados + minutos_entrada) / 60);
        horas_saida = horas_saida > 24 ? horas_saida - 24 : horas_saida;
        minutos_saida = (minutos_trabalhados + minutos_entrada) % 60;
        return {
            "set": {
                "saida": {
                    "horas": horas_saida,
                    "minutos": minutos_saida
                }
            }
        };
    }
    exports.calculateHorarioSaida = calculateHorarioSaida;
    // Calcula os campos relacionados as variaveis de salario na sublista de itens
    function calculateVariaveisSalario(CCTObj, cargo_de_lider, acumulo_de_funcao, num_pessoas, adicao_salarial_cliente, LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO) {
        var salario = 0;
        //log_1.default.error("cctobjs", CCTObj);
        var acrescimo_dissidio = parseFloat(String(CCTObj["custrecord_lrc_acrescimo_dissidio"]));
        //log_1.default.error("acrescimo_dissidio", acrescimo_dissidio);
        var piso_salarial = parseFloat(String(CCTObj["custrecord_lrc_piso_salarial_cct"]));
        //log_1.default.error("piso_salarial", piso_salarial);
        piso_salarial += piso_salarial * (acrescimo_dissidio / 100);
        //log_1.default.error("piso_salarial", piso_salarial);
        var porcentagem_lider = parseFloat(String(CCTObj["custrecord_lrc_adicional_lider_cct"]));
        //log_1.default.error("porcentagem_lider", porcentagem_lider);
        var valor_lider = (porcentagem_lider / 100) * piso_salarial;
       // log_1.default.error("valor_lider", valor_lider);
        var porcentagem_acumulo = parseFloat(String(CCTObj["custrecord_lrc_adicional_func_cct"]));
       // log_1.default.error("porcentagem_acumulo", porcentagem_acumulo);
        var valor_acumulo = (porcentagem_acumulo / 100) * piso_salarial;
        //log_1.default.error("valor_acumulo", valor_acumulo);
        // salario
        salario += piso_salarial;
        if (cargo_de_lider)
            salario += valor_lider;
        if (acumulo_de_funcao)
            salario += valor_acumulo;
        if (adicao_salarial_cliente)
            salario += adicao_salarial_cliente;
        //log_1.default.error("salarioantesdeexcecoes", salario);
        var valor_excecao = 0;
        var valor_base_excecao = 0;
        var porcentagem_piso_salarial = 0;
        var porcentagem_salario = 0;
        var porcentagem_valor = 0;
        CCTObj["excecoes"].forEach(function (excecao) {
            if (excecao.tipo_excecao == LRC_TIPO_EXCECAO["salario"]) { // PARAMETRO TIPO_DE_EXCECAO = SALARIO
                if (excecao.tipo_acrescimo && excecao.acrescimo) {
                    switch (excecao.tipo_acrescimo) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                            valor_base_excecao += excecao.acrescimo;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial += excecao.acrescimo;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario += excecao.acrescimo;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor 
                            porcentagem_valor += excecao.acrescimo;
                            break;
                    }
                }
                if (excecao.tipo_desconto && excecao.desconto) {
                    switch (excecao.tipo_desconto) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // porcentagem do valor base
                            valor_base_excecao -= excecao.desconto;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial -= excecao.desconto;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario -= excecao.desconto;
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                            porcentagem_valor -= excecao.desconto;
                            break;
                    }
                }
            }
        });
        //log_1.default.error("valor_base_excecao salario", valor_base_excecao);
        //log_1.default.error("porcentagem_piso_salarial salario", porcentagem_piso_salarial);
        //log_1.default.error("porcentagem_salario salario", porcentagem_salario);
        //log_1.default.error("porcentagem_valor salario", porcentagem_valor);
        valor_excecao += valor_base_excecao;
        valor_excecao += piso_salarial * (porcentagem_piso_salarial / 100);
        salario += valor_excecao; // o valor de excecao em porcentagem de salario entra posteriormente no calculo de REMUNERACAO
        //log_1.default.error("salario antes da excecao na porcentagem do salario", salario);
        // Os valores da descricao das excecoes sao calculados a partir do salario antes da excecao por porcentagem do salario
        var descricao_excecoes = "";
        CCTObj["excecoes"].forEach(function (excecao) {
            if (excecao.tipo_excecao == LRC_TIPO_EXCECAO["salario"]) { // PARAMETRO TIPO_DE_EXCECAO = REMUNERACAO
                descricao_excecoes += excecao.descricao += ": ";
                if (excecao.tipo_acrescimo && excecao.acrescimo) {
                    descricao_excecoes += "+";
                    switch (excecao.tipo_acrescimo) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                            descricao_excecoes += excecao.acrescimo + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            descricao_excecoes += excecao.acrescimo + "% do piso salarial = " + piso_salarial * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            descricao_excecoes += excecao.acrescimo + "% do salário = " + salario * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                            descricao_excecoes += excecao.acrescimo + "% do valor = " + valor_excecao * (excecao.acrescimo / 100) + "\n";
                            break;
                    }
                }
                if (excecao.tipo_desconto && excecao.desconto) {
                    descricao_excecoes += "-";
                    switch (excecao.tipo_desconto) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // porcentagem do valor base
                            descricao_excecoes += excecao.desconto + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            descricao_excecoes += excecao.desconto + "% do piso salarial = -" + piso_salarial * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            descricao_excecoes += excecao.desconto + "% do salário = -" + salario * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                            descricao_excecoes += excecao.desconto + "% do valor = -" + valor_excecao * (excecao.desconto / 100) + "\n";
                            break;
                    }
                }
                descricao_excecoes += "\n";
            }
        });
        var valor_excecao_porcentagem_salario = salario * (porcentagem_salario / 100);
        //////log_1.default.error("valor_excecao_porcentagem_salario", valor_excecao_porcentagem_salario);
        valor_excecao += valor_excecao_porcentagem_salario;
        //////log_1.default.error("valor_excecao", valor_excecao);
        salario += valor_excecao_porcentagem_salario;
        //////log_1.default.error("salario depois da excecao na porcentagem do salario", salario);
        return {
            "set": {
                "custcol_lrc_piso_salarial_so": piso_salarial,
                "custcol_lrc_add_bsalario_lider_so": cargo_de_lider ? valor_lider * num_pessoas : 0,
                "custcol_lrc_acufuncao_bsalarial_so": acumulo_de_funcao ? valor_acumulo * num_pessoas : 0,
                "custcol_lrc_outros_salario_so": valor_excecao,
                "custcol_lrc_salario_so": salario,
                "custcol_lrc_desc_outros_salario_so": descricao_excecoes
            }
        };
    }
    exports.calculateVariaveisSalario = calculateVariaveisSalario;
    function calculateHorasExtras(CCTObj, escalaObj, num_pessoas, salario, horas_trabalhadas_dia, intrajornada, piso_salarial) {
        // Há 3 casos de horas extras principais: 
        // Horas extras que extrapolam o Máximo de horas semanais indicados pela tabela de CCT
        // Horas extras de Intrajornada
        // Horas extras de CCTs que exigem um domingo de folga por mês
        var horas_extra_segsab = 0, horas_extra_domfer = 0;
        var base_horas_totais = Number(CCTObj["custrecord_lrc_base_horas_trabalhadas"]); //220
        ////log_1.default.error("base_horas_totais", base_horas_totais);
        var horas_extra_percentual_segsab = parseFloat(String(CCTObj["custrecord_lrc_hora_extra_segsab_cct"])); //0.5
       //// log_1.default.error("horas_extras_percentual_segsab", horas_extra_percentual_segsab);
        var horas_extra_percentual_domfer = parseFloat(String(CCTObj["custrecord_lrc_hextra_dom_fer_cct"])); //1
       //// log_1.default.error("horas_extra_percentual_domfer", horas_extra_percentual_domfer);
        var NUMBER_OF_WEEKS_IN_MONTH = 4.3571; // (30.5/7 aproximadamente) -> numero de dias da semanas em um mes de 30.5 dias 
        // Primeiro caso - Referente as horas extras que extrapolam o Maximo de horas semanais indicado pela tabela de CCT 
        // Considerar a porcentagem de cada uma das pessoas 
        // 6 horas de maximo de horas extrapolado -> 6 horas extras -> Considerar porcentagem para domingos e feriados e outra para seg-sabado (DOMINGOS/DIAS TRABALHADOS NO MES) 1.2 DOMINGO 4.8 PRA SEG-SABADO
        // As horas extras que extrapolam o limite definido pela CCT devem considerar o número de pessoas da escala
        // Suponha 2.8 pessoas na escala e 100 horas semanais. Teríamos que o trabalho de 1 pessoa corresponde à 35.71 horas
        // O trabalho de "0.8 pessoa" corresponderia à 0.8 * 35.71 = 28.568 horas semanais
        // Supondo que o Máximo da CCT seja 25 horas, teríamos (28.568 - 25) * 1 + (35.71 - 25) * 2 = 24.988 horas extras extrapoladas.
        var maximo_horas = Number(CCTObj["custrecord_lrc_max_horas_cct"]);
        //log_1.default.error("maximoHorasCCT", maximo_horas);
        var dias_trabalhados_mes = 0;
        dias_trabalhados_mes += Number(escalaObj["custrecord_lrc_qtd_domingo"]) + Number(escalaObj["custrecord_lrc_qtd_segundaf"]) + Number(escalaObj["custrecord_lrc_qtd_tercaf"]);
        dias_trabalhados_mes += Number(escalaObj["custrecord_lrc_qtd_quartaf"]) + Number(escalaObj["custrecord_lrc_qtd_quintaf"]);
        dias_trabalhados_mes += Number(escalaObj["custrecord_lrc_qtd_sextaf"]) + Number(escalaObj["custrecord_lrc_qtd_sabado"]) + Number(escalaObj["custrecord_lrc_qtd_feriados"]);
        //log_1.default.error("Dias trabalhados - Primeiro Caso", dias_trabalhados_mes);
        var domingos = Number(escalaObj["custrecord_lrc_qtd_domingo"]);
        //log_1.default.error("domingos", domingos);
        var feriados = Number(escalaObj["custrecord_lrc_qtd_feriados"]);
        //log_1.default.error("feriados", feriados);
        var dias_trabalhados_semana = Number(dias_trabalhados_mes / NUMBER_OF_WEEKS_IN_MONTH);
        //log_1.default.error("dias_trabalhados_semana", dias_trabalhados_semana);
        var horas_semanais = horas_trabalhadas_dia * dias_trabalhados_semana;
        //log_1.default.error("horas_semanais", horas_semanais);
        var horas_semanais_pessoa = horas_semanais / num_pessoas; // horas semanais por pessoa 
        //log_1.default.error("horas semanais por pessoa", horas_semanais_pessoa);
        var remainder = num_pessoas - Math.floor(num_pessoas); // Se tivermos 2.8 pessoas na escala, teremos um remainder (resto) de 0.8
        var horas_semanais_remainder = horas_semanais_pessoa * remainder;
        //log_1.default.error("horas semanais remainder", horas_semanais_remainder);
        var tmp1 = (num_pessoas >= 1) ? (horas_semanais_pessoa - maximo_horas) * Math.floor(num_pessoas) : 0; // se num_pessoas for menor q 1 só considere o remainder.
        var tmp2 = (horas_semanais_remainder - maximo_horas);
        var horas_extras1 = (tmp1 < 0 ? 0 : tmp1) + (tmp2 < 0 ? 0 : tmp2); // As horas extras desse primeiro caso é calculada a partir da soma das horas extras trabalhados por 1 pessoa inteira e pelo remainder
        //log_1.default.error("horas_extras1", horas_extras1);
        horas_extra_segsab += horas_extras1 * (dias_trabalhados_mes - domingos - feriados) / (dias_trabalhados_mes);
        horas_extra_domfer += horas_extras1 * (domingos + feriados) / (dias_trabalhados_mes);
        // Segundo caso - Referente as horas extras de feriados e/ou de CCTs que exigem um domingo de folga por mes e nao ha domingo de folga
        // Se o campo "Um Domingo de Folga por mês?" estiver preenchido na CCT, entao a CCT obriga um domingo de folga por mes
        // Se o campo "Hora Extra no Domingo" estiver preenchido na Escala, então não há folga no domingo nessa escala 
        // Portanto, se ambos campos estiverem preenchidos, um domingo inteiro será considerado como hora extra
        var cct_folga_domingo_obrigatoria = CCTObj["custrecord_lrc_check_dom_folga_cct"];
        //log_1.default.error("cct_folga_domingo_obrigatoria", cct_folga_domingo_obrigatoria); //true
        var escala_folga_domingo = !escalaObj["custrecord_lrc_hextra_domingo"]; // false: nao tem folga na escala, true: tem folga na escala
        //log_1.default.error("escala_folga_domingo", escala_folga_domingo); //false
        horas_extra_domfer += feriados * horas_trabalhadas_dia;
        if (cct_folga_domingo_obrigatoria && !escala_folga_domingo) { // cct obriga folga no domingo e escala nao tem folga no domingo
            horas_extra_domfer += horas_trabalhadas_dia;
        }
        // Terceiro caso - Referente as horas extras de intrajornada. Se esse campo estiver marcado, as horas de almoço serão consideradas horas extras
        // Hora de almoço = 1 hora todos os dias 
        if (intrajornada) {
            // Se dias_trabalhados_mes = 22 dias e temos domingos + feriados = 4, temos: 18 seg a sabado, 4 de domingos e feriados 
            horas_extra_segsab += 1 * (dias_trabalhados_mes - domingos - feriados);
            horas_extra_domfer += 1 * (domingos + feriados);
        }
        //log_1.default.error("horas_extra_segsab", horas_extra_segsab);
        //log_1.default.error("horas_extra_domfer", horas_extra_domfer);
        var valor_horas_extra = 0;
        valor_horas_extra += (salario / base_horas_totais) * (1 + horas_extra_percentual_domfer / 100) * (horas_extra_domfer);
        valor_horas_extra += (salario / base_horas_totais) * (1 + horas_extra_percentual_segsab / 100) * (horas_extra_segsab);
        //log_1.default.error("valor_horas_extra", valor_horas_extra);
        return {
            "set": {
                "custcol_lrc_hextra_prevista_so": valor_horas_extra,
                "custcol_lrc_numero_horas_extras1": horas_extra_segsab,
                "custcol_lrc_numero_horas_extras2": horas_extra_domfer,
            },
            "var": {
                "dias_trabalhados_mes": dias_trabalhados_mes
            }
        };
    }
    exports.calculateHorasExtras = calculateHorasExtras;
    // Supoe que todos os LRC_TIME ocorrem no mesmo dia e calcula as horas noturnas desse dia 
    function getNightHoursOnSingleDay(horario_de_entrada, horario_de_saida, inicio_periodo_noturno, fim_periodo_noturno) {
        var night_hours = 0;
        if (cmp_lrc_time(fim_periodo_noturno, inicio_periodo_noturno) == -1) { // fim do periodo noturno < inicio do periodo noturno (Fim do periodo noturno no dia seguinte)
            // Se o dia começa antes do fim do periodo noturno, a diferença deve ser contabilizada
            if (cmp_lrc_time(horario_de_entrada, fim_periodo_noturno) == -1) {
                if (cmp_lrc_time(horario_de_saida, fim_periodo_noturno) == -1)
                    night_hours += subtract_lrc_time(horario_de_saida, horario_de_entrada);
                else
                    night_hours += subtract_lrc_time(fim_periodo_noturno, horario_de_entrada);
            }
            //  Se o dia termina apos o fim da noite, a diferença deve ser contabilizada
            if (cmp_lrc_time(horario_de_saida, inicio_periodo_noturno) == 1) {
                if (cmp_lrc_time(inicio_periodo_noturno, horario_de_entrada) == -1)
                    night_hours += subtract_lrc_time(horario_de_saida, horario_de_entrada);
                else
                    night_hours += subtract_lrc_time(horario_de_saida, inicio_periodo_noturno);
            }
        }
        else if (cmp_lrc_time(fim_periodo_noturno, inicio_periodo_noturno) == 1) { // fim do periodo noturno > inicio do periodo noturno (Fim do periodo noturno no mesmo dia que o inicio do periodo noturno)
            var inicio = void 0, fim = null;
            if (cmp_lrc_time(horario_de_entrada, fim_periodo_noturno) == 1 || cmp_lrc_time(horario_de_saida, inicio_periodo_noturno) == -1) {
                inicio = fim = null;
            }
            else {
                if (cmp_lrc_time(inicio_periodo_noturno, horario_de_entrada) == -1) {
                    inicio = horario_de_entrada;
                }
                else
                    inicio = inicio_periodo_noturno;
                if (cmp_lrc_time(fim_periodo_noturno, horario_de_saida) == -1) {
                    fim = fim_periodo_noturno;
                }
                else
                    fim = horario_de_saida;
            }
            if (inicio && fim) {
                night_hours += subtract_lrc_time(fim, inicio);
            }
        }
        return night_hours;
    }
    exports.getNightHoursOnSingleDay = getNightHoursOnSingleDay;
    // calculateAdicionalNoturno
    // Recebe objeto CCT, o salario e os campos "Time of Day" responsáveis pelo período noturno convertidos em LRC_TIME {horas: [0,24], minutos: [0,59]} para facilitar as contas em diversas formatações.
    function calculateAdicionalNoturno(CCTObj, salario, dias_trabalhados_mes, horas_trabalhadas_dia, horas_por_dia_trabalhadas, inicio_periodo_noturno, fim_periodo_noturno, inicio_periodo_noturno_adnot, fim_periodo_noturno_adnot, horario_de_entrada, horario_de_saida, LRC_TIPO_ADICIONAL_NOTURNO) {
        //log_1.default.error("inicio_periodo", inicio_periodo_noturno);
        //log_1.default.error("fim_periodo", fim_periodo_noturno);
        //log_1.default.error("inicio_periodo_noturno", inicio_periodo_noturno_adnot);
       // log_1.default.error("fim_periodo_noturno", fim_periodo_noturno_adnot);
        //log_1.default.error("horario_de_entrada", horario_de_entrada);
        //log_1.default.error("horario_de_saida", horario_de_saida);
        //log_1.default.error('horas por dia', horas_por_dia_trabalhadas);
        var horas_noturnas = 0;
        var addNoturnoDefinidoPor = Number(CCTObj["custrecord_lrc_add_noturno_def_cct"]); //proporcional a hora ou salário do dia
        //log_1.default.error("addNoturnoDefinidoPor", addNoturnoDefinidoPor);
        var horas_adicionais_noturnas = 0;
        if (cmp_lrc_time(horario_de_saida, horario_de_entrada) == -1) { // Horario de saida menor que o horario de entrada significa que horario de saida é no outro dia
            horas_noturnas += getNightHoursOnSingleDay(horario_de_entrada, { horas: 24, minutos: 0 }, inicio_periodo_noturno_adnot, fim_periodo_noturno_adnot);
            horas_noturnas += getNightHoursOnSingleDay({ horas: 0, minutos: 0 }, horario_de_saida, inicio_periodo_noturno_adnot, fim_periodo_noturno_adnot);
        }
        else { // Horario de entrada e saida no mesmo dia 
            horas_noturnas += getNightHoursOnSingleDay(horario_de_entrada, horario_de_saida, inicio_periodo_noturno, fim_periodo_noturno);
        }
        //log_1.default.error("horas noturnas", horas_noturnas); // horas noturnas por dia 
        //log_1.default.error("horas noturnas tipo", typeof horas_noturnas);
        switch (addNoturnoDefinidoPor) {
            case LRC_TIPO_ADICIONAL_NOTURNO["proporcional_hora"]:
                ////////log_1.default.error("Proporcional hora", "sim");
                if (horas_noturnas != 0) {
                    horas_adicionais_noturnas = horas_noturnas * (14 / 24) * dias_trabalhados_mes;
                }
                break;
            case LRC_TIPO_ADICIONAL_NOTURNO["salario_dia"]: // Salario do dia -> O dia inteiro é considerado como adicional noturno se alguma hora invade o período noturno
               //////// log_1.default.error("Salario dia", "sim");
                if (horas_noturnas != 0) {
                    horas_adicionais_noturnas = horas_noturnas * (7 / 24) * dias_trabalhados_mes;
                }
                break;
        }
        ////////log_1.default.error("dias_trabalhados_mes", dias_trabalhados_mes);
        ////////log_1.default.error("horas_adicionais_noturnas", horas_adicionais_noturnas);
        //Essa condição n encontrei na planilha
        //horas_por_dia_trabalhadas == 24 ? horas_adicionais_noturnas = horas_adicionais_noturnas * 0.5: horas_adicionais_noturnas = horas_adicionais_noturnas
       //////// log_1.default.error("horas_por_dia_trabalhadas noturnas", horas_por_dia_trabalhadas);
        ////////log_1.default.error("horas_adicionais_noturnas após calculo", horas_adicionais_noturnas);
        // Utilizando as horas noturnas por mes calcular o preço de adicional noturno
        var valor_adicional_noturno = 0; // valor de horas noturnas 
        var premio_noturno = Number(CCTObj["custrecord_lrc_premio_noturno_cct"]);
        ////////log_1.default.error("premio", premio_noturno);
        var add_noturno_porcentagem = parseFloat(String(CCTObj["custrecord_lrc_add_noturno_cct"]));
        var base_horas_totais = 1;
        if (horas_adicionais_noturnas != 0) {
            ////////log_1.default.error("add_noturno_porcentagem", add_noturno_porcentagem);
            base_horas_totais = Number(CCTObj["custrecord_lrc_base_horas_trabalhadas"]);
           //////// log_1.default.error("base_horas_totais", base_horas_totais);
            valor_adicional_noturno += (salario / base_horas_totais) * ((add_noturno_porcentagem) / 100) * (horas_adicionais_noturnas) + premio_noturno;
            ////////log_1.default.error("valor_adicional_noturno dentro if", valor_adicional_noturno);
        }
        var redut_adicional_noturno;
        redut_adicional_noturno = (salario / base_horas_totais) * (add_noturno_porcentagem / 100) * 0.1428 * (horas_adicionais_noturnas); //redut. adicional noturno
        ////////log_1.default.error("redut_adicional_noturno", redut_adicional_noturno);
        valor_adicional_noturno += redut_adicional_noturno;
        ////////log_1.default.error("valor_adicional_noturno", valor_adicional_noturno);
        return {
            "set": {
                "custcol_lrc_add_noturno_so": valor_adicional_noturno ? valor_adicional_noturno : 0,
                "custcol_lrc_premio_noturno_so": premio_noturno,
                "custcol_lrc_numero_horas_noturnas": horas_noturnas
            }
        };
    }
    exports.calculateAdicionalNoturno = calculateAdicionalNoturno;
    function calculateRemuneracao(CCTObj, escalaObj, num_pessoas, piso_salarial, salario, adicional_noturno, valor_horas_extras, LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO) {
        var premio = parseFloat(String(CCTObj["custrecord_lrc_premio_cct"])) / 100 * piso_salarial;
        //////log_1.default.error("premio", premio);
        var gratificacao = parseFloat(String(CCTObj["custrecord_lrc_gratificacao_cct"])) / 100 * piso_salarial;
        //////log_1.default.error("gratificao", gratificacao);
        var insalubridade = parseFloat(String(CCTObj["custrecord_lrc_insalubridade_cct"])) / 100 * piso_salarial;
        //////log_1.default.error("insalubridade", insalubridade);
        var adicional_permanencia = parseFloat(String(CCTObj["custrecord_lrc_adicional_permanencia_cct"])) / 100 * piso_salarial;
        //////log_1.default.error("adicional_permanencia", adicional_permanencia);
        var dia_vigilante = Number(CCTObj["custrecord_lrc_dia_vigilante_cct"]);
        //////log_1.default.error("dia_vigilante", dia_vigilante);
        var DSR_porc = parseFloat(String(escalaObj["custrecord_rsc_dsr_porc"])) / 100;
        //////log_1.default.error("DSR %", DSR_porc);
        var DSR = DSR_porc * (valor_horas_extras);
        //////log_1.default.error("DSR", DSR);
        //////log_1.default.error("horas extras", valor_horas_extras);
        var salario_parcial_periculosidade = piso_salarial * num_pessoas + valor_horas_extras + adicional_noturno + DSR + gratificacao + premio + insalubridade;
        //////log_1.default.error("salario_parcial_periculosidade", salario_parcial_periculosidade);
        var periculosidade = (parseFloat(String(CCTObj["custrecord_lrc_periculosidade_cct"])) / 100) * salario_parcial_periculosidade;
       ////// log_1.default.error("periculosidade", periculosidade);
        // Cálculo de exceções de Remuneração
        var valor_excecao = 0;
        var valor_base_excecao = 0;
        var porcentagem_piso_salarial = 0;
        var porcentagem_salario = 0;
        var descricao_excecoes = "";
        CCTObj["excecoes"].forEach(function (excecao) {
            if (excecao.tipo_excecao == LRC_TIPO_EXCECAO["remuneracao"]) { // PARAMETRO TIPO_DE_EXCECAO = REMUNERACAO
                descricao_excecoes += excecao.descricao += ": ";
                if (excecao.tipo_acrescimo && excecao.acrescimo) {
                    descricao_excecoes += "+";
                    switch (excecao.tipo_acrescimo) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                            valor_base_excecao += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do piso salarial = " + piso_salarial * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do salário = " + salario * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                            porcentagem_valor += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do valor = " + valor_excecao * (excecao.acrescimo / 100) + "\n";
                            break;
                    }
                }
                if (excecao.tipo_desconto && excecao.desconto) {
                    descricao_excecoes += "-";
                    switch (excecao.tipo_desconto) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // porcentagem do valor base
                            valor_base_excecao -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do piso salarial = -" + piso_salarial * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do salário = -" + salario * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                            porcentagem_valor -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do valor = - " + valor_excecao * (excecao.desconto / 100) + "\n";
                            break;
                    }
                }
                descricao_excecoes += "\n";
            }
        });
        //////log_1.default.error("descricao_excecoes", descricao_excecoes);
        //////log_1.default.error("valor_base_excecao", valor_base_excecao);
        //////log_1.default.error("porcentagem_piso_salarial", porcentagem_piso_salarial);
        //////log_1.default.error("porcentagem_salario", porcentagem_salario);
        valor_excecao += valor_base_excecao;
        valor_excecao += piso_salarial * (porcentagem_piso_salarial / 100);
        valor_excecao += salario * (porcentagem_salario / 100);
       ////// log_1.default.error("valor_excecao", valor_excecao);
        var custo_salario = piso_salarial * num_pessoas + premio + gratificacao + periculosidade + insalubridade + valor_horas_extras;
        custo_salario += adicional_noturno + dia_vigilante + adicional_permanencia + valor_excecao + DSR; // - total_descontos + encargos + plr ;
       ////// log_1.default.error("custo_salario", custo_salario);
        var encargos = parseFloat(String(CCTObj["custrecord_lrc_encargos_cct"])) / 100 * custo_salario;
        //////log_1.default.error("encargos", encargos);
        // let reserva_tec = (custo_salario + encargos) * reserva_tec_porc
        // Log.error("reserva_tec", reserva_tec);
        var remuneracao = custo_salario + encargos; // + reserva_tec
       ////// log_1.default.error("remuneracao", remuneracao);
        return {
            "set": {
                "custcol_lrc_gratificacao_so": gratificacao,
                "custcol_lrc_periculosidade_so": periculosidade,
                "custcol_lrc_total_encargos_so": encargos,
                "custcol_lrc_insalubridade_so": insalubridade,
                "custcol_lrc_premio_so": premio,
                "custcol_lrc_add_permanencia_so": adicional_permanencia,
                "custcol_lrc_dia_vigilante_so": dia_vigilante,
                "custcol_lrc_outros_remu_so": valor_excecao,
                "custcol_lrc_doutros_remu_so": descricao_excecoes,
                "custcol_lrc_remuneracao_so": remuneracao
            }
        };
    }
    exports.calculateRemuneracao = calculateRemuneracao;
    function calculateBeneficios(CCTObj, dias_trabalhados_mes, num_pessoas, piso_salarial, salario, vale_transporte_regiao, adicional_vale_transporte, adicional_cesta_basica, alimentacao_cliente, horario_de_almoco, adicional_beneficio, adicional_vale_refeicao, LRC_TIPO_EXCECAO, LRC_TIPO_DESCONTO) {
        var valor_cesta_basica = Number(CCTObj["custrecord_lrc_cesta_basica_cct"]) * num_pessoas;
        if (CCTObj["custrecord_lrc_check_cbasica_ferias_cct"])
            valor_cesta_basica += 1 / 12 * valor_cesta_basica;
       // log_1.default.error("valor_cesta_basica", valor_cesta_basica);
        var valor_vale_alimentacao_total = ((!horario_de_almoco) || (alimentacao_cliente && !adicional_vale_refeicao)) ? 0 : Number(CCTObj["custrecord_lrc_vale_alimentacao_dia_cct"]) * dias_trabalhados_mes * num_pessoas;
       // log_1.default.error("1valor_vale_alimentacao_total", valor_vale_alimentacao_total);
       // log_1.default.error("1horario de almoço", horario_de_almoco);
       // log_1.default.error("1alimentacao_cliente", alimentacao_cliente);
       // log_1.default.error("1adicional_vale_refeicao", adicional_vale_refeicao);
        var valor_assistencia_odonto = Number(CCTObj["custrecord_lrc_ass_odontologica_cct"]) * num_pessoas;
       //log_1.default.error("valor_assistencia_odonto", valor_assistencia_odonto);
        var valor_assistencia_medica = Number(CCTObj["custrecord_lrc_valor_assist_med"]) * num_pessoas;
        if (CCTObj["custrecord_lrc_ass_medica_ferias_ccl"])
            valor_assistencia_medica += 1 / 12 * valor_assistencia_medica;
       // log_1.default.error("valor_assistencia_medica", valor_assistencia_medica);
        var fundo_formacao = Number(CCTObj["custrecord_lrc_fundo_formacao_cct"]) * num_pessoas;
        //log_1.default.error("fundo_formacao", fundo_formacao);
        var contribuicao_sindical = Number(CCTObj["custrecord_lrc_contri_sindical_cct"]) * num_pessoas;
       // log_1.default.error("contribuicao_sindical", contribuicao_sindical);
        var seguro_vida = Number(CCTObj["custrecord_lrc_seguro_vida_cct"]) * num_pessoas;
       // log_1.default.error("seguro_vida", seguro_vida);
        var salario_familia = Number(CCTObj["custrecord_lrc_salario_familia_cct"]) * num_pessoas;
       // log_1.default.error("salario_familia", salario_familia);
        var assistencia_social_familiar = Number(CCTObj["custrecord_lrc_ass_social_familiar_cct"]) * num_pessoas;
       // log_1.default.error("assistencia_social_familiar", assistencia_social_familiar);
        var contribuicao_social = Number(CCTObj["custrecord_lrc_contri_social_cct"]) * num_pessoas;
       // log_1.default.error("contribuicao_social", contribuicao_social);
        var equipamentos = Number(CCTObj["custrecord_lrc_equipamentos_cct"]); //equipamentos do posto
       // log_1.default.error("equipamentos", equipamentos);
        var uniformes = Number(CCTObj["custrecord_rsc_uniformes"]) * num_pessoas; //uniforme do funcionário
       // log_1.default.error("uniformes", uniformes);
        var armamento = Number(CCTObj["custrecord_rsc_armamento"]) * num_pessoas; //armamento do funcionário
        //log_1.default.error("armamento", armamento);
        var valor_vale_transporte = vale_transporte_regiao * dias_trabalhados_mes * num_pessoas * 2; //ida e volta
        if (CCTObj["custrecord_lrc_vale_trans_ferias_cct"])
            valor_vale_transporte += 1 / 12 * valor_vale_transporte;
       //log_1.default.error("valor_vale_transporte regiao", vale_transporte_regiao);
       // log_1.default.error("valor_vale_transporte", valor_vale_transporte);
       // log_1.default.error("valor_vale_transporte dias", dias_trabalhados_mes);
       // log_1.default.error("valor_vale_transporte pessoas", num_pessoas);
        var plr = parseFloat(String(CCTObj["custrecord_lrc_plr_cct"])) / 100 * piso_salarial;
      //  log_1.default.error("plr", plr);
        // Cálculo de descontos (cesta básica + vale alimentacao + assistencia medica + assistencia odontologica + vale transporte)
        // Cada um desses descontos tem o campo "Base de desconto", que indica qual o tipo de desconto (Porcentagem do piso salarial, Porcentagem do salario ou Valor base)
        var total_descontos = 0;
        // Cesta basica
        var desconto_cesta_basica = Number(CCTObj["custrecord_lrc_desconto_cesta_basica_cct"]);
       // log_1.default.error("desconto_cesta_basica", desconto_cesta_basica);
        var base_desconto_cesta_basica = CCTObj["custrecord_lrc_bdesc_ccesta_basica_cct"];
        //log_1.default.error("base_desconto_cesta_basica", base_desconto_cesta_basica);
        var valor_desconto_cesta_basica;
        if (desconto_cesta_basica != 0) {
            switch (Number(base_desconto_cesta_basica)) {
                case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                   // log_1.default.error("valor_base_cesta", "sim");
                    valor_desconto_cesta_basica = desconto_cesta_basica;
                    total_descontos += valor_desconto_cesta_basica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                    //log_1.default.error("porcentagem_piso_salarial_cesta", "sim");
                    valor_desconto_cesta_basica = desconto_cesta_basica / 100 * piso_salarial;
                    total_descontos += valor_desconto_cesta_basica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_salario_cesta", "sim");
                    valor_desconto_cesta_basica = desconto_cesta_basica / 100 * salario;
                    total_descontos += valor_desconto_cesta_basica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                   // log_1.default.error("porcentagem_valor_cesta", "sim");
                    valor_desconto_cesta_basica = desconto_cesta_basica / 100 * valor_cesta_basica;
                    total_descontos += valor_desconto_cesta_basica;
                    break;
            }
        }
       // log_1.default.error("1valor_desconto_cesta_basica", valor_desconto_cesta_basica);
        // Vale alimentacao
        var desconto_vale_alimentacao = Number(CCTObj["custrecord_lrc_desc_vale_alimentacao_cct"]);
       // log_1.default.error("desconto_vale_alimentacao", desconto_vale_alimentacao);
        var base_desconto_vale_alimentacao = CCTObj["custrecord_lrc_bdesc_vale_alime_cct"];
      //  log_1.default.error("base_desconto_vale_alimentacao VT", base_desconto_vale_alimentacao);
       // log_1.default.error("adicional_vale_refeicao", adicional_vale_refeicao);
       // log_1.default.error("alimentacao_cliente", alimentacao_cliente);
        var valor_desconto_vale_alimentacao;
        if (desconto_vale_alimentacao != 0 && !(alimentacao_cliente && !adicional_vale_refeicao)) {
            switch (Number(base_desconto_vale_alimentacao)) {
                case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                   // log_1.default.error("valor_base_alimentacao", "sim");
                    valor_desconto_vale_alimentacao = desconto_vale_alimentacao;
                    total_descontos += valor_desconto_vale_alimentacao;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                  //  log_1.default.error("porcentagem_piso_salarial_alimentacao", "sim");
                    valor_desconto_vale_alimentacao = desconto_vale_alimentacao / 100 * piso_salarial;
                    total_descontos += valor_desconto_vale_alimentacao;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                  //  log_1.default.error("porcentagem_salario_alimentacao", "sim");
                    valor_desconto_vale_alimentacao = desconto_vale_alimentacao / 100 * salario;
                    total_descontos += valor_desconto_vale_alimentacao;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_valor_alimentacao", "sim");
                    valor_desconto_vale_alimentacao = desconto_vale_alimentacao / 100 * valor_vale_alimentacao_total;
                    total_descontos += valor_desconto_vale_alimentacao;
                    break;
            }
        }
       // log_1.default.error("1valor_desconto_vale_alimentacao", valor_desconto_vale_alimentacao);
        // Assistencia medica
        var desconto_assistencia_medica = Number(CCTObj["custrecord_lrc_desconto_ass_medica_ccl"]);
       // log_1.default.error("desconto_assistencia_medica", desconto_vale_alimentacao);
        var base_desconto_assistencia_medica = CCTObj["custrecord_lrc_bdesc_ass_medica_cct"];
       // log_1.default.error("base_desconto_assistencia_medica", base_desconto_assistencia_medica);
        var valor_desconto_assistencia_medica;
        if (desconto_assistencia_medica != 0) {
            switch (Number(base_desconto_assistencia_medica)) {
                case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                   // log_1.default.error("valor_base_assistencia_medica", "sim");
                    valor_desconto_assistencia_medica = desconto_assistencia_medica;
                    total_descontos += valor_desconto_assistencia_medica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                   // log_1.default.error("porcentagem_piso_salarial_assistencia_medica", "sim");
                    valor_desconto_assistencia_medica = desconto_assistencia_medica / 100 * piso_salarial;
                    total_descontos += valor_desconto_assistencia_medica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_salario_assistencia_medica", "sim");
                    valor_desconto_assistencia_medica = desconto_assistencia_medica / 100 * salario;
                    total_descontos += valor_desconto_assistencia_medica;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_valor_medica", "sim");
                    valor_desconto_assistencia_medica = desconto_assistencia_medica / 100 * valor_assistencia_medica;
                    total_descontos += valor_desconto_assistencia_medica;
                    break;
            }
        }
        //log_1.default.error("1valor_desconto_assistencia_médica", valor_desconto_assistencia_medica);
        // Assistencia odontologica
        var desconto_assistencia_odonto = Number(CCTObj["custrecord_lrc_desc_ass_odontologica_cct"]);
       // log_1.default.error("desconto_assistencia_odonto", desconto_assistencia_odonto);
        var base_desconto_assistencia_odonto = CCTObj["custrecord_lrc_bdesc_ass_odonto_cct"];
       // log_1.default.error("base_desconto_assistencia_odonto", base_desconto_assistencia_odonto);
        var valor_desconto_assistencia_odonto;
        if (desconto_assistencia_odonto != 0) {
            switch (Number(base_desconto_assistencia_odonto)) {
                case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                   // log_1.default.error("valor_base_assistencia_odonto", "sim");
                    valor_desconto_assistencia_odonto = desconto_assistencia_odonto;
                    total_descontos += valor_desconto_assistencia_odonto;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                    //log_1.default.error("porcentagem_piso_salarial_assistencia_odonto", "sim");
                    valor_desconto_assistencia_odonto = desconto_assistencia_odonto / 100 * piso_salarial;
                    total_descontos += valor_desconto_assistencia_odonto;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_salario_assistencia_odonto", "sim");
                    valor_desconto_assistencia_odonto = desconto_assistencia_odonto / 100 * salario;
                    total_descontos += valor_desconto_assistencia_odonto;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do valor
                   // log_1.default.error("porcentagem_valor_odonto", "sim");
                    valor_desconto_assistencia_odonto = desconto_assistencia_odonto / 100 * valor_assistencia_odonto;
                    total_descontos += valor_desconto_assistencia_odonto;
                    break;
            }
        }
       // log_1.default.error("valor_desconto_assistencia_odonto", valor_desconto_assistencia_odonto);
        // Vale transporte
        var desconto_vale_transporte = Number(CCTObj["custrecord_lrc_desc_vale_transporte_cct"]);
        //log_1.default.error("desconto_vale_transporte", desconto_vale_transporte);
        var base_desconto_vale_transporte = CCTObj["custrecord_lrc_bdesc_vale_transporte_cct"];
        //log_1.default.error("base_desconto_vale_transporte", base_desconto_vale_transporte);
        var valor_desconto_vale_transporte;
        if (desconto_vale_transporte != 0) {
            switch (Number(base_desconto_vale_transporte)) {
                case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                   // log_1.default.error("valor_base_vale_transporte", "sim");
                    valor_desconto_vale_transporte = desconto_vale_transporte;
                    total_descontos += valor_desconto_vale_transporte;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                  //  log_1.default.error("porcentagem_piso_salarial_vale_trasnporte", "sim");
                    valor_desconto_vale_transporte = (desconto_vale_transporte / 100) * num_pessoas * piso_salarial;
                    total_descontos += valor_desconto_vale_transporte;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_salario_vale_transporte", "sim");
                    valor_desconto_vale_transporte = desconto_vale_transporte / 100 * num_pessoas * salario;
                    total_descontos += valor_desconto_vale_transporte;
                    break;
                case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                   // log_1.default.error("porcentagem_valor_transporte", "sim");
                    valor_desconto_vale_transporte = desconto_vale_transporte / 100 * num_pessoas * valor_vale_transporte;
                    total_descontos += valor_desconto_vale_transporte;
                    break;
            }
        }
       // log_1.default.error("porcentagem_valor_transporte", valor_desconto_vale_transporte);
       // log_1.default.error("total_descontos", total_descontos);
        // tabela de excecoes
        var valor_excecao = 0;
        var valor_base_excecao = 0;
        var porcentagem_piso_salarial = 0;
        var porcentagem_salario = 0;
        var descricao_excecoes = "";
        CCTObj["excecoes"].forEach(function (excecao) {
            if (excecao.tipo_excecao == LRC_TIPO_EXCECAO["beneficio"]) { // PARAMETRO TIPO_DE_EXCECAO = BENEFICIO
                descricao_excecoes += excecao.descricao += ": ";
                if (excecao.tipo_acrescimo && excecao.acrescimo) {
                    descricao_excecoes += "+";
                    switch (excecao.tipo_acrescimo) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // valor base
                            valor_base_excecao += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do piso salarial = " + piso_salarial * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do salário = " + salario * (excecao.acrescimo / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                            porcentagem_salario += excecao.acrescimo;
                            descricao_excecoes += excecao.acrescimo + "% do valor = " + valor_excecao * (excecao.acrescimo / 100) + "\n";
                            break;
                    }
                }
                if (excecao.tipo_desconto && excecao.desconto) {
                    descricao_excecoes += "-";
                    switch (excecao.tipo_desconto) {
                        case LRC_TIPO_DESCONTO["valor_base"]: // porcentagem do valor base
                            valor_base_excecao -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_piso_salarial"]: // porcentagem do piso salarial
                            porcentagem_piso_salarial -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do piso salarial = -" + piso_salarial * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_salario"]: // porcentagem do salario
                            porcentagem_salario -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do salário = -" + salario * (excecao.desconto / 100) + "\n";
                            break;
                        case LRC_TIPO_DESCONTO["porcentagem_valor"]: // porcentagem do salario
                            porcentagem_salario -= excecao.desconto;
                            descricao_excecoes += excecao.desconto + "% do valor = -" + valor_excecao * (excecao.desconto / 100) + "\n";
                            break;
                    }
                }
                descricao_excecoes += "\n";
            }
        });
       // log_1.default.error("descricao_excecoes", descricao_excecoes);
      //  log_1.default.error("valor_base_excecao", valor_base_excecao);
       // log_1.default.error("porcentagem_piso_salarial", porcentagem_piso_salarial);
       // log_1.default.error("porcentagem_salario", porcentagem_salario);
        valor_excecao += valor_base_excecao;
        valor_excecao += piso_salarial * (porcentagem_piso_salarial / 100);
        valor_excecao += salario * (porcentagem_salario / 100);
      //  log_1.default.error("valor_excecao", valor_excecao);
        var beneficios = valor_cesta_basica + adicional_cesta_basica + valor_vale_alimentacao_total + adicional_vale_refeicao + valor_assistencia_medica + valor_assistencia_odonto;
        beneficios += valor_vale_transporte + adicional_vale_transporte + fundo_formacao + contribuicao_sindical + assistencia_social_familiar;
        beneficios += salario_familia + contribuicao_social + seguro_vida + valor_excecao + adicional_beneficio + uniformes + armamento - total_descontos;
      //  log_1.default.error("beneficios", beneficios);
        return {
            "set": {
                "custcol_lrc_cesta_basica_so": valor_cesta_basica,
                "custcol_lrc_vale_alimentacao_so": valor_vale_alimentacao_total,
                "custcol_lrc_ass_odontologica_so": valor_assistencia_odonto,
                "custcol_lrc_ass_medica_so": valor_assistencia_medica,
                "custcol_lrc_fundo_formacao_so": fundo_formacao,
                "custcol_lrc_contri_sindical_so": contribuicao_sindical,
                "custcol_lrc_seguro_vida_so": seguro_vida,
                "custcol_lrc_salario_familia_so": salario_familia,
                "custcol_lrc_ass_social_familiar_so": assistencia_social_familiar,
                "custcol_lrc_contri_social_so": contribuicao_social,
                "custcol_lrc_vale_transporte_so": valor_vale_transporte,
                "custcol_lrc_outros_benef_so": valor_excecao,
                "custcol_lrc_desc_outros_benef_so": descricao_excecoes,
                "custcol_lrc_beneficios_so": beneficios,
                "custcol_lrc_plr_so": plr,
                "custcol_lrc_total_descontos_so": total_descontos,
            }
        };
    }
    exports.calculateBeneficios = calculateBeneficios;
    function calculateImpostos(item, regiao) {
        // impostos municipais
        var impostosMunicipaisSearchRange = search_1.default.create({
            type: "customrecord_lrc_impostos_municipais",
            filters: [
                ["custrecord_lrc_regiao_impmun", "is", regiao],
                "AND",
                ["custrecord_lrc_item_impostomun", "is", item]
            ],
            columns: ["custrecord_lrc_iss_impmun"]
        }).run().getRange({
            start: 0,
            end: 1
        });
        var impostos_municipais = 0;
        if (impostosMunicipaisSearchRange[0]) {
            var iss = impostosMunicipaisSearchRange[0].getValue("custrecord_lrc_iss_impmun") || 0;
            impostos_municipais += parseFloat(String(iss));
        }
       // log_1.default.error("impostos_municipais", impostos_municipais);
        // impostos federais
        var impostosFederaisSearchRange = search_1.default.create({
            type: "customrecord_lrc_impostos_federais",
            filters: [
                ["custrecord_lrc_item_impostofed", "is", item]
            ],
            columns: ["custrecord_lrc_irrf_impostofed", "custrecord_lrc_pis_impostofed", "custrecord_lrc_cofins_impostofed", "custrecord_lrc_csll_impostofed", "custrecord_rsc_lucro_bruto", "custrecord_rsc_tx_operacional"]
        }).run().getRange({
            start: 0,
            end: 1
        });
        var impostos_federais = 0;
        if (impostosFederaisSearchRange[0]) {
            var irrf = impostosFederaisSearchRange[0].getValue("custrecord_lrc_irrf_impostofed") || 0;
            var pis = impostosFederaisSearchRange[0].getValue("custrecord_lrc_pis_impostofed") || 0;
            var cofins = impostosFederaisSearchRange[0].getValue("custrecord_lrc_cofins_impostofed") || 0;
            var csll = impostosFederaisSearchRange[0].getValue("custrecord_lrc_csll_impostofed") || 0;
            impostos_federais += parseFloat(String(irrf)) + parseFloat(String(pis)) + parseFloat(String(cofins)) + parseFloat(String(csll));
        }
       // log_1.default.error("impostos_federais", impostos_federais);
        return impostos_federais + impostos_municipais;
    }
    exports.calculateImpostos = calculateImpostos;
    function calculateLineRate(CCTObj, remuneracao, beneficios, total_impostos, total_taxas, item) {
        var equipamentos_imposto = Number(CCTObj["custrecord_lrc_equipamentos_cct"]);
        // impostos federais
        var impostosFederaisSearch = search_1.default.create({
            type: "customrecord_lrc_impostos_federais",
            filters: [
                ["custrecord_lrc_item_impostofed", "is", item]
            ],
            columns: ["custrecord_lrc_irrf_impostofed", "custrecord_lrc_pis_impostofed", "custrecord_lrc_cofins_impostofed", "custrecord_lrc_csll_impostofed", "custrecord_rsc_lucro_bruto", "custrecord_rsc_tx_operacional"]
        }).run().getRange({
            start: 0,
            end: 1
        });
        var lucro_bruto_desc_porc = impostosFederaisSearch[0].getValue("custrecord_rsc_lucro_bruto") || 0;
        var tx_operacional_porc = impostosFederaisSearch[0].getValue("custrecord_rsc_tx_operacional") || 0;
        var taxa_adm = (remuneracao + beneficios + equipamentos_imposto) * tx_operacional_porc;
        var lucro_bruto_desc = (parseFloat(String(lucro_bruto_desc_porc)) / 100) * (remuneracao + beneficios + equipamentos_imposto + taxa_adm);
        var x = remuneracao + beneficios + equipamentos_imposto + taxa_adm;
        var valor_impostos = ((x - lucro_bruto_desc) / ((100 - total_impostos) / 100)) - (x - lucro_bruto_desc);
        var valor_impostos_lucro = valor_impostos - lucro_bruto_desc;
        var total = remuneracao + beneficios + valor_impostos_lucro + taxa_adm;
        log_1.default.error("vetorzin", impostosFederaisSearch);
        log_1.default.error("1lucro_bruto_desc", lucro_bruto_desc);
        log_1.default.error("1total", total);
        log_1.default.error("1remuneracao", remuneracao);
        log_1.default.error("1beneficios", beneficios);
        log_1.default.error("1lucro_bruto_desc_porc", lucro_bruto_desc_porc);
        log_1.default.error("1equipamentos_imposto", equipamentos_imposto);
        log_1.default.error("1valor_impostos", valor_impostos);
        log_1.default.error("1valor_impostos_lucro", valor_impostos_lucro);
        //x + (x * total_impostos)/(100 - total_impostos - total_taxas) + (x * total_taxas)/(100 - total_impostos - total_taxas)- lucro_bruto_desc)
        return total;
    }
    exports.calculateLineRate = calculateLineRate;
    function checkErrorsCCTLookup(CCTLookup, errors, line, LRC_TIPO_DESCONTO, LRC_TIPO_ADICIONAL_NOTURNO) {
        var hasErr = false;
        if (!CCTLookup["custrecord_lrc_base_horas_trabalhadas"] || !CCTLookup["custrecord_lrc_max_horas_cct"]) {
            errors.push({
                "name": "MISSING FIELD",
                "description": 'Os campos BASE DE HORAS TOTAIS TRABALHADAS e MÁXIMO DE HORAS SEMANASI no registro LRC @ CCT são necessários para o cálculo de horas extras.',
                "line": line
            });
            hasErr = true;
        }
        if (!CCTLookup["custrecord_lrc_add_noturno_def_cct"] || !CCTLookup["custrecord_lrc_add_noturno_def_cct"][0]) {
            errors.push({
                "name": "MISSING FIELD",
                "description": 'O campo ADICIONAL NOTURNOD DEFINIDO POR no registro LRC @ CCT é necessário para o cálculo de adicional noturno.',
                "line": line
            });
            hasErr = true;
        }
        if (CCTLookup["custrecord_lrc_desconto_cesta_basica_cct"]) {
            if (!CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"] || !CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"][0]) {
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'O campo Base do desconto da Cesta Básica no registro LRC @ CCT é necessário.',
                    "line": line
                });
                hasErr = true;
            }
            else {
                var base_desconto_cesta_basica = CCTLookup["custrecord_lrc_bdesc_ccesta_basica_cct"][0].value;
                if (base_desconto_cesta_basica != LRC_TIPO_DESCONTO["valor_base"] && base_desconto_cesta_basica != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && base_desconto_cesta_basica != LRC_TIPO_DESCONTO["porcentagem_salario"] && base_desconto_cesta_basica != LRC_TIPO_DESCONTO["porcentagem_valor"]) { // valor nao parametrizado
                    errors.push({
                        "name": "INVALID_VALUE",
                        "description": 'O valor do campo BASE DO DESCONTO DA CESTA BASICA no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                        "line": line
                    });
                    hasErr = true;
                }
            }
        }
        if (CCTLookup["custrecord_lrc_desc_vale_alimentacao_cct"]) {
            if (!CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"] || !CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"][0]) {
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'O campo Base do desconto Vale Alimentação no registro LRC @ CCT é necessário.',
                    "line": line
                });
                hasErr = true;
            }
            else {
                var base_desconto_vale_alimentacao = CCTLookup["custrecord_lrc_bdesc_vale_alime_cct"][0].value;
               // log_1.default.error("base_desconto_vale_alimentacao else", base_desconto_vale_alimentacao);
                if (base_desconto_vale_alimentacao != LRC_TIPO_DESCONTO["valor_base"] && base_desconto_vale_alimentacao != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && base_desconto_vale_alimentacao != LRC_TIPO_DESCONTO["porcentagem_salario"] && base_desconto_vale_alimentacao != LRC_TIPO_DESCONTO["porcentagem_valor"]) { // valor nao parametrizado
                    errors.push({
                        "name": "INVALID_VALUE",
                        "description": 'O valor do campo BASE DO DESCONTO VALE ALIMENTACAO no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                        "line": line
                    });
                    hasErr = true;
                }
            }
        }
        if (CCTLookup["custrecord_lrc_desconto_ass_medica_ccl"]) {
            if (!CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"] || !CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"][0]) {
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'O campo Base do desconto Assistência Médica no registro LRC @ CCT é necessário.',
                    "line": line
                });
                hasErr = true;
            }
            else {
                var base_desconto_assistencia_medica = CCTLookup["custrecord_lrc_bdesc_ass_medica_cct"][0].value;
                if (base_desconto_assistencia_medica != LRC_TIPO_DESCONTO["valor_base"] && base_desconto_assistencia_medica != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && base_desconto_assistencia_medica != LRC_TIPO_DESCONTO["porcentagem_salario"] && base_desconto_assistencia_medica != LRC_TIPO_DESCONTO["porcentagem_valor"]) { // valor nao parametrizado
                    errors.push({
                        "name": "INVALID_VALUE",
                        "description": 'O valor do campo BASE DO DESCONTO ASSISTENCIA MEDICA no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                        "line": line
                    });
                    hasErr = true;
                }
            }
        }
        if (CCTLookup["custrecord_lrc_desc_ass_odontologica_cct"]) {
            if (!CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"] || !CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"][0]) {
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'O campo Base do desconto Assistência Odontológica no registro LRC @ CCT é necessário.',
                    "line": line
                });
                hasErr = true;
            }
            else {
                var base_desconto_assistencia_odonto = CCTLookup["custrecord_lrc_bdesc_ass_odonto_cct"][0].value;
                if (base_desconto_assistencia_odonto != LRC_TIPO_DESCONTO["valor_base"] && base_desconto_assistencia_odonto != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && base_desconto_assistencia_odonto != LRC_TIPO_DESCONTO["porcentagem_salario"] && base_desconto_assistencia_odonto != LRC_TIPO_DESCONTO["porcentagem_valor"]) { // valor nao parametrizado
                    errors.push({
                        "name": "INVALID_VALUE",
                        "description": 'O valor do campo BASE DO DESCONTO ASSISTENCIA ODONTOLOGICA no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                        "line": line
                    });
                    hasErr = true;
                }
            }
        }
        if (CCTLookup["custrecord_lrc_desc_vale_transporte_cct"]) {
            if (!CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"] || !CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"][0]) {
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'O campo Base do desconto do Vale Transporte no registro LRC @ CCT é necessário.',
                    "line": line
                });
                hasErr = true;
            }
            else {
                var base_desconto_vale_transporte = CCTLookup["custrecord_lrc_bdesc_vale_transporte_cct"][0].value;
                if (base_desconto_vale_transporte != LRC_TIPO_DESCONTO["valor_base"] && base_desconto_vale_transporte != LRC_TIPO_DESCONTO["porcentagem_piso_salarial"] && base_desconto_vale_transporte != LRC_TIPO_DESCONTO["porcentagem_salario"] && base_desconto_vale_transporte != LRC_TIPO_DESCONTO["porcentagem_valor"]) { // valor nao parametrizado
                    errors.push({
                        "name": "INVALID_VALUE",
                        "description": 'O valor do campo BASE DO DESCONTO VALE TRANSPORTE no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                        "line": line
                    });
                    hasErr = true;
                }
            }
        }
        if (CCTLookup["custrecord_lrc_add_noturno_def_cct"] && CCTLookup["custrecord_lrc_add_noturno_def_cct"][0]) {
            var adicional_noturno_definido_por = CCTLookup["custrecord_lrc_add_noturno_def_cct"][0].value;
            if (adicional_noturno_definido_por != LRC_TIPO_ADICIONAL_NOTURNO["proporcional_hora"] && adicional_noturno_definido_por != LRC_TIPO_ADICIONAL_NOTURNO["salario_dia"]) { // valor nao parametrizado
                errors.push({
                    "name": "INVALID_VALUE",
                    "description": 'O valor do campo ADICIONAL NOTURNO DEFINIDO POR no registro LRC @ CCT não está parametrizado em custscript_lrc_travadeprecos_params_obj presente em Preferências Gerais na aba Personalizado.',
                    "line": line
                });
                hasErr = true;
            }
        }
        return hasErr;
    }
    exports.checkErrorsCCTLookup = checkErrorsCCTLookup;
});
