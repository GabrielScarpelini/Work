/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/query', 'N/record'], function(log, query, record) {
    function afterSubmit(ctx) {
        var page = ctx.newRecord;
        var pageId = page.id
        if (pageId){
            var sql = "SELECT sum(foreignamountunpaid)" +  
                    "FROM transaction" +
                    " WHERE recordtype = 'invoice'" +
                    "AND custbody_lrc_fatura_principal = " + pageId + 
                    "AND foreignamountunpaid > 0"
        log.debug('Query:', sql)
        var consulta = query.runSuiteQL({
            query: sql
        });
        var sqlResults = consulta.asMappedResults(); 
        var resultadoQuery = sqlResults[0].expr1 //precisa colocar o .expr1 para conseguir acessar os dados internos a lista 
        log.debug('Resultado da query:', resultadoQuery)
        if (resultadoQuery){
            record.submitFields({
                type: 'salesorder',
                id: pageId,
                values: {
                    'custbody_rsc_sld_dvd_seguro_prestamist' : resultadoQuery
                }
            })
        }else{
            record.submitFields({
                type: 'salesorder',
                id: pageId,
                values: {
                    'custbody_rsc_sld_dvd_seguro_prestamist' : 0
                }
            })
        }
        }
    }
    return {
        afterSubmit: afterSubmit
    }
});
