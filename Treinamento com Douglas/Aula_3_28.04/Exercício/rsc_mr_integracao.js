/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record','N/log'], function(search, record, log) {
    
    var getInputData = function(){
        return search.create({
            type: 'customrecord_json_integracao_gs',
            filters:[
                ['custrecord_integracao_processado', 'IS', 2]
            ]
        })
    }
    var map = function(ctx){
        try{    
            var req = JSON.parse(ctx.value)             // aqui foi pego os dados para usar no map 
            
            //aque fazendo a função para pegar o arquivo JSON dentro do registro
            var integraLookup = search.lookupFields({
                type: 'customrecord_json_integracao_gs',
                id: req.id,
                columns: 'custrecord_processado_json'
            })
            // esse comando a baixo fez com que usassemos esse obj que retornou
            // no lookup e tranformou ele em JSON, para podermos usar com o nome da VAR toJSON
            var toJSON = JSON.parse(integraLookup.custrecord_processado_json)
            var nome = toJSON.name                //pegando o noma do obj dito acima
            var spaceIndex = nome.indexOf(' ', 1) // aqui usando o index of do espaço para pegar o sobrenome
            var lastName = nome.slice(spaceIndex) // pegou o sobrenome pois foi além do index do espaço
            var firstName = nome.slice(0,spaceIndex) // aqui pegou o primeiro nome pelo index 0 ao index do espaço
            
            // aqui pra baixo foi pegando os dados do Json que precisávamos
            var cargo = toJSON.title
            var phone = toJSON.phone
            var email = toJSON.email
            var subsdiary = toJSON.subsidiary
            var location = toJSON.location
            var department = toJSON.department

            // nesse trecho abaixo foi criado o parceiro com todos os dados que foram 
            // recolhidos acima
            
            var put = record.create({
                type: "partner",
                })
            put.setValue('isperson', "T")
            put.setValue('firstname', firstName)
            put.setValue('lastname', lastName)
            put.setValue('email', email)
            put.setValue('subsidiary', subsdiary)
            put.setValue('location', location)
            put.setValue('title', cargo)
            put.setValue('mobilephone', phone)
            put.setValue('department', department)
            var partId = put.save({ignoreMandatoryFields: true})  //IMPORTANTE, como pegar o ID do save 
            // para usar para pegar o ID do registro criado, para ser usado no setValue do registro Integração
            
            
            
            log.debug('id do partner', partId )
            log.debug('id inicial pra pesquisa: ',req.id )
            
            // nesse trecho abaixo estamos pegando a página para setar os valores 
            // de PROCESSADO e atribuir o PARCEIRO ao registro da integração

            var page = record.load({         
            type: 'customrecord_json_integracao_gs', // carregando o tipo de registro
            id: req.id   // o ID da página que estamos atualizando, que foi pego no começo pelo ctx.value 
            })
            log.debug(page)
            page.setValue('custrecord_integracao_processado', 1) // atribuiu o valor de PROCESSADO
            page.setValue('custrecord_processado_parceiro', partId) // atribuiu o valor do PARCEIRO da linha 57
            page.save({ignoreMandatoryFields: true})
            

        }catch(e){
            log.debug('Error', e)
        }    
    } 
    
    return{
        getInputData: getInputData,
        map: map
    }
})