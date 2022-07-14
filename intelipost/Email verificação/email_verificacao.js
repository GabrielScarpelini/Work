/**
*@NApiVersion 2.x
*@NScriptType MapReduceScript
*
* email_verificação.ts
*
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/search", "N/email", "N/log"], function (require, exports, search_1, email_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.enviarEmail = exports.map = exports.getInputData = void 0;
    search_1 = __importDefault(search_1);
    email_1 = __importDefault(email_1);
    log_1 = __importDefault(log_1);
    var getInputData = function () {
        return search_1.default.create({
            type: "partner",
            //filters: [['email', 'ISNOT', ''], 'AND', ['custentity_lrc_email_verificacao', 'ISNOT', "true"], 'AND', ['isinactive', 'ISNOT', "true"]],
          	filters: [['email', 'ISNOT', ''], 'AND', ['custentity_ip_par_categoria', 'IS', 8], 'AND', ['isinactive', 'IS', 'F']],
            columns: ['email']
        });
    };
    exports.getInputData = getInputData;
    var map = function (ctx) {
        try {
            log_1.default.error("String:", ctx.value);
            var req = JSON.parse(ctx.value);
            log_1.default.error("objeto:", req);
            log_1.default.error("id objeto3:", req.id);
            var idMarketplace = req.id;
            log_1.default.error("id:", idMarketplace);
            var sendEmail = req.values['email'];
            log_1.default.error("sendEmail:", sendEmail);
            var titulo = '[Intelipost] Verificação de status do lojista';
            var mensagem = 'Olá, \n\n';
            mensagem += 'Estamos enviando esse e-mail para verificação de ativação do lojista! ';
            mensagem += '\n\nSe esse lojista não estiver mais ativado com a intelipost preencha o formulário de cancelamento no link abaixo:';
            mensagem += '\nhttps://4481651.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=2261&deploy=1&compid=4481651&h=3b9ff23928417347fae9&custevent_ip_mkp_marketplace=' + idMarketplace;
            mensagem += '\n\nCaso não tenha interesse de realizar o cancelamento, pode desconsiderar esse e-mail.';
            mensagem += '\n\n Atenciosamente,';
            mensagem += '\n Equipe intelipost.';
            (0, exports.enviarEmail)(sendEmail, titulo, mensagem);
        }
        catch (error) {
            log_1.default.error("error:", error);
        }
    };
    exports.map = map;

    var summarize = function(summary) {
            var type = summary.toString();
            log_1.default.error(type, 
                '"Uso Consumido:" '+summary.usage+
                ', "Número de Filas:" '+summary.concurrency+
                ', "Quantidade de Saídas:" '+summary.yields
            );
            var contents = '';
            summary.output.iterator().each(function (key, value) {
                contents += (key + ' ' + value + '\n');
                return true;
            });
    }
    exports.summarize = summarize
    var enviarEmail = function (sendEmail, titulo, mensagem) {
        log_1.default.error("Emails:", sendEmail);
        log_1.default.error("titulo:", titulo);
        log_1.default.error("mensagem:", mensagem);
        var senderId = 239880;
        //const senderId = RunTime.getCurrentScript().getParameter({ name: 'custscript_lrc_id_remetente' }) ? Number(RunTime.getCurrentScript().getParameter({ name: 'custscript_lrc_id_remetente' })) : 1831804;;
        log_1.default.error("senderId:", senderId);
        //id do autor do envio de email
        try {
            email_1.default.send({
                author: senderId,
                //recipients: [sendEmail],
              	recipients: ['joao.silva@runsmart.cloud'],
                subject: titulo,
                body: mensagem
            });
            log_1.default.error("Email:", "Enviado");
        }
        catch (error) {
            log_1.default.error("(error sendEmail)", error);
        }
        log_1.default.error("teste:", "teste");
    };
    exports.enviarEmail = enviarEmail;
});
