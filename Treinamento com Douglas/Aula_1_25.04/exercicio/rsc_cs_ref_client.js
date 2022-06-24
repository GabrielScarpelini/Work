/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript 
 */

define(['N/currentRecord', 'N/record', 'N/search', 'N/url'],
function(currentRecord, record, search, url){
    function fieldChanged(ctx){                                
            var page = ctx.currentRecord; // pegando o contexto do suitelet
            var codeId = page.getValue('custpage_client_name')  
            console.log('Código cliente',codeId) // está verificando se pegou o Id no F12
            if (ctx.fieldId == 'custpage_client_name'){// verificando se clicou na parte cliente
            
            
                /* essa função abaixo é utilizada para procurar e retornar um valor dentro de listas
               no caso alí procurou dentro da lista customer, o ID, como é uma lista suspensa, cada cliente 
               já possui o seu, e após isso ele vai pegar o valor da subsidiária que está atrelado aquele id(cliente)  */
                var client = search.Fields({   
                type:'customer',  // aqui está pegando a lista do customer ID PEGO PELA EXTENSÃO FIELD EXPLORER DENDO DE QUALQUER CLIENTE
                id: codeId,   // aqui é o code que foi pego na linha 10
                columns:['subsidiary']  // pega na lista da subsidiária ID PEGO PELA EXTENSÃO FIELD EXPLORER DENDO DE QUALQUER SUBSIDIÁRIA
            });
            console.log('código retornado do searsh',client) // vendo se está pegando a lista da subsidíaria 
            var sub = client.subsidiary[0].value /* pegando o text da lista no índice 0 e atribuindo a uma variável
            a subsidária também é uma lista por isso acesse o indice 0 */
            console.log('Nome da subsídiária',sub)    // aqui verificando se pegou o nome correto no F12  
            page.setValue('custpage_ref_subsidiary',sub) // aqui está atribuindo o valor retirado na linha 19 
            var subisidiaria =  page.getValue('custpage_ref_subsidiary') 
            console.log('valor do campo subsidiária', subisidiaria )   // fazendo um log pra ver se setou o valor no campo 
            
        }
    }
    function enviar(){
        var page = currentRecord.get()  //pegando o contexto da pg pelo currentRecord usando o get 
        var cliente = page.getValue('custpage_client_name') // pegando os valores do campo usando a var page criada na linha acima
        var sub = page.getValue('custpage_ref_subsidiary')  //pegando os valores da pagina  
        var nome = page.getText('custpage_client_name')  //pegando o nome do cliente usando o getText 
        var data = new Date() // aqui foi pega a data atual pelo new date que retorna toda a hora e data atual
        
        // aqui abaixo estará criando o regitro no tipo de resgitro personalizado pelo ID dele passado abaixo
        var change = record.create({  // OBS ESSE MODELO SÓ SE APLICA PARA CUSTOM RECORDS
            type: 'customrecord_ref_cliente_gs',  // por esse id (em caso de cust record)
        
        });// PS DEPOIS DA REFERÊNCIA ACIMA PODE PUXAR OS CAMPOS DO CUSTOM RECORD REFERENTE A customrecord_ref_cliente_gs
           // ALI NO SETvALUE COMO FOI DESCRIO  

        console.log(cliente) //printando no F12 pra ver se da certo 
        console.log(sub)     //printando no F12     
        console.log(data)    //printando no F12   
        
        /*NESSE TRECHO foi usado o setValue e o ID dos campos do registro personalizado, então lá
        quando você cria os campos é criado o ID para cada, e esse ID foi usado*/
      
            
        change.setValue('name', nome) 
        change.setValue('custrecord_nome_ref_cliente', cliente)
        change.setValue('custrecord_sub_ref_cliente', sub)
        change.setValue('custrecord_data_ref_cliente_gs', data)
        var innerID = change.save()
        
        var link = url.resolveRecord({
            recordType: 'customrecord_ref_cliente_gs',
            recordId: innerID, 
        })
        window.location.replace(link)
    }
    return{
        fieldChanged: fieldChanged,
        enviar: enviar
    }
})
