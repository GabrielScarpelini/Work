/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @Author Rafael Oliveira
*/
 define(['N/ui/serverWidget', 'N/record', 'N/log', 'N/url'],

    function(ui, record, log, url) {

        function onRequest(ctx) {
            
            const request = ctx.request;
            const method = request.method;
            const response = ctx.response;
            const parameters = request.parameters;
            if (method == 'GET'){
                // log.debug('ctx', ctx)
            var form = ui.createForm({
                title: 'Cadastro de funcionários'
            })
            // fields
            form.addField({
                label: 'Nome',
                type: ui.FieldType.TEXT,
                id: 'custpage_nome',
            })
            form.addField({
                label: 'Subsidiária',
                type: ui.FieldType.SELECT,
                id: 'custpage_subsidiaria',
                source: 'subsidiary'
            })
            form.addField({
                label: 'E-mail',
                type: ui.FieldType.EMAIL,
                id: 'custpage_email'
            })

            // sublist

            var sublist = form.addSublist({
                id: 'custpage_sublist',
                label: 'Endereço',
                type: ui.SublistType.INLINEEDITOR
            })
            
            sublist.addField({
                id: 'custpage_country',
                type: ui.FieldType.TEXT,
                label: 'Sigla do país'
            });
            sublist.addField({
                id: 'custpage_city',
                type: ui.FieldType.SELECT,
                label: 'cidade',
                source: 'customrecord_enl_cities'
            });
            sublist.addField({
                id: 'custpage_uf',
                type: ui.FieldType.SELECT,
                label: 'UF',
                source: 'customlist_enl_state'
            });
            sublist.addField({
                id: 'custpage_zip',
                type: ui.FieldType.TEXT,
                label: 'CEP'
            });
            sublist.addField({
                id: 'custpage_addr3',
                type: ui.FieldType.TEXT,
                label: 'Bairro'
            });
            sublist.addField({
                id: 'custpage_addr1',
                type: ui.FieldType.TEXT,
                label: 'Rua'
            });
            sublist.addField({
                id: 'custpage_numero',
                type: ui.FieldType.FLOAT,
                label: 'Número'
            });



            // button
            form.addSubmitButton({ // assim que eu clicar no botão o script automaticamente vira o método post
                id: 'custpage_criarFunc',
                label: 'Criar',
                functionName: 'criar'
            })
            
            ctx.response.writePage(form);  // escreve o formulário
            // form.clientScriptModulePath = './rsc_CS_botaoCadastro_Rafael.js';  // faz referência a outro script
            }else{
                try {
                    // log.debug('method', method)
                log.debug('parameters', parameters)
                var nome = parameters.custpage_nome
                var subsidiaria = parameters.custpage_subsidiaria
                var email = parameters.custpage_email
                var primeiroNome = nome.slice(0, ' ')
                var ultimoNome = nome.slice(' ')
                var sublistValues = parameters.custpage_sublistdata
                var listaValues = sublistValues.split("\x01")

                // log.debug('nome', nome)
                // log.debug('subsidiaria', subsidiaria)
                // log.debug('email', email)
                // log.debug('nomes', nomes)
                // log.debug('sublistValues', sublistValues)
                log.debug('listaValues', listaValues)
                

                var func = record.create({
                    type: 'employee',
                    isDynamic: true
                })
                func.setValue('firstname', primeiroNome)
                func.setValue('lastname', ultimoNome)
                func.setValue('subsidiary', subsidiaria)
                func.setValue('email', email)

                func.selectNewLine('addressbook') 
                var registroEndereco = func.getCurrentSublistSubrecord('addressbook', 'addressbookaddress')
                registroEndereco.setValue('country' , listaValues[0])
                registroEndereco.setValue('custrecord_enl_city' , listaValues[2])
                registroEndereco.setValue('custrecord_enl_uf' , listaValues[3])
                registroEndereco.setValue('zip' , listaValues[4])
                registroEndereco.setValue('addr3' , listaValues[5])
                registroEndereco.setValue('addr1' , listaValues[6])
                registroEndereco.setValue('custrecord_enl_numero' , listaValues[7])

                func.commitLine('addressbook')
                var idFunc = func.save({ignoreMandatoryFields: true}) 
                log.debug('idFunc', idFunc)

                // var link = url.resolveRecord({
                //     recordType: 'employee',
                //     recordId: idFunc,
                // })
                // window.location.replace(link)
                } catch (error) {
                    log.error('Erro: ', error)
                }
                
            }
        }

        return {
            onRequest: onRequest
        };
     }
);
