/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *
 *  BlockImpostoMunicipal.ts
 *
 *  Esse script é responsável por checar se já existe um registro imposto federal para um determinado item e região.
 *  Caso já haja um registro com a combinação {Item, Regiao}, a submissão do registro será impedida.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/search", "N/log"], function (require, exports, search_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    search_1 = __importDefault(search_1);
    log_1 = __importDefault(log_1);
    exports.beforeSubmit = function (ctx) {
        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT || ctx.type == ctx.UserEventType.XEDIT) {
            var record = ctx.newRecord;
            log_1.default.error("id", record.id);
            var item = record.getValue("custrecord_lrc_item_impostomun");
            var regiao = record.getValue("custrecord_lrc_regiao_impmun");
            log_1.default.error("item", item);
            log_1.default.error("regiao", regiao);
            var cityTaxCount = 0;
            if (item && regiao) {
                if (ctx.type != ctx.UserEventType.CREATE) {
                    cityTaxCount = search_1.default.create({
                        type: "customrecord_lrc_impostos_municipais",
                        filters: [
                            ["custrecord_lrc_item_impostomun", "IS", item],
                            "AND",
                            ["custrecord_lrc_regiao_impmun", "IS", regiao],
                            "AND",
                            ["internalid", "NONEOF", record.id]
                        ]
                    }).runPaged().count;
                }
                else {
                    cityTaxCount = search_1.default.create({
                        type: "customrecord_lrc_impostos_municipais",
                        filters: [
                            ["custrecord_lrc_item_impostomun", "IS", item],
                            "AND",
                            ["custrecord_lrc_regiao_impmun", "IS", regiao]
                        ]
                    }).runPaged().count;
                }
            }
            log_1.default.error("count", cityTaxCount);
            if (item && regiao && cityTaxCount > 0)
                throw Error("A combinação de item e região já está registrada em outro Imposto Municipal");
        }
        return true;
    };
});
