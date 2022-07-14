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

	} else {

		try {
			var customerid = request.getParameter('custpage_id'), template_html = '' ;

			nlapiLogExecution( 'DEBUG', 'request.getParameter custpage_id', request.getParameter('custpage_id'));
			nlapiLogExecution( 'DEBUG', 'request.getParameter custpage_empresa_razao', request.getParameter('custpage_empresa_razao'));

			if(!erro){
				var template_confirmacao = nlapiLoadFile('Intelipost/Templates/ip_mkp_confirm.html');
				var template_html = template_confirmacao.getValue();
			}
			else{
				var template_erro = nlapiLoadFile('Intelipost/Templates/erro_mkp-V2.html');
				var template_html = template_erro.getValue();
			}
			response.setContentType('HTMLDOC');
			response.write(template_html);
		} catch (err) {
			if ( err instanceof nlobjError ){
				var errMSG = err.getCode() + '\n' + err.getDetails();
			}else{
				var errMSG = err.toString();
				nlapiLogExecution( 'DEBUG', 'Erro após enviar', errMSG);
				nlapiSendEmail( 2338, 2338, 'NETSUITE - Erro no Suitelet Tabela de Frete',  'Erro pra Carregar o template' +  errMSG , null, null );
				return 'ERRO em carregar o Template' + errMSG;
			}
		}

	}
}

function funcaoPost(req, response) {
	try {

		nlapiLogExecution('DEBUG', 'req: ' + req.getParameter);

		var customerid = req.getParameter('custpage_id');

		if (!customerid) printError('Erro de id:', 'customerid');
		var empresa_cep = req.getParameter('cep');

		var empresa_razao = req.getParameter('custpage_empresa_razao');
		var empresa_cnpj = req.getParameter('custpage_empresa_cnpj');
		var empresa_insestadual = req.getParameter('custpage_insestadual');
		var empresa_insmunicipal = req.getParameter('custpage_insmunicipal');

		var email_resp_fin = req.getParameter('custpage_financeiro_email');
		var nome_resp_fin = req.getParameter('custpage_financeiro_name');
		var tel_resp_fin = req.getParameter('custpage_financeiro_telefone');

		var email_resp = req.getParameter('custpage_email');
		var tel_resp = req.getParameter('custpage_telefone');
		var nome_resp = req.getParameter('custpage_name');
		var empresa_estado = req.getParameter('uf');
		var empresa_cidade = req.getParameter('cidade');
		var empresa_bairro = req.getParameter('bairro');
		var empresa_endereço = req.getParameter('rua');
		var empresa_numero = req.getParameter('numero');
		var empresa_complemento = req.getParameter('complemento');

	/* 	addLead();

		updateCustomerRec(req.getParameter('custpage_id'));

		updateCustomerRec2(req.getParameter('custpage_id'));

		contatoFinanceiro();
		contatoComercial(); */

		var template_confirmacao = nlapiLoadFile('Intelipost/Templates/ip_mkp_confirm.html');
		var template_confirmacao_html = template_confirmacao.getValue();
		response.setContentType('HTMLDOC');
		response.write(template_confirmacao_html);
	} catch (err) {
		printError(err, 'funcaoPost');
	}

}