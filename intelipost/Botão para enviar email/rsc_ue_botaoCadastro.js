/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@Authors Gabriel Scarpelini & Rafael Oliveira
 */
define([], function() {

    function beforeLoad(ctx) {
        var form = ctx.form         
        if(ctx.type == ctx.UserEventType.EDIT || ctx.type == ctx.UserEventType.VIEW){
            form.addButton({
                id:'custpage_cadastroCliente',
                label:'Enviar solicitação cadastro',
                functionName:'emailDisparo'
            })
            form.clientScriptModulePath = ("./rsc_cs_confirmarEmail.js");
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});
