/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript 
 */
define(['N/currentRecord','N/search', 'N/ui/dialog'],
function(currentRecord, search, dialog){    //currentRecord: pega o ctx, search pesquisa, dialog faz a msg aparecer
    function pageInit(){}
    
    function checar(){
        var error = {
            title: 'Erro inesperado',
            message: 'Este cavalo já está em outra cocheira'
        }
        var accept = {
            title: 'Sucesso',
            message: 'Este cavalo pode ser colocado na cocheira'
        }
        var emptyField = {
            title: 'Ops',
            message: 'Campo cavalo está vazio '
        }
        var doubleHorse = {
            title: 'Cavalo cadastrado',
            message: 'Este cavalo já está cadastrado nessa cocheira'
        }
        // Mensagens para ser usada no dialog acima 
        var page = currentRecord.get() // pegando o ctx da pagina do UserEvent(outro script)
        var pageId = page.id // aqui está pegando o id interno da pagina  
        var cocheiraHorse = page.getValue('custrecord_id_cocheira_cavalo') // aqui está pegando o id interno do cavalo nesse campo 
        
        if(!cocheiraHorse){           // aqui fez uma verificação se o cavalo não está no campo
            dialog.alert(emptyField)  // a mensagem posta na tela 
        }
        var searchHorse = search.create({    // aqui está fazendo uma busca salva   
            type: 'customrecord_id_cocheira', // nesse tipo de registro 
            filters:[
                ['custrecord_id_cocheira_cavalo', 'IS', cocheiraHorse], // aqui está verificando se aquele campo tem o id inteno do cavalo
            ]
        }).run().({ // esse comando aqui está retornando uma lista com as incidências acima 
            start:0,
            end: 1       // aqui está criando uma lista pelo range de 0 a 1 , e cada incidência do filtro vai entrar aqui 
        })
        var sameHorse = search.lookupFields({   // aqui foi criado para resolver o problema do cavalo na mesma cocheira
            type:'customrecord_id_cocheira',    // correndo o registro da cocheira
            id: pageId ,                        // aqui está buscando o Id interno da cocheira                              
            columns: 'custrecord_id_cocheira_cavalo' // aqui está pegando o conteúdo desse campo em forma de lista, id/text 
        });
        
        var horse = sameHorse.custrecord_id_cocheira_cavalo[0].value // aqui está pegando o valor(id) da pg e atribuindo numa variável 

        if (cocheiraHorse = horse){ // aqui está verificnado se o id do cavalo é o mesmo id do campo do cavalo na pg
            dialog.alert(doubleHorse) // se for, executa essa msg
        }
        else if(searchHorse.length != 0){ // aqui verificando se tem algo na lista do search.create line 34
            dialog.alert(error) // se tiver restorna essa msg de erro 
        }else{
            dialog.alert(accept) // caso não tenha nada na tal lista, retorna essa mensagem 
        }
        console.log('Conteúdo do search.create: ',searchHorse) // print no f12 da pasta criada no search.create
    
}
    return{
        pageInit: pageInit,
        checar: checar
    }

})


/*
var searchSub = search.create({
    type: 'subsidiary',
    filters:[
        ['currency', 'IS', variavel],
    ]
}).run().({
    start:0,
    end: 1
})

searchLookup = search.lookupFields({
    type:'subsidiary',
    id: searchSub[0].id,
    columns: 
})


var soma = 0;
var searchSub = search.create({
    type: 'salesorder',
    filters:[
        ['approvalstatus', 'IS', 1],
    ],
    columns:['total']
}).run().each((result) => {
    soma += result.getValue('total');
    return true;
}
10 salesorder -> approvalstatus = 1

var array = [1,2,3,4,5,6,7,8,9,10];

for(var i=0; i<array.length;i++){
    result = array[i]
}
*/ 