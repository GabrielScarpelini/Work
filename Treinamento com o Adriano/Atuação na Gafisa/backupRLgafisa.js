/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Author Gabriel DEV
 */
 define(['N/record', 'N/log', 'N/search' ], 
 function(record, log, search) {
 
     function _post(ctx) {
         try{    
             var email = ctx.email 
             log.debug('email coletado', email)
             var procuraEmail = search.create({
                 type: 'employee',
                 filters: ['email', 'IS', email]
             }).run().getRange({
                 start: 0,
                 end: 1
             })
             log.debug('valor da busca', procuraEmail)
             if(procuraEmail.length !=0){
                 return('Esse email já esta na base, o Id do registro é: ' + procuraEmail[0].id)
             }else{
                 var emp = record.create({
                     type: 'employee'
                 })
                 Object.keys(ctx).forEach(function(bodyField) {     
                     emp.setValue({
                         fieldId: bodyField, 
                         value: ctx[bodyField]
                     });
             
                 });
                 return emp.save({ignoreMandoryFields: true})
             }
         }catch(e){
             log.error('Error', e);
             return e;
         }
         
     }
     function _get(ctx){
         try{    
             log.debug('valor do ctx', ctx)
             var buscaEmp = search.create({
                 type: "employee",
                 filters: ["systemnotes.context","anyof","RST"],
                 columns:
                 [
                     "datecreated", "firstname", "email"
                 ]
             }).run().getRange(0, 1000)
             log.debug('valor da pesquisa', buscaEmp)
             
             var dadosEmp = []
             log.debug('valor do indice um', buscaEmp[0].value)
             
             if(buscaEmp.length > 0){
                 log.debug('entrei no if')
                 for(var i = 0; i<buscaEmp.length; i++){
                     dadosEmp.push({
                         datecreated: buscaEmp[i].getValue('datecreated'),
                         firstname: buscaEmp[i].getValue('firstname'),
                         email: buscaEmp[i].getValue('email')
                     })
                 }
             }
             log.debug('valor do dados Emp', dadosEmp)
             return dadosEmp.length > 0 ? dadosEmp : 'Não foi encontrado nenhum registro dessa data' 
 
         }catch(e){
         log.error('Error', e)
         return e
         }
     }
     return {
         post: _post,
         get: _get
     }
 });
 







 var buscaNome = search.create({
    type:'employee',
    filter: ['email', 'IS', email]
}).run().getRange({
    start: 0,
    end: 1 
})
log.debug('conteudo do buscaNome', buscaNome)
if(buscaNome.length !=0){
    log.debug('fodeu')
}else{
    log.debug('deu bom')
}




emp.selectNewLine({
    sublistId: 'addressbook'
})
emp.setCurrentSublistValue({
    sublistId: 'addressbook',
    fieldId: bodyField,
    value: ctx.address[bodyField],
});


var addressSubrecord = emp.getCurrentSublistSubrecord('addressbook', 'addressbookaddress');

Object.keys(ctx.address).forEach(function(bodyField) {     
    log.debug(bodyField, ctx.address[bodyField])
        emp.setCurrentSublistValue({
        sublistId: 'addressbook',
        fieldId: bodyField,
        value: ctx.address[bodyField],
    });                    
});
emp.commitLine({
    sublistId: 'addressbook'
})


/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Author Gabriel DEV NetSuite (https://github.com/GabrielScarpelini)
 */
 define(['N/record', 'N/log', 'N/search' ], 
 function(record, log, search) {
 
     function _post(ctx) {
         try{    
             var conteudo = ctx // conteúdo do JSON, lembrando que o contexto puxa todo o JSON, por isso na linha 148 ele usou o ctx como chave       
             log.debug('conteúdo do JSON', conteudo) 
 
             var emp = record.create({
                     type: 'employee',
                     isDynamic: true
                 })
                 Object.keys(ctx).forEach(function(bodyField) {  // essa função seta os valores lendo como um dicionário, sendo o ctx como chave   
                     emp.setValue({
                         fieldId: bodyField, 
                         value: ctx[bodyField]
                     });
                 
                 });
                 Object.keys(ctx.address).forEach(function(bodyField) {     
                     log.debug(bodyField, ctx.address[bodyField])
                     emp.selectNewLine({
                         sublistId: 'addressbook'
                     })
                     
                     emp.setCurrentSublistValue({
                         sublistId: 'addressbook',
                         fieldId: bodyField,
                         value: ctx.address[bodyField],
                     });
                     emp.commitLine({
                         sublistId: 'addressbook'
                     })
                     
                 });
                 return emp.save({ignoreMandatoryFields: true})
             
         }catch(e){
             log.error('Error', e);
             return e;
         }
         
     }
     function _get(ctx){
         var buscaEmp = search.create({
             type: 'employee',
             filters: [search.createFilter({
                 name: 'datecreated',
                 operator: search.Operator.BETWEEN,
                 values: 'thisyear'
             })],
             columns: [
                 search.createColumn({
                 name: 'datecreated',
                 label: 'Data de Criação'
                 }),
                 search.createColumn({
                     name: 'entityid',
                     label: 'Nome'
                 }),
                 search.createColumn({
                     name: 'email',
                     label: 'E-mail'
                 }),
                 search.createColumn({
                     name: 'subsidiary',
                     label: 'Subsidiária'
                 }),
             ],
             title: 'BUSCA – Funcionários Gafisa 2',
             id: 'customsearch_rsc_func_gafisa_2'
         })  
         try{
             var buscaSalva = buscaEmp.save()
             //return buscaSalva 
         }catch(e){
             log.error('Error', e)
             return e 
         }
         
         //exercicio 13 
         var buscaQntEmp = search.load({
             id: buscaSalva,
             type: 'employee'
         })
         var qntFuncionario = []
         buscaQntEmp.run().each(function(result){
             qntFuncionario.push(result)
             return true
         })
         
 
         //exercicio 15
         var buscaRunsmart = search.load({
             id: buscaSalva,
             type: 'employee'
         })
         var lista = []
         buscaRunsmart.run().each(function(result){
             lista.push({
                 email: result.getValue('email')
             })
             return true
         })
         var emailRunsmart = []
         for(var i = 0; i<lista.length; i++){
             if(lista[i].email.search(/runsmart/) != -1){
                 log.debug('email com runsmart', lista[i].email)
                 emailRunsmart.push(lista[i].email)
             }  
         }
         
         //exercicio 17
         var buscaRunsmart = search.load({
             id: buscaSalva,
             type: 'employee'
         })
         var lista = []
         buscaRunsmart.run().each(function(result){
             lista.push({
                 email: result.getValue('email'),
                 subsidiary: result.getValue('subsidiary')
             })
             return true
         })
         var subRunsmart = []
         for(var i = 0; i<lista.length; i++){
             if(lista[i].email.search(/runsmart/) != -1 && lista[i].subsidiary == 2){
                 log.debug('email com runsmart', lista[i].email)
                 subRunsmart.push(lista[i].email)
             }  
         }
         var objretorno = {
             funcionariosCadastrados2022: qntFuncionario.length,
             EmpemalRunsmart: emailRunsmart.length,
             SubEmail: subRunsmart.length
         }
         search.delete({
             id: buscaSalva
         })
         return objretorno
     }
 
 
     return {
         post: _post,
         get: _get
     }
 });