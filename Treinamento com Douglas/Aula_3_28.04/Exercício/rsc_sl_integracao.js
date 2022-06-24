/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 * 
 * @Developer Gabriel Scarpelini
 */

// script usado para receber dados de uma API e ao mesmo tempo criar um registro
define(['N/log', 'N/record'], 
function(log, record) {
    function onRequest(ctx){
        var params = JSON.parse(ctx.request.body);  // aqui pegou os dados da API em formato JSON
        var obj = params.partners  // como era um array de preciamos usar a var params e o nome do array assim pra virar outra var 
        var objRetorno = {} // essas variáveis até a linha 16 servem para apontar erros ao usuário do JSON
        var erros = []
        var ordem = 0
        objRetorno.OK = true // fazendo um padrão pra sempre retornar true 
        
        if(obj){ // essa validação é para ver se o partners tem algo 

            for (var i in obj){    // foi feito um for para correr a lista e de JSon's 
                // daqui pra baixo está criando o tipo de registro que devemos usar no map reduce
                ordem++
                var nome = obj[i].name   // pegou o nome aqui  
                if(nome){ // para caso nome não exista esntra no else dele, se não executar normal
                    var put = record.create({
                        type: 'customrecord_json_integracao_gs'
                    }); // na linha abaixo foi passado de JSON pra String para ser armazenado 
                        // em uma caixa de texto e ser usado novamente

                    put.setValue('custrecord_processado_json', JSON.stringify(obj[i])) 
                    put.setValue('custrecord_integracao_processado', 2)
                    put.save({ignoreMandatoryFields: true})
                }else{
                    //esse é o esle para caso nome não seja encontrado, ps o ordem enumera em quais ocasiões ocorreu o erro
                    erros.push('o campo nome do partners '+ ordem + ' não está preenchido')
                    objRetorno.OK = false // isso setou o obj como false 
                }    
            }
            objRetorno.Erros = erros
            log.debug('objRetorno', objRetorno)
            ctx.response.write(JSON.stringify(objRetorno)) // o obj retorno aparecerá como str aqui 
        }else{
            erros.push('Partners não encontrado. . .') // da linha 19 aqui é onde vai acusar pra quem for subir o JSON
            objRetorno.Erros = erros // aqui estará atribuindo a lista de erros ao obj 
            obj.retorno.OK = false // setando o false para o partners(obj)
            ctx.response.write(JSON.stringify(objRetorno)) // retornando a msg para o cliente
            
        }    
    }
    return{
        onRequest: onRequest
    }
})

