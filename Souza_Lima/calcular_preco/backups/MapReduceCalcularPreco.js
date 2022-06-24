/**
*@NApiVersion 2.x
*@NScriptType MapReduceScript
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/record", "N/log", "N/runtime"], function (require, exports, record_1, log_1, runtime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.map = exports.getInputData = void 0;
    record_1 = __importDefault(record_1);
    log_1 = __importDefault(log_1);
    runtime_1 = __importDefault(runtime_1);
    exports.getInputData = function (ctx) {
        var recordType = runtime_1.default.getCurrentScript().getParameter({ "name": "custscript_lrc_type" });
        var recordId = runtime_1.default.getCurrentScript().getParameter({ "name": "custscript_lrc_id" });
        log_1.default.error("input recordtype", recordType);
        log_1.default.error("input recordid", recordId);
        return [{
                "id": recordId,
                "type": recordType
            }];
    };
    exports.map = function (ctx) {
        // Parametros - type e id (podem ser estimativa ou pedido de vendas)
        var obj = JSON.parse(ctx.value);
        var recordId = obj.id;
        var recordType = obj.type;
        log_1.default.error("map type", recordType);
        log_1.default.error("map id", recordId);
        // Load
        var record = record_1.default.load({
            type: recordType.toString(),
            id: recordId.toString()
        });
        // Mostra pro usuario que o processo de calculo de preço está sendo executado
        record.setValue({
            fieldId: "custbody_lrc_calculando_preco_so",
            value: true
        });
        record.save();
        // Error array
        var errors = [];
        // Atravessa as linhas
        var lineCount = record.getLineCount({
            sublistId: "item",
        });
        for (var line = 0; line < lineCount; line++) {
            // Para a funcionalidade, é necessário que item, regiao, CCT e escala e horário de entrada estejam preenchidos
            log_1.default.error("line", line);
            var item = record.getSublistValue({
                sublistId: "item",
                fieldId: "item",
                line: line
            });
            log_1.default.error("item", item);
            var regiao = record.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_lrc_region_item",
                line: line
            });
            log_1.default.error("regiao", regiao);
            var CCT = record.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_lrc_ctt_so",
                line: line
            });
            log_1.default.error("CCT", CCT);
            var escala = record.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_lrc_escalas_so",
                line: line
            });
            log_1.default.error("escala", escala);
            var horario_de_entrada = record.getSublistValue({
                sublistId: "item",
                fieldId: "custcol_lrc_escalas_so",
                line: line
            });
            log_1.default.error("horario de entrada", horario_de_entrada);
            if (!item || !regiao || !CCT || !escala || !horario_de_entrada) {
                // falta campos importantes no calculo -> Erro
                errors.push({
                    "name": "MISSING FIELD",
                    "description": 'Falta algum dos seguinte campos para o cálculo de preço: Região, Item, CCT, Escalas, Horario de entrada',
                    "line": line
                });
                continue;
            }
            // TODO
        }
        // Escreve os erros no registro
        record.setValue({
            fieldId: "custbody_lrc_erro_calculando_preco_so",
            value: JSON.stringify(errors)
        });
        // Mostra pro usuario que o processo de calculo de preço terminou
        record.setValue({
            fieldId: "custbody_lrc_calculando_preco_so",
            value: false
        });
        // Salva o registro
        record.save();
    };
});
