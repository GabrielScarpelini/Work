/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/file', 'N/log', 'N/record'], function(file, log, record) {

    function execute(ctx) {
        var arquivo = file.load({
            id: 61
        });     
        
        arquivo.encoding = file.Encoding.UTF_8;        

        log.debug('arquivo', arquivo)
        var lista = []
        var linhas = arquivo.lines.iterator();
        
        linhas.each(function () {return false;});
        log.debug('linhas', linhas)

        linhas.each(function (line) {
            lista.push(line.value)
            return true
        })
        log.debug('lista', lista)

        for (i in lista){
        var registroLista = record.create({
            type: 'customlist_listatestecsv',
            isDynamic: true
        })
        registroLista.setValue('name', lista[i])
        registroLista.save({ignoreMandatoryFields: true})
        }
    }
    return {
        execute: execute
    }
});
