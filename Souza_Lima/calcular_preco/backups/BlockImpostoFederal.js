/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *
 *  BlockImpostoFederal.ts
 *
 *  Esse script é responsável por checar se já existe um registro imposto federal para um determinado item.
 *  Caso já haja um registro com o item, a submissão do registro será impedida.
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
            var item = record.getValue("custrecord_lrc_item_impostofed");
            log_1.default.error("item", item);
            var federalTaxCount = 0;
            if (item) {
                if (ctx.type != ctx.UserEventType.CREATE) {
                    federalTaxCount = search_1.default.create({
                        type: "customrecord_lrc_impostos_federais",
                        filters: [
                            ["custrecord_lrc_item_impostofed", "IS", item],
                            "AND",
                            ["internalid", "NONEOF", record.id]
                        ]
                    }).runPaged().count;
                }
                else {
                    federalTaxCount = search_1.default.create({
                        type: "customrecord_lrc_impostos_federais",
                        filters: [
                            ["custrecord_lrc_item_impostofed", "IS", item],
                        ]
                    }).runPaged().count;
                }
            }
            log_1.default.error("count", federalTaxCount);
            if (item && federalTaxCount > 0)
                throw Error("O Item já está registrado em outro Imposto Federal");
        }
        return true;
    };
});
