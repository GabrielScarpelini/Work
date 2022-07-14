function CriaFormTabela(request, response){
        
	// carregar página
	if(request.getMethod() == 'GET'){
	
		// carregar template HTML
		var template = nlapiLoadFile('Intelipost/Templates/ip_com_cadastro_cliente.html');
		
		// Acessar o conteudo do template
		try {    
			var html = template.getValue();    
		
		// Erro no acesso do template
		}catch(err) {
			if ( err instanceof nlobjError ){
				var errMSG = err.getCode() + '\n' + err.getDetails();
              	nlapiLogExecution('DEBUG', 'Erro para carregar a página', errMSG);
              	var template_erro = nlapiLoadFile('Intelipost/Templates/form_mkp_error.html');
              	var template_erro_html = template_erro.getValue();
              	response.setContentType('HTMLDOC');
              	response.write(template_erro_html);
              	return 'ERRO' + errMSG;
			}else{
				var errMSG = err.toString();
				nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
				//nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro no Suitelet Tabela de Frete',  'Erro pra Carregar o template' +  errMSG , null, null );
              	var template_erro = nlapiLoadFile('Intelipost/Templates/form_mkp_error.html');
                var template_erro_html = template_erro.getValue();
                response.setContentType('HTMLDOC');
                response.write(template_erro_html);
				return 'ERRO em carregar o Template' + errMSG;
			}
		}
		// Mostrar página
		response.setContentType('HTMLDOC');
		response.write(html);
			
	}else{

        var customerid = request.getParameter('custpage_id') ;
        nlapiLogExecution( 'DEBUG', 'Valor do Customer ID', customerid)
		var empresa_cep = request.getParameter('cep') ;

        var empresa_razao = request.getParameter('custpage_empresa_razao') ;
        var empresa_cnpj = request.getParameter('custpage_empresa_cnpj') ;
        var empresa_insestadual = request.getParameter('custpage_insestadual') ;
        var empresa_insmunicipal = request.getParameter('custpage_insmunicipal') ;

        var email_resp_fin = request.getParameter('custpage_financeiro_email') ;
        var nome_resp_fin = request.getParameter('custpage_financeiro_name') ;
        var tel_resp_fin = request.getParameter('custpage_financeiro_telefone') ;

        var email_resp = request.getParameter('custpage_email') ;
        var tel_resp = request.getParameter('custpage_telefone') ;
        var nome_resp = request.getParameter('custpage_name') ;			
			
			//nlapiLogExecution( 'DEBUG', 'Data', datastring);

			//nlapiSubmitField('customer', customerid, 'companyname', empresa_razao);
		   // nlapiSubmitField('customer', customerid, 'custentity_psg_br_cnpj', empresa_cnpj);
		   // nlapiSubmitField('customer', customerid, 'custentity_psg_br_state_tax_subscr', empresa_insestadual);
		   // nlapiSubmitField('customer', customerid, 'custentity_psg_br_municipal_subscr', empresa_insmunicipal);
		   
			

	try{


  

		//Criando o Endereço pro Lead
		var record = nlapiLoadRecord('customer', customerid, {recordmode: 'dynamic'});

		var addrSubrecord = record.createCurrentLineItemSubrecord('addressbook', 'addressbookaddress');

		var empresa_estado = request.getParameter('uf') ;
		var empresa_cidade = request.getParameter('cidade') ;
		var empresa_bairro = request.getParameter('bairro') ;
		var empresa_endereço = request.getParameter('rua') ;
		var empresa_numero = request.getParameter('numero') ;
		var empresa_complemento = request.getParameter('complemento') ;


		addrSubrecord.setFieldValue('zip', empresa_cep);
		addrSubrecord.setFieldValue('addr1', empresa_endereço);
		addrSubrecord.setFieldValue('state', empresa_estado);
		addrSubrecord.setFieldValue('custrecord_sit_address_i_numero', empresa_numero);
		addrSubrecord.setFieldValue('custrecord_sit_address_complemento', empresa_complemento);
		addrSubrecord.setFieldValue('custrecord_sit_address_t_bairro', empresa_bairro);
		//addrSubrecord.setFieldValue('custrecord_enl_city', empresa_cidade);
		//addrSubrecord.setFieldValue('state', empresa_estado);

		 // Commit the new address subrecord.

			addrSubrecord.commit();
		 record.commitLineItem('addressbook');

		}

		catch(err) {
			if ( err instanceof nlobjError )
			var errMSG = err.getCode() + '\n' + err.getDetails();
			else
			var errMSG = err.toString();
			nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
			nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro para criar Endereço',  'Erro para criar Endereço' +  errMSG , null, null );
			return 'Erro para criar Endereço' + errMSG;
		}

		
		 
		try{

			// Update the customer record.

			nlapiSubmitRecord(record);

			var emailTempId = 89; // internal id do email de cadastro bem sucedido
			var emailTemp = nlapiLoadRecord('emailtemplate',emailTempId); 
			var emailSubj = emailTemp.getFieldValue('subject');
			var emailBody = emailTemp.getFieldValue('content');
			
			var records = new Object();
			records['customer'] = customerid; //internal id of the case record
			var customerrecord = nlapiLoadRecord('customer', customerid); 
			var renderer = nlapiCreateTemplateRenderer();
			
			renderer.addRecord('customer', customerrecord ); 
			renderer.setTemplate(emailSubj);
			renderSubj = renderer.renderToString();
			renderer.setTemplate(emailBody);
			renderBody = renderer.renderToString();
		 
			 // Email para financeiro e comercial com os dados preenchidos
			 
			 var dados_preenchidos =('Razao Social: ' + empresa_razao  + '\n' + 
			 ' CEP: '+ empresa_cep + ' -'+ '\n' + 
			 ' Estado: ' + empresa_estado +' -'+ '\n' + 
			 ' Cidade: ' + empresa_cidade + ' -'+'\n' +  
			 ' Bairro: ' + empresa_bairro  + ' -'+'\n' + 
			 ' Endereço: ' + empresa_endereço  + ' -'+'\n' +
			 ' Numero: ' + empresa_numero  + ' -'+'\n' + 
			 ' Complemento: ' + empresa_complemento  + ' -'+ '\n' + 
			 ' CNPJ: ' + empresa_cnpj  + ' -'+ '\n' +     
			 ' Inscrição Estadual: ' + empresa_insestadual  + ' -'+ '\n' + 
			 ' Inscrição Municipal: ' + empresa_insmunicipal  + ' -'+ '\n' + 
			 ' Nome do Comercial: ' + nome_resp  + ' -'+'\n' + 
			 ' Email do Comercial: ' + email_resp  + ' -'+'\n' + 
			 ' Telefone do Comercial: ' + tel_resp  + ' -'+'\n' + 
			 ' Nome do Financeiro: ' + nome_resp_fin  + ' -'+'\n' + 
			 ' Email do Financeiro: ' + email_resp_fin  + ' -'+'\n' + 
			 ' Telefone do Financeiro: ' + tel_resp_fin); 

             nlapiSendEmail(239880, 'time_comercial@intelipost.com.br', renderSubj, renderBody + '\n' + dados_preenchidos, null, null, records);
			 nlapiSendEmail(239880, 2338, renderSubj, renderBody + '\n' + dados_preenchidos, null, null, records);
			 nlapiSendEmail(239880, 1432680, renderSubj, renderBody + '\n' + dados_preenchidos , null, null, records); //grupo comercial
			// nlapiSendEmail(239880, 'cobranca@intelipost.com.br', renderSubj, renderBody + '\n' + dados_preenchidos , null, null, records); //grupo de cobrança

		}
		catch(err) {
			if ( err instanceof nlobjError )
			var errMSG = err.getCode() + '\n' + err.getDetails();
			else
			var errMSG = err.toString();
			nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
			nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro para enviar Email',  'Erro para enviar Email' +  errMSG , null, null );
			return 'Erro para enviar email' + errMSG;
		}

		try {


			var Record_ID = nlapiLoadRecord('customer',customerid);
	
		  //  var empresa_nome = request.getParameter('custpage_empresa_name') 



			Record_ID.setFieldValue('companyname', empresa_razao);
			Record_ID.setFieldValue('custentity_psg_br_cnpj', empresa_cnpj);
			Record_ID.setFieldValue('custentity_psg_br_state_tax_subscr', empresa_insestadual);
			Record_ID.setFieldValue('custentity_psg_br_municipal_subscr', empresa_insmunicipal);
			Record_ID.setFieldValue('custentity_ip_com_datadocadastro', 'T');

			var Record_ID2 = nlapiSubmitRecord(Record_ID, false, false);

		   
		}
		catch(err) {
			if ( err instanceof nlobjError )
			var errMSG = err.getCode() + '\n' + err.getDetails();
			else
			var errMSG = err.toString();
			nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
			nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro no Suitelet Cadastro de CLiente',  'Erro para Salvar os campos' +  errMSG , null, null );
			return 'Erro para Salvar os campos' + errMSG;
        }
        
        try{


			// Criando o Contato Financeiro

			


			var fldMap = new Array();
            fldMap['email'] = email_resp_fin;
            var duplicatecontato = nlapiSearchDuplicate( 'contact', fldMap );
            if (duplicatecontato != null ) { //somente se retorno = null

			}
			else{

                var fldMap3 = new Array();
                fldMap3['firstname'] = nome_resp_fin;
                var duplicatecontato3 = nlapiSearchDuplicate( 'contact', fldMap3 );
                if (duplicatecontato3 != null ) { //somente se retorno = null

			var contatofinanceiro = nlapiCreateRecord('contact');
			contatofinanceiro.setFieldValue('email', email_resp_fin);
			contatofinanceiro.setFieldValue('company', customerid); //Cliente recém criado
			contatofinanceiro.setFieldValue('firstname', nome_resp_fin.substring(0, 31));
			contatofinanceiro.setFieldValue('phone', tel_resp_fin);
			contatofinanceiro.setFieldValue('custentity_ip_com_contatodepto', 3); //financeiro
			contatofinanceiro.setFieldValue('custentity_acs_isrecipientfiscalemail_fl','T');
			var contatofinanceiroid = nlapiSubmitRecord(contatofinanceiro, false, false);
			
        }

    }
}
		
	  //testa se existem duplicatas



	catch(err) {
		if ( err instanceof nlobjError )
		var errMSG = err.getCode() + '\n' + err.getDetails();
		else
		var errMSG = err.toString();
		nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
		nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro para criar Contato Financeiro',  'Erro para criar Contato Financeiro' +  errMSG , null, null );
		return 'Erro para criar Contato Financeiro' + errMSG;
	}


	  try{

	  // Criando o Contato Comercial

	  

			var fldMap2 = new Array();
            fldMap2['email'] = email_resp;
            var duplicatecontato = nlapiSearchDuplicate( 'contact', fldMap2 );
            if (duplicatecontato != null ) { //somente se retorno = null 

			}else{

                var fldMap4 = new Array();
            fldMap4['firstname'] = nome_resp;
            var duplicatecontato4 = nlapiSearchDuplicate( 'contact', fldMap4 );
            if (duplicatecontato4 != null ) { //somente se retorno = null 


	  var contatocomercial = nlapiCreateRecord('contact');
	  contatocomercial.setFieldValue('email', email_resp);
	  contatocomercial.setFieldValue('company', customerid); //Cliente recém criado
	  contatocomercial.setFieldValue('firstname', nome_resp.substring(0, 31));
	  contatocomercial.setFieldValue('phone', tel_resp);
	  contatocomercial.setFieldValue('custentity_ip_com_contatodepto', 4); //Comercial
	  contatocomercial.setFieldValue('custentity_acs_isrecipientfiscalemail_fl','T');
	  var contatocomercialid = nlapiSubmitRecord(contatocomercial, false, false);

            }
            
        }

	
		}

		catch(err) {
			if ( err instanceof nlobjError )
			var errMSG = err.getCode() + '\n' + err.getDetails();
			else
			var errMSG = err.toString();
			nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
			nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro para criar Contato Comercial',  'Erro para criar Contato Comercial' +  errMSG , null, null );
			return 'Erro para criar Contato Comercial' + errMSG;
		}
	
		var template_confirmacao = nlapiLoadFile('Intelipost/Templates/ip_mkp_confirm.html');
		var template_confirmacao_html = template_confirmacao.getValue();
		response.setContentType('HTMLDOC');
		response.write(template_confirmacao_html);
	}
}
		

		
			
			