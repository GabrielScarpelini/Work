/**
 * @copyright © 2022, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "N/log", "N/https", "N/record", "N/query", "N/search"], function (require, exports, log_1, https_1, record_1, query_1, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    log_1 = __importDefault(log_1);
    https_1 = __importDefault(https_1);
    record_1 = __importDefault(record_1);
    query_1 = __importDefault(query_1);
    function onRequest(ctx) {
        try {
            log_1.default.error('In', ctx.request.method);
            log_1.default.error('Teste:', "Entrou");
            if (ctx.request.method == 'GET') {
                var form = https_1.default.get({
                    url: "https://4481651-sb2.app.netsuite.com/core/media/media.nl?id=4720455&c=4481651_SB2&h=gzz3sLaIaFIQ1bOu3dFc7NGh61knjfseBN-duCeXSJxAFHxU&_xt=.html" // see the next snippet
                }), content = form.body;
                log_1.default.error('Teste:', "Entrou2");
                log_1.default.error('content', content);
                ctx.response.write(content);
            }
            else if (ctx.request.method == 'POST') {
                log_1.default.error('Teste:', "Entrou3");
                var params = ctx.request.parameters;
                var customerid = params.custpage_id;
                //if (!customerid) printError('Erro de id:', 'customerid');
                var razaoSocial = params.custpage_empresa_razao;
                // email inutil na hora de comparar na lista 
                var mkpID = params.custevent_ip_mkp_marketplace;
                var cnpj = params.custpage_empresa_cnpj;
                //let cnpjReplace = cnpj.replace(/\D/g, '');
                var cnpjReplace = cnpj;
                log_1.default.error("MkpID:", mkpID);
                //nLog.error("cnpj:", cnpjReplace);
                log_1.default.error("razaoSocial:", razaoSocial);
                log_1.default.error("valor do customer", customerid);
                log_1.default.error("cnpj", cnpj);
                if (cnpj) {
                    //SELECT c.Status,c.priority, c.id, cl.companyname,cl.custentity_psg_br_cnpj,c.company, c.custevent_ip_mkp_marketplace FROM  supportCase as c  INNER JOIN  Customer  as cl ON c.company = cl.id                        
                    // var sql = "SELECT p.companyname ,p.custentity_enl_cnpjcpf,c.title,c.Status,c.priority, c.id, c.casenumber,cl.companyname,cl.custentity_psg_br_cnpj,c.company,cl.custentity_psg_br_cnpj" +
                    //     " FROM supportCase as c INNER JOIN Customer as cl ON c.company = cl.id INNER JOIN Partner as p ON cl.partner = p.id WHERE cl.custentity_psg_br_cnpj = '" + cnpj + "' AND p.id =" + mkpID;
                    var listCasos = []
                    var busca = search.create({
                        type: "supportcase",
                        filters: [
                            ['custevent_psg_br_cnpj', 'IS', cnpj],
                                        'AND',
                            ['custevent_ip_mkp_marketplace', 'IS', mkpID]
                        ],
                        columns:
                        [
                            search.createColumn({name: "internalid", label: "ID interno"}),
                            search.createColumn({name: "company", label: "Nome"})
                        ]
                        }).run().each(function(result){
                            listCasos.push({
                                id: result.getValue('internalid'),
                                nome: result.getValue('name')
                            })
                            return true 
                        })
                    log_1.default.error("lista", listCasos);
    
                //     log_1.default.error("SQL DO CNPJ:", sql);
                //     var resultIterator2 = query_1.default.runSuiteQL({
                //         query: sql
                //     });
                //     var sqlresult2 = resultIterator2.asMappedResults();
                //     log_1.default.error("id do caso 2:", sqlresult2[0].id);
                //     log_1.default.error("id do cnpj 2:", sqlresult2[0].custentity_enl_cnpjcpf);
                //     log_1.default.error("id do nome 2:", sqlresult2[0].companyname);
                //     log_1.default.error("sqlresult caso:", sqlresult2);
                //     log_1.default.error("sqlresult - tamanho:", sqlresult2.length);
                //     log_1.default.error("entro no if 4", "entro no if 4");
                //     try {
                //         var i = void 0;
                //         for (i = 0; i < sqlresult2.length; i++) {
                //             var objetoUpdate = record_1.default.load({ id: sqlresult2[i].id, type: 'supportcase' });
                //             objetoUpdate.setValue({ fieldId: "status", value: "8" }); //value cancelado é 8
                //             objetoUpdate.setValue({ fieldId: "priority", value: "3" });
                //             objetoUpdate.save();
                //         }
                //         log_1.default.error("rodou:", i);
                //     }
                //     catch (error) {
                //         log_1.default.error("erro no for :", error);
                //         var form_1 = https_1.default.get({
                //             url: "https://4481651-sb2.app.netsuite.com/core/media/media.nl?id=4521770&c=4481651_SB2&h=K33G3lfeJ88vJGWEjDCmXQALfRfBRJN6qQvk1PTKqukHi4PR&_xt=.html"
                //         }), content2_1 = form_1.body;
                //         log_1.default.error('content:', content2_1);
                //         ctx.response.write(form_1.body);
                //     }
                //     log_1.default.error("entro no if 5", "entro no if 5");
                //     log_1.default.error("test:", "operação realizada com sucesso");
                //     var form = https_1.default.get({
                //         url: "https://4481651-sb2.app.netsuite.com/core/media/media.nl?id=1137642&c=4481651_SB2&h=JHVMscJEsb47bFnxGlQTzoBCYcAZKPUAYg2lxkmXvV-Y-_pH&_xt=.html"
                //     }), content2 = form.body;
                //     log_1.default.error('content:', content2);
                //     ctx.response.write(form.body);
                // }
                // else {
                //     log_1.default.error('else:', "else");
                //     var form = https_1.default.get({
                //         url: "https://4481651-sb2.app.netsuite.com/core/media/media.nl?id=4521770&c=4481651_SB2&h=K33G3lfeJ88vJGWEjDCmXQALfRfBRJN6qQvk1PTKqukHi4PR&_xt=.html"
                //     }), content2 = form.body;
                //     log_1.default.error('content:', content2);
                //     ctx.response.write(form.body);
                // log_1.default.error('params: ', params);
                }
            }
        }
        catch (e) {
            log_1.default.error('Erro1: ', e);
            var form = https_1.default.get({
                url: "https://4481651-sb2.app.netsuite.com/core/media/media.nl?id=4521770&c=4481651_SB2&h=K33G3lfeJ88vJGWEjDCmXQALfRfBRJN6qQvk1PTKqukHi4PR&_xt=.html"
            }), content2 = form.body;
            log_1.default.error('content:', content2);
            ctx.response.write(form.body);
        }
    }
    exports.onRequest = onRequest;
    ;
});
