/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/record', 'N/log', 'N/currentRecord', 'N/url'], function(record, log, currentRecord, url) {

    function pageInit(ctx) {
        
    }

    function criar(){
        var page = currentRecord.get()
        console.log('Page: ', page)
        // get de valores normais
        var nome = page.getValue('custpage_nome')
        var subsidiaria = page.getValue('custpage_subsidiaria')
        var email = page.getValue('custpage_email')
        var nomes = nome.split(' ')
        var func = record.create({
            type: 'employee',
            isDynamic: true
        })
        func.setValue('firstname', nomes[0])
        func.setValue('middlename', nomes[1])
        func.setValue('lastname', nomes[2])
        func.setValue('subsidiary', subsidiaria)
        func.setValue('email', email)

        // endereço
        for (var i = 0; i < page.getLineCount('custpage_sublist'); i++){
            // func.selectNewLine('custpage_sublist')
            var custpage_country = page.getSublistValue('custpage_sublist', 'custpage_country', i)
            console.log('custpage_country', custpage_country)
        }

        // func.setCurrentSublistValue('addressbook', '', ])
        // func.setCurrentSublistValue('addressbook', '', ])
        // func.setCurrentSublistValue('addressbook', '', ])
        // func.setCurrentSublistValue('addressbook', '', ])
        // func.setCurrentSublistValue('addressbook', '', ])



        var idFunc = func.save({ignoreMandatoryFields: true}) 
        
        var link = url.resolveRecord({
            recordType: 'employee',
            recordId: idFunc,
        })
        window.location.replace(link)
    }



    return {
        pageInit: pageInit,
        criar: criar
    }
});
