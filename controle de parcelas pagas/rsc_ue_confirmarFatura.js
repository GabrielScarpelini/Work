/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 *@Authors Rafael Oliveira & Gabriel Pavia
 */
define(['N/search', "N/record"], function(search, record) {

    function beforeLoad(ctx) {
        var page = ctx.newRecord;
        var pageId = page.id

        var chamabusca = buscaParcelaQuitacao(pageId)
        var chamaconfirmaFatura = confirmarFatura(chamabusca, pageId)


        function buscaParcelaQuitacao(pageId) {
            var lista = []
            var busca = search.create({
                type: "customrecord_sit_parcela_qui",
                filters: [
                    ["custrecord_sit_parcela_qui_t_efetivado", "IS", "S"],
                    "AND",
                    ["custrecord_sit_parcela_qui_l_parcela" , "IS", pageId]
                ],
                columns: ["internalId"],
                }).run().each(function(result){
                    lista.push(result.getValue("internalId"))
                    return true
                })
            log.debug('Conteúdo do retorno da busca (IDs):', lista)
            log.debug('Tamanho da lista', lista.length)
            
            return lista
        }

        function confirmarFatura(lista, registroAtualId){
            if (lista.length > 0) {
                var registro = record.load({
                    type: "customrecord_sit_parcela",
                    id: registroAtualId,
                    isDynamic: true
                })

                registro.setValue("custrecord_rsc_status_cobranca_regua", 14)
                registro.setValue("custrecord_rsc_descricao_da_fatura_parce", "Título quitado")

                var saved = registro.save({ignoreMandatoryFields: true})
            }
        }
    }



    return {
        beforeLoad: beforeLoad
    }
});
