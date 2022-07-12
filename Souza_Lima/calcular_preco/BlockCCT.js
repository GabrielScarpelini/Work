/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *
 *  BlockCCT.ts
 *
 *  Esse script é responsável por checar se já existe um registro CCT para um determinado item e região.
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
            var item = record.getValue("custrecord_lrc_item_cct");
            var regiao = record.getValue("custrecord_lrc_regiao_cct");
            log_1.default.error("item", item);
            log_1.default.error("regiao", regiao);
            var cctCount = 0;
            if (item && regiao) {
                if (ctx.type != ctx.UserEventType.CREATE) {
                    cctCount = search_1.default.create({
                        type: "customrecord_lrc_cct",
                        filters: [
                            ["custrecord_lrc_item_cct", "IS", item],
                            "AND",
                            ["custrecord_lrc_regiao_cct", "IS", regiao],
                            "AND",
                            ["internalid", "NONEOF", record.id]
                        ]
                    }).runPaged().count;
                }
                else {
                    cctCount = search_1.default.create({
                        type: "customrecord_lrc_cct",
                        filters: [
                            ["custrecord_lrc_item_cct", "IS", item],
                            "AND",
                            ["custrecord_lrc_regiao_cct", "IS", regiao],
                        ]
                    }).runPaged().count;
                }
            }
            log_1.default.error("count", cctCount);
            if (item && regiao && cctCount > 0)
                throw Error("A combinação de item e região já está registrada em outra tabela de CCT");
        }
        return true;
    };
});
