/**
 *@NApiVersion 2.x
*@NScriptType ClientScript
*/

const cotationId = 107;

var id = '',
cotacao = '',
requisicao = '',
valuesToSet,
cotacaoId = '',
cotacaoLine = ''

define(['N/record', 'N/url', 'N/ui/dialog', 'N/search', 'N/currentRecord', 'N/https', 'N/log'], function (record, url, dialog, search, currentRecord, https, log) {
function pageInit(context) {
    log.debug('pageInit', context);
}

function criar_cotacao() {
    var currRecord = currentRecord.get();
    var lotes_compra;

    try {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has('id')) {
            id = urlParams.get('id');

            if (search.create({
                type: "customrecord_rsc_lotes_compra",
                filters: [
                        ["custrecord_rsc_lotes_compra_transorigem", "anyof", id]
                ],
                columns: [
                        search.createColumn({ name: "custrecord_rsc_lotes_compra_status", label: "STATUS" })
                ]
            }).runPaged().count) {
                dialog.alert({
                    title: 'Alert',
                    message: 'Aguarde a cotação ser criada'
                });

                window.location.reload();
                return;
            }

            lotes_compra = record.create({type: 'customrecord_rsc_lotes_compra', isDynamic: true});

            valuesToSet = {
                custrecord_rsc_lotes_compra_tipo: cotationId,
                custrecord_rsc_lotes_compra_transorigem: id,
                custrecord_rsc_lotes_compra_inicio: new Date(),
                custrecord_rsc_lotes_compra_status: 1
            }

            Object.keys(valuesToSet).forEach(function (field) {
                lotes_compra.setValue({ fieldId: field, value: valuesToSet[field] })
            });

            var id_lotes_compra = lotes_compra.save();

            record.submitFields({
                type: 'purchaserequisition',
                id: id,
                values: {
                    'custbody_rsc_transacao_criada': true,
                    'custbody_rsc_cotation_create': true
                }
            });

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_rsc_sl_params',
                deploymentId: 'customdeploy_rsc_sl_params'
            });

            var response = https.post({
                url: suiteletURL,
                body: JSON.stringify({
                    id_lotes_compra: id_lotes_compra,
                    currRecord: currRecord,
                    valuesToSet: valuesToSet
                })
            }); 
            log.debug({id_lotes_compra: id_lotes_compra}, {response: response});     

            window.location.reload();

            var searchURL = url.resolveTaskLink({ id: 'LIST_SEARCHRESULTS', params: { "searchid": 'customsearch_rsc_lotes_compra' } })
            window.open(searchURL, '_blank')
        }
    } catch (error) {
        log.error('error', error)
    }
}

return {
    pageInit: pageInit,
    criar_cotacao: criar_cotacao
}
});
