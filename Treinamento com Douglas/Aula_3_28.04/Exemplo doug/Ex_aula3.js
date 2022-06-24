/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
 define(['N/search', 'N/runtime', 'N/log',  'N/query', 'N/file', 'N/encode'],
    
 (search, runtime, log,  query, file, encode) => {
    var getInputData = function () { 
        return search.create({
            type:'cocheira',
            filters:[
                ["check", 'IS', 'F']
            ]
        })
    };

    var map = function (ctx) {
        var req = JSON.parse(ctx.value);
        var cocheiraLookupFields = search.lookupFields({
            type: 'cocheira',
            id: req.id,
            columns: [
                'cliente'
            ]
        })
        if(cocheiraLookupFields.cliente.length > 0){
            var salesOrder = record.create({
                type:'salesorder',
            })
            record.setValue({
                fieldId:'entity',
                value: cocheiraLookupFields.cliente[0].id
            })
            record.save({
                ignoreMandatoryFields: true
            })
        }
    };
    return {getInputData, map}
});
