/**
 * @NScriptType suitelet
 * @NApiVersion 2.0
 * @scriptName Tela_treino1
 */
 define([ 'N/ui/serverWidget'], // esse modulo auxlia a criar campos 

 function( ui)
 {
     function onRequest(context)  // função sempre que for requisitado acontecerá isso
     {
         var form = ui.createForm({          // aqui está criando o formulário 
             title: 'Cadastro de Cliente'
         });
         form.addFieldGroup({                // aqui tá sendo criado um grupo, o que faz o form ficar separado por grupos 
             id : 'custpage_dados_pessoais',
             label : 'Dados Pessoais'
         });
         form.addFieldGroup({               // aqui tá sendo criado um grupo, o que faz o form ficar separado por grupos 
             id : 'custpage_endereco',
             label : 'Endereço'
         });
         form.addField({                         // aqui está criando o campo no form  
             label: "Nome:",                     // aqui o nome 
             type: ui.FieldType.TEXT,            // o tipo do campo 
             id:'custpage_nome',                 // o id do campo 
             container:'custpage_dados_pessoais' // aqui está atribuindo ao field group que vai ficar na pag 
         })
         form.addField({                          // aqui está criando o campo no form
             label: "Nome da Empresa:",           // aqui o nome 
             type: ui.FieldType.TEXT,             // o tipo do campo    
             id:'custpage_nome_empresa',          // o id do campo    
             container:'custpage_dados_pessoais'  // aqui está atribuindo ao field group que vai ficar na pag 
         })                                       // nesse exemplo todos os addField 
 
         form.addField({                        
             label: "Email:",
             type: ui.FieldType.TEXT,
             id:'custpage_email',
             container:'custpage_dados_pessoais'
         })
         form.addField({
             label: "Telefone:",
             type: ui.FieldType.INTEGER,
             id:'custpage_telefone',
             container:'custpage_dados_pessoais'
         })
         form.addField({
             label: "Empresa?",
             type: ui.FieldType.CHECKBOX,
             id:'custpage_check_empresa',
             container:'custpage_dados_pessoais'
         })
         form.addField({
             label: "Endereço:",
             type: ui.FieldType.TEXTAREA,
             id:'custpage_endereco',
             container:'custpage_endereco'
         })
         form.addButton({                      // aqui está sendo criado um botão 
             id : 'custpage_salvarCliente',    // atribui 
             label : 'Salvar',                 // aqui atribui o nome ao botão  
             functionName:'salvar'             // aqui está criando o nome da função que vai para o ClientScript 
         })
         form.clientScriptModulePath = './funcionalidadeCadastro.js'; // aqui está atribuindo ao clientScript  
         context.response.writePage(form);                            // aqui está fazendo o form dentro do netsuite OBS sem esse comando 
     }                                                                // OS CAMPOS NÃO IRÃO PARA O FORMULÁRIO 
 
     return {
         onRequest: onRequest
     };
 });