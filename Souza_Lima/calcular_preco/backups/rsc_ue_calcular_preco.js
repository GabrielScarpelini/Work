/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *
 * userEventCalcularPreco.ts
 * beforeLoad que cria o botão de calcular preços nos formulários de estimativas e pedidos de venda
 * afterSubmit que chama o script de cálculo de preço
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/record", "N/runtime", "N/log"], function (require, exports, record_1, runtime_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.afterSubmit = void 0;
    record_1 = __importDefault(record_1);
    runtime_1 = __importDefault(runtime_1);
    log_1 = __importDefault(log_1);
    // import {check_errors_lrc_params} from './rsc_client_calcular_preco';
    // export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    // }
    exports.afterSubmit = function (ctx) {
        // type e id (podem ser estimativa ou pedido de vendas)
        var record = ctx.newRecord;
        var recordId = record.id;
        var recordType = record.type;
        log_1.default.error("type", recordType);
        log_1.default.error("id", recordId);
        // Load
        record = record_1.default.load({
            type: recordType.toString(),
            id: recordId.toString()
        });
        // Error array
        var errors = [];
        // Parametros de script, necessarios para referenciar valores. Se houver algum erro nesse parametro -> ERRO!
        var lrc_params_obj = JSON.parse(String(runtime_1.default.getCurrentScript().getParameter({ name: "custscript_rsc_param_trava_de_preco" })));
        log_1.default.error("lrc_params_obj", lrc_params_obj);
        // if (check_errors_lrc_params(errors, lrc_params_obj)){ // erro
        //     // Escreve os erros no registro
        //     record.setValue({
        //         fieldId: "custbody_lrc_erro_calculando_preco_so",
        //         value: JSON.stringify(errors)
        //     });
        //     // Salva o registro
        //     record.save(); 
        //     return true;
        // };
        var LRC_TIPO_EXCECAO = {
            "salario": Number(lrc_params_obj.lrc_tipo_excecao.salario),
            "remuneracao": Number(lrc_params_obj.lrc_tipo_excecao.remuneracao),
            "beneficio": Number(lrc_params_obj.lrc_tipo_excecao.beneficio)
        };
        log_1.default.error("LRC_TIPO_EXCECAO", LRC_TIPO_EXCECAO);
        var LRC_TIPO_DESCONTO = {
            "valor_base": Number(lrc_params_obj.lrc_tipo_desconto.valor_base),
            "porcentagem_piso_salarial": Number(lrc_params_obj.lrc_tipo_desconto.porcentagem_piso_salarial),
            "porcentagem_salario": Number(lrc_params_obj.lrc_tipo_desconto.porcentagem_salario)
        };
        log_1.default.error("LRC_TIPO_DESCONTO", LRC_TIPO_DESCONTO);
        var LRC_TIPO_ADICIONAL_NOTURNO = {
            "proporcional_hora": Number(lrc_params_obj.lrc_tipo_adicional_noturno.proporcional_hora),
            "salario_dia": Number(lrc_params_obj.lrc_tipo_adicional_noturno.salario_dia),
        };
        log_1.default.error("LRC_TIPO_DESCONTO", LRC_TIPO_ADICIONAL_NOTURNO);
    };
});
