/**
* @NScriptType ClientScript
* @NApiVersion 2.0
* 
*/
define([ 'N/ui/dialog', 'N/runtime', 'N/currentRecord', "N/log"],   // importa os módulos mesmo que só será usado o N/currentRecord


function( dialog, runtime, currentRecord, log )
{
    function pageInit(ctx){
        var currRecord = ctx.currentRecord;                        // variável que pega o contexto 
        console.log(currRecord.getValue('custpage_check_empresa')) // console.log aparece no F12   
        if(currRecord.getValue('custpage_check_empresa')){         // aqui está verificando se foi clicado no campo com esse ID
            currRecord.getField({                                  // nesse trecho ele está pegando o objeto com tal ID e está sen
                fieldId: 'custpage_nome'                           
            }).isVisible = false         // aqui está atribuindo o valor a um atributo do obj para que ele não apareça na pg 
            currRecord.getField({
                fieldId: 'custpage_nome_empresa'   
            }).isVisible = true         // aqui está fazendo o obj nome da empresa aparecer caso o check na line 14 sejá verdadeiro 
        }
        /* esse trecho ele vai fazer o else de: se o check box não estiver setado, o valor do nome fica aparente
        e o nome da empresa fica oculto */
        else{
            currRecord.getField({       
                fieldId: 'custpage_nome'
            }).isVisible = true
            currRecord.getField({
                fieldId: 'custpage_nome_empresa'
            }).isVisible = false
        }
    } 
    // essa função tem que ter o mesmo nome da linha 63 do suitelet para que seja reconhecido
    function salvar(){        
        var currRecord = currentRecord.get();    
        var nome = currRecord.getValue('custpage_nome');
        console.log(nome)
    }
    // nesse trecho abaixo ele faz a alteração caso o checkbox seja true ow false
    function fieldChanged(ctx){
        console.log('entrou');
        var fieldid = ctx.fieldId;   // pegou o campo do ID 
        var currRecord = ctx.currentRecord; // pegou o contexto da pagina
        console.log(fieldid)
        if(fieldid == 'custpage_check_empresa'){ // vendo se o campo clicado foi o check 
            var check = currRecord.getValue('custpage_check_empresa'); // criou a var para pegar o valor desse campo pelo ID
            console.log(check) // printou no devtools para saber se pegou o valor mesmo 
            if(check){ // caracterisca do js, pode colocar apenas if e a var se for true vai entrar else não vai entrar 
                currRecord.getField({         
                    fieldId: 'custpage_nome'
                }).isVisible = false
                currRecord.getField({
                    fieldId: 'custpage_nome_empresa'
                }).isVisible = true
            }else{
                currRecord.getField({
                    fieldId: 'custpage_nome'
                }).isVisible = true
                currRecord.getField({
                    fieldId: 'custpage_nome_empresa'
                }).isVisible = false
            }
        }
    }
    return {
        pageInit: pageInit,
        salvar: salvar,
        fieldChanged:fieldChanged
    }
});