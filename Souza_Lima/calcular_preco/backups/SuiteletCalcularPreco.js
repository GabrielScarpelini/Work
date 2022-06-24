/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *
 * SuiteletCalcularPreco.ts
 * Responsavel por recuperar os valores de config via client script
 * N/config so funciona em server-side
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/log", "N/config"], function (require, exports, log_1, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    log_1 = __importDefault(log_1);
    config_1 = __importDefault(config_1);
    exports.onRequest = function (ctx) {
        if (ctx.request.method == "GET") {
            var companyInformationRec = config_1.default.load({
                type: config_1.default.Type.COMPANY_INFORMATION
            });
            var obj = {
                "inicio_periodo_noturno": companyInformationRec.getText("custrecord_lrc_inicio_periodo_noturno"),
                "fim_periodo_noturno": companyInformationRec.getText("custrecord_lrc_fim_periodo_noturno"),
                "total_taxas": parseFloat(String(companyInformationRec.getValue("custrecord_lrc_total_taxas"))),
                "subsidiaria_taxa_operacional": parseFloat(String(companyInformationRec.getValue("custrecord_lrc_taxa_operacional"))),
                "subsidiaria_reserva_tecnica": parseFloat(String(companyInformationRec.getValue("custrecord_lrc_reserva_tecnica"))),
                "subsidiaria_lucro": parseFloat(String(companyInformationRec.getValue("custrecord_lrc_lucro")))
            };
            log_1.default.error("obj", obj);
            ctx.response.write({ output: JSON.stringify(obj) });
        }
        else {
            ctx.response.write({ output: "Metodo invalido" });
        }
    };
});
