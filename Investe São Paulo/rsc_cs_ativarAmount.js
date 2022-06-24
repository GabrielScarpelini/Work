/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript   
*/
define(['N/currentRecord', 'N/log'], (currentRecord, log) => {
    const lineInit = (context) => {
        try {
            var rec = context.currentRecord;
            var itemCount = rec.getLineCount('item'); // essa função conta as linhas do item
            var sublistName = context.sublistId;
            var line = rec.getCurrentSublistIndex({ sublistId: sublistName }); // pega a linha selecionada  
            if (itemCount > line) {
                var rate = rec.getSublistField({
                    sublistId: sublistName,
                    fieldId: 'rate',
                    line: line
                });
                rate.isDisabled = false;
    
                var amount = rec.getSublistField({
                    sublistId: sublistName,
                    fieldId: 'amount',
                    line: line
                });
                amount.isDisabled = false;
            }
            
        } catch (e) {
            log.error('erro lineInit', e);
        }
    }
    
    const pageInit = (context) => {}
    
    const postSourcing = (context) => {}
    
    const saveRecord = (context) => {}
    
    const sublistChanged = (context) => {}
    
    const validateDelete = (context) => {}
    
    const validateField = (context) => {}
    
    const validateInsert = (context) => {}
    
    const validateLine = (context) => {}
    
    const fieldChanged = (context) => {}
    
    return {
        lineInit: lineInit,
        // pageInit: pageInit,
        // postSourcing : postSourcing,
        // saveRecord : saveRecord,
        // sublistChanged : sublistChanged,
        // validateDelete : validateDelete,
        // validateField : validateField,
        // validateInsert : validateInsert,
        // validateLine : validateLine,
        // fieldChanged : fieldChanged
    }
    });
    