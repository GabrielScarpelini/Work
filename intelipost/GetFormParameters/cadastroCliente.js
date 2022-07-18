/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(['N/render', 'N/log', 'N/file', 'N/https', 'N/ui/serverWidget','N/record', 'N/search', 'N/email'], function(render, log, file, https, ui, record, search, email){
    
    function onRequest(ctx) {
        const request = ctx.request;
        const method = request.method;
        const response = ctx.response;
        const parameters = request.parameters;
        
        if(method =='GET'){
            
            var template = file.load('Intelipost/Templates/ip_com_cadastro_cliente.html');
            log.debug('template' ,template)

            try{
                var html = template.getContents()
            }catch(e){
                if(e instanceof e){
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
              	    var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }else{
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
                    var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }

            }
            log.debug('html', html)
            response.write(html)
        }else{
            try{
                var template = file.load('Intelipost/Templates/ip_mkp_confirm.html')
                var html = template.getContents()
                response.write(html)
                
                //pegando os valores dos campos do formulário

                var objLoja = {
                    id: parameters.custpage_id,
                    razaoSocial: parameters.custpage_empresa_razao,
                    cnpj: parameters.custpage_empresa_cnpj,
                    insc_est: parameters.custpage_insestadual,
                    insc_mun: parameters.custpage_insmunicipal,
                    fileDeal: parameters.custpage_insmunicipal_arq,
                    objAddress: {
                        cep: parameters.cep,
                        estado: parameters.uf,
                        city: parameters.cidade,
                        concat: parameters.concat,
                        bairro: parameters.bairro,
                        endereco: parameters.rua,
                        numero: parameters.numero,
                        comp: parameters.complemento
                    }
                }

                var cttPrincipal = {
                    nome: parameters.custpage_name,
                    email: parameters.custpage_email,
                    phone: parameters.custpage_telefone
                }
                
                var repOne = {
                    nome: parameters.custpage_name_rp1,
                    email: parameters.custpage_email_rp1,
                    cpf: parameters.custpage_cpf_rp1,
                    rg: parameters.custpage_rg_rp1                
                }

                var repTwo = {
                    nome: parameters.custpage_name_rp2,
                    email: parameters.custpage_email_rp2,
                    cpf: parameters.custpage_cpf_rp2,
                    rg: parameters.custpage_rg_rp2  
                }

                var witnessOne = {
                    nome: parameters.custpage_name_tt1,
                    email: parameters.custpage_email_tt1,
                    cpf: parameters.custpage_cpf_tt1,
                    rg: parameters.custpage_rg_tt1
                }

                var witnessTwo = {
                    nome: parameters.custpage_name_tt2,
                    email: parameters.custpage_email_tt2,
                    cpf: parameters.custpage_cpf_tt2,
                    rg: parameters.custpage_rg_tt2
                }

                var dadosFinanceiros = {
                    nome: parameters.bairrocustpage_financeiro_name,
                    email: parameters.custpage_financeiro_email,
                    phone: parameters.custpage_financeiro_telefon
                }   
            
                // busca para checar duplicidade de contato

                var contato = search.create({
                    type: 'contact',
                    filters: [
                        ['firstname', 'IS', cttPrincipal.nome],
                        'AND',
                        ['email', 'IS', cttPrincipal.email],
                        'AND',
                        ['phone','IS',cttPrincipal.phone]
                    ],
                    colunms: "internalid"
                }).run().getRange(0 ,1)[0]

                if(contato){
                    var cont = record.load({type: 'contact', id: contato.id})
                    cont.setValue('company', objLoja.id)
                    cont.save({ignoreMandatoryFields: true})

                }else{
                    var criaCtt = record.create({
                        type: 'contact',
                        isDynamic: true,
                    })
                    criaCtt.setValue('firstname', cttPrincipal.nome)
                    criaCtt.setValue('email', cttPrincipal.email)
                    criaCtt.setValue('phone', cttPrincipal.phone)
                    criaCtt.setValue('company', objLoja.id)
                    var cttId = criaCtt.save({ignoreMandatoryFields: true})
                    log.debug('valor id ctt', cttId)
                }
                
                //setando os valores para os campos do cliente, lead, prospects         
                //putData(objLoja, repOne, repTwo, witnessOne, witnessTwo, dadosFinanceiros, cttId)
            

                // Update the customer record.

                var temp = render.mergeEmail({templateId: 89}) // id do template do email de sucesso
                var emailTemp = record.load({type:'emailtemplate', id:temp}); 
                // var emailSubj = emailTemp.getValue('subject');
                // var emailBody = emailTemp.getValue('content');
                
                // var records = new Object();
                // records['customer'] = customerid; //internal id of the case record
                // var customerrecord = nlapiLoadRecord('customer', customerid); 
                // var renderer = nlapiCreateTemplateRenderer();
                
                // renderer.addRecord('customer', customerrecord ); 
                // renderer.setTemplate(emailSubj);
                // renderSubj = renderer.renderToString();
                // renderer.setTemplate(emailBody);
                // renderBody = renderer.renderToString();
            
                // // Email para financeiro e comercial com os dados preenchidos
                
                // var dados_preenchidos =('Razao Social: ' + empresa_razao  + '\n' + 
                // ' CEP: '+ objLoja + ' -'+ '\n' + 
                // ' Estado: ' + objLoja +' -'+ '\n' + 
                // ' Cidade: ' + objLoja + ' -'+'\n' +  
                // ' Bairro: ' + objLoja  + ' -'+'\n' + 
                // ' Endereço: ' + objLoja  + ' -'+'\n' +
                // ' Numero: ' + objLoja  + ' -'+'\n' + 
                // ' Complemento: ' + objLoja  + ' -'+ '\n' + 
                // ' CNPJ: ' + objLoja  + ' -'+ '\n' +     
                // ' Inscrição Estadual: ' + objLoja  + ' -'+ '\n' + 
                // ' Inscrição Municipal: ' + objLoja  + ' -'+ '\n' + 
                // ' Nome do Comercial: ' + nome_resp  + ' -'+'\n' + 
                // ' Email do Comercial: ' + email_resp  + ' -'+'\n' + 
                // ' Telefone do Comercial: ' + tel_resp  + ' -'+'\n' + 
                // ' Nome do Financeiro: ' + nome_resp_fin  + ' -'+'\n' + 
                // ' Email do Financeiro: ' + email_resp_fin  + ' -'+'\n' + 
                // ' Telefone do Financeiro: ' + tel_resp_fin); 

                // nlapiSendEmail(239880, 'time_comercial@intelipost.com.br', renderSubj, renderBody + '\n' + dados_preenchidos, null, null, records);
                // nlapiSendEmail(239880, 2338, renderSubj, renderBody + '\n' + dados_preenchidos, null, null, records);
                // nlapiSendEmail(239880, 1432680, renderSubj, renderBody + '\n' + dados_preenchidos , null, null, records); //grupo comercial
			



            }catch(e){
                if(e instanceof e){
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
                        var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }else{
                    var msgErro = e.name + '\n' + e.message
                    log.error('Error', msgErro)
                    var template_erro = file.load('Intelipost/Templates/form_mkp_error.html');
                    var template_erro_html = template_erro.getContents()
                    response.write(template_erro_html)
                }
            }

        function putData(business, rep1, rep2, wit1, wit2, finantial){
            
            var cust =  record.load({
                        type: 'customer',
                        id: business.id,
                        isDynamic: true,
                        })
            
            //setando os valores de sublista de endereço
            cust.selectLine('addressbook', 0)
            var addressSubrecord = cust.getCurrentSublistSubrecord('addressbook', 'addressbookaddress')
            addressSubrecord.setValue('zip', business.objAddress.cep)
            addressSubrecord.setValue('addr1', business.objAddress.endereco)
            addressSubrecord.setValue('state', business.objAddress.estado)
            addressSubrecord.setValue('custrecord_enl_numero', business.objAddress.numero)
            addressSubrecord.setValue('custrecord_sit_address_i_numero', business.objAddress.numero)
            addressSubrecord.setValue('custrecord_sit_address_t_bairro', business.objAddress.bairro)
            addressSubrecord.setValue('custrecord_sit_address_complemento', business.objAddress.comp)
            //addressSubrecord.setValue('custrecord_enl_city', business.objAddress.city)
            addressSubrecord.setValue('isresidential', "T")
            addressSubrecord.setValue('defaultshipping', "T")
            addressSubrecord.setValue('defaultbilling', "T")
            addressSubrecord.setValue('label', business.objAddress.endereco.toString())
            addressSubrecord.setValue('displaystate_initialvalue', business.objAddress.city)
            cust.commitLine('addressbook')
        
            //setando os campos de corpo
            
            cust.setValue('companyname', business.razaoSocial)
            cust.setValue('custentity_enl_legalname', business.razaoSocial)
            cust.setValue('custentity_psg_br_cnpj', business.cnpj)
            cust.setValue('custentity_psg_br_municipal_subscr', business.insc_mun)
            cust.setValue('custentity_psg_br_state_tax_subscr', business.insc_est)
            cust.setValue('custentity_psg_br_cnpj', business.cnpj)
            
            //setando campos de relacionamento 
        
            //representante 1  
            
            cust.setValue('custentity_rsc_ip_nome_rep1', rep1.nome)
            cust.setValue('custentity_rsc_ip_emai_rep_1', rep1.email)
            cust.setValue('custentity_rsc_ip_cpf_rep1', rep1.cpf)
            cust.setValue('custentity_rsc_ip_rg_rep1', rep1.rg)
            
            // representante 2
        
            cust.setValue('custentity_rsc_ip_nome_rep2', rep2.nome)
            cust.setValue('custentity_rsc_ip_emai_rep_2', rep2.email)
            cust.setValue('custentity_rsc_ip_cpf_rep2', rep2.cpf)
            cust.setValue('custentity_rsc_ip_rg_rep2', rep2.rg)
            
            //  testemunha 1
            
            cust.setValue('custentity_rsc_ip_nome_testemu1', wit1.nome)
            cust.setValue('custentity_rsc_ip_email_testemu1', wit1.email)
            cust.setValue('custentity_rsc_ip_cpf_testemu1', wit1.cpf)
            cust.setValue('custentity_rsc_ip_rg_testemu1', wit1.rg)
        
            // //  testemunha 2
            
            cust.setValue('custentity_rsc_ip_nome_testemu2', wit2.nome)
            cust.setValue('custentity_rsc_ip_email_testemu2', wit2.email)
            cust.setValue('custentity_rsc_ip_cpf_testemu2', wit2.cpf)
            cust.setValue('custentity_rsc_ip_rg_testemu2', wit2.rg)
            
            // dados financeiros
            
            cust.setValue('custentity_rsc_ip_nome_finan', finantial.nome)
            cust.setValue('custentity_rsc_ip_email_finan', finantial.email)
            cust.setValue('custentity_rsc_ip_tel_finan', finantial.phone)
            
            cust.save({ignoreMandatoryFields: true})
        
        }
    }
}
    return {
        onRequest: onRequest
    }
})

