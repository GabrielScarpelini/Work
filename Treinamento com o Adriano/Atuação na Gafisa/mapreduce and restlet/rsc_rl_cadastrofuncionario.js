/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@Author Gabriel DEV NetSuite (https://github.com/GabrielScarpelini)
 */
define(['N/record', 'N/log', 'N/search', 'N/task', 'N/runtime'], 
function(record, log, search, task, runtime) {

    function _post(ctx) {
        try{    
            
            
            var conteudo = ctx //// conteúdo do JSON, lembrando que o contexto puxa todo o JSON, por isso na linha 148 ele usou o ctx como chave
            log.debug('conteúdo do JSON', conteudo)

            var emp = record.create({
                    type: 'employee',
                    isDynamic: true
                })
                Object.keys(ctx).forEach(function(bodyField) {  // essa função seta os valores lendo como um dicionário, sendo o ctx como chave   
                    emp.setValue({
                        fieldId: bodyField,     //aqui ele pega o nome do campo para usar como id
                        value: ctx[bodyField]   // e aqui ele usa 
                    });
                });
                ctx['address'].forEach(function (address) { // aqui está fazendo um 'for para lista de endereço no JSON e pegando os valores por dicionario
                    const valuesToSet = {
                        'country': address['country'],
                        'zip': address['zip'],
                        'addr1': address['addr1'],
                        'custrecord_enl_numero': String(address['custrecord_enl_numero']),
                        'addr2': address['addr2'],
                        'addr3': address['addr3'],
                        'custrecord_enl_city': address['custrecord_enl_city'],
                        'custrecord_enl_uf': address['custrecord_enl_uf'],
                        'defaultbilling': address['defaultbilling'],
                        'defaultshipping': address['defaultshipping']
                    }
                    //log.audit('valuesToSet', valuesToSet); // aqui o print dos valores dessa 
                                   
                    emp.selectNewLine('addressbook') //abrindo a lista pelo JSON da sublista Endereço
            
                    var addressSubrecord = emp.getCurrentSublistSubrecord('addressbook', 'addressbookaddress');
                    // acima abrindo a sublista e acessando os valores ap´´os o record 'addressbookaddress'
            
                    emp.setCurrentSublistValue('addressbook', 'label', address['label']) // perguntar 
                    .setCurrentSublistValue('addressbook', 'defaultbilling', address['defaultbilling'] || false) // caso ess valor exista, será o valor dele, se não vai ser false
                    .setCurrentSublistValue('addressbook', 'defaultshipping', address['defaultshipping'] || false); // caso ess valor exista, será o valor dele, se não vai ser false
                    //setando os campos do popup 
                    
                    Object.keys(valuesToSet).forEach(function (field) // aqui usou a variável criada com os dados da sublista 'address' 
                    {addressSubrecord.setValue(field, valuesToSet[field])});    // o field é um campo dentro do obj criado, e o valuesToSet vai setar o valor do campo
                    emp.commitLine('addressbook')                               // commit no valor de cada linha dentro dessa sublista
                    //setando as informações da SUBlista. 
                })
                //emp.save({ignoreMandatoryFields: true})
            
           
        }catch(e){
            log.error('Error', e);
            return e;
        }
        
    }
    function _get(ctx){
        // var buscaEmp = search.create({
        //     type: 'employee',
        //     filters: [search.createFilter({
        //         name: 'datecreated',
        //         operator: search.Operator.BETWEEN,
        //         values: 'thisyear'
        //     })],
        //     columns: [
        //         search.createColumn({
        //         name: 'datecreated',
        //         label: 'Data de Criação'
        //         }),
        //         search.createColumn({
        //             name: 'entityid',
        //             label: 'Nome'
        //         }),
        //         search.createColumn({
        //             name: 'email',
        //             label: 'E-mail'
        //         }),
        //         search.createColumn({
        //             name: 'subsidiary',
        //             label: 'Subsidiária'
        //         }),
        //     ],
        //     title: 'BUSCA – Funcionários Gafisa 2',
        //     id: 'customsearch_rsc_func_gafisa_2'
        // })  
        // try{
        //     var buscaSalva = buscaEmp.save()
        //     //return buscaSalva 
        // }catch(e){
        //     log.error('Error', e)
        //     return e 
        // }
        
        // //exercicio 13 
        // var buscaQntEmp = search.load({
        //     id: buscaSalva,
        //     type: 'employee'
        // })
        // var qntFuncionario = []
        // buscaQntEmp.run().each(function(result){
        //     qntFuncionario.push(result)
        //     return true
        // })
        

        // //exercicio 15
        // var buscaRunsmart = search.load({
        //     id: buscaSalva,
        //     type: 'employee'
        // })
        // var lista = []
        // buscaRunsmart.run().each(function(result){
        //     lista.push({
        //         email: result.getValue('email')
        //     })
        //     return true
        // })
        // var emailRunsmart = []
        // for(var i = 0; i<lista.length; i++){
        //     if(lista[i].email.search(/runsmart/) != -1){
        //         log.debug('email com runsmart', lista[i].email)
        //         emailRunsmart.push(lista[i].email)
        //     }  
        // }
        
        // //exercicio 17
        // var buscaRunsmart = search.load({
        //     id: buscaSalva,
        //     type: 'employee'
        // })
        // var lista = []
        // buscaRunsmart.run().each(function(result){
        //     lista.push({
        //         email: result.getValue('email'),
        //         subsidiary: result.getValue('subsidiary')
        //     })
        //     return true
        // })
        // var subRunsmart = []
        // for(var i = 0; i<lista.length; i++){
        //     if(lista[i].email.search(/runsmart/) != -1 && lista[i].subsidiary == 2){
        //         log.debug('email com runsmart', lista[i].email)
        //         subRunsmart.push(lista[i].email)
        //     }  
        // }
        // var objretorno = {
        //     funcionariosCadastrados2022: qntFuncionario.length,
        //     EmpemalRunsmart: emailRunsmart.length,
        //     SubEmail: subRunsmart.length
        // }
        // search.delete({
        //     id: buscaSalva
        //})
        
        
        // var lista = []
        // var buscaRD = search.create({
        //     type: "expensereport",
        //     filters:
        //     [
        //         ["type","anyof","ExpRept"], 
        //         "AND", 
        //         ["systemnotes.context","anyof","MPR"], 
        //         "AND", 
        //         ["systemnotes.name","anyof","-4"]
        //     ],
        //     columns:
        //     [
        //          search.createColumn({name: "internalid", label: "ID interno"})
        //     ]
        // });
        // buscaRD.run().each(function(result){
        //     lista.push(result.getValue('internalid'))
        //     return true 
        // })
        log.debug('valor da lista', lista)
        // if(lista.length != 0){
            var enviaEmail = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_rsc_mp_relatorio_despesa',
                deploymentId: 'customdeployrsc_mp_imp_relatorio_despesa',
                params:     // esse cara é necessário para enviar os dados daqui para o map reduce
                {
                    custscript_rsc_funcionario: 342488
                }
            })
            var taskId = enviaEmail.submit()
            return {
                status: 'Sucesso',
                taskId: taskId
            }
        // }else{
        //     return{
        //         status: 'Error',
        //         message: 'Não foi encontrado nenhum relatório de despesa'
            //}
        //}
    }
    return {
        post: _post,
        get: _get
    }
});

