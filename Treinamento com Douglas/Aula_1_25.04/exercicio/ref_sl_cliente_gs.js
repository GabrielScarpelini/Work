/**
 * @NApiVersion 2.0
 * @NScriptType suitelet 
 */

define(['N/ui/serverWidget'],
function(ui)
{
    function onRequest(ctx){

        var form = ui.createForm({      //criando o formulário 
            title: 'Criação de Ref Cliente'
        });
        form.addField({                 // criando os campos 
            label: 'Cliente',
            type: ui.FieldType.SELECT,  // tipo select cria um campo tipo lista suspensa
            id: 'custpage_client_name',
            source: 'customer'          // aqui está fazendo a associação do ao campo de cliente 
        });
        form.addField({                 // criando os campos
            label: 'Subsidiária',
            type: ui.FieldType.SELECT,  // tipo select cria um campo tipo lista suspensa 
            id: 'custpage_ref_subsidiary',
            source: 'subsidiary'        // aqui está fazendo a associação do ao campo de cliente
        });
        form.addButton({
            id: 'custpage_button',   // criando o btão 
            label: 'Criar',          // aparecerá assim no form 
            functionName: 'enviar'   // aqui é o nome da função que devemos implementar no CS  
        });
        form.clientScriptModulePath = './rsc_cs_ref_client.js'; // aqui a integração com o outro arquivo
        ctx.response.writePage(form); // aqui está criando o form na pg 
    }
    return {
        onRequest: onRequest
    }
});