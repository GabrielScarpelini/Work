/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/runtime', '../Junix/rsc_finan_createproposta.js', 'N/record', 'N/query'],
    
    (runtime, proposta, record, query) => {


        function handleErrorAndLog(e, stage)
        {
                    log.error('Stage: ' + stage + ' failed', e);

            }

        function handleErrorIfAny(summary)
        {
                    var inputSummary = summary.inputSummary;
                    var mapSummary = summary.mapSummary;
                    var reduceSummary = summary.reduceSummary;

                    if (inputSummary.error)
                    {
                            var e = error.create({
                                    name: 'INPUT_STAGE_FAILED',
                                    message: inputSummary.error
                            });
                            handleErrorAndLog(e, 'getInputData');
                    }

                    handleErrorInStage('map', mapSummary);
                    handleErrorInStage('reduce', reduceSummary);
            }

        function handleErrorInStage(stage, summary)
        {
                    var errorMsg = [];
                    summary.errors.iterator().each(function(key, value){
                            var msg = 'Failure to generate the file: ' + key + '. Error was: ' + JSON.parse(value).message + '\n';
                            errorMsg.push(msg);
                            return true;
                    });
                    if (errorMsg.length > 0)
                    {
                            var e = error.create({
                                    name: 'RECORD_TRANSFORM_FAILED',
                                    message: JSON.stringify(errorMsg)
                            });
                            handleErrorAndLog(e, stage);
                    }
            }

        function formatDate(date) {
                    var dateToFormat = date;
                    var arrayDateToFormat = dateToFormat.split('/');
                    var dateStringToFormat = arrayDateToFormat[2] + '/' + arrayDateToFormat[1] + '/' + arrayDateToFormat[0];
                    dateStringToFormat = dateStringToFormat.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3");
                    var returnDate = new Date(dateStringToFormat);
                    return returnDate;
            }

        function _getAccountBalance(account, period, subsidiary){
                    log.debug({title: 'Account', details: account});
                    log.debug({title: 'Period', details: period});
                    log.debug({title: 'Subsidiary', details: subsidiary});
                    var sql = 'select abs(sum(transactionaccountingline.amount)) amount, account.acctnumber, ' +
                        '               BUILTIN.DF(transaction.postingperiod), transactionline.subsidiary ' +
                        '       from transactionaccountingline, transaction, transactionline, account ' +
                        '       where transaction.id = transactionaccountingline.transaction ' +
                        '       and transaction.id = transactionline.transaction ' +
                        '       and account.id = transactionaccountingline.account ' +
                        '       and transactionline.mainline = \'T\' ' +
                        '       and transaction.void = \'F\'' +
                        '       and transactionline.linesequencenumber = 0 and account.id in (?) ' +
                        '       and  transaction.postingperiod <= ? and transactionline.subsidiary = ?\n' +
                        '       group by account.acctnumber, BUILTIN.DF(transaction.postingperiod), ' +
                        '               transactionline.subsidiary, transaction.postingperiod';
                    var results = query.runSuiteQL({query: sql, params: [account, period, subsidiary]}).asMappedResults();
                    if (results.length > 0){
                            var result = results[0];
                            return result['amount'];
                    } else {
                            return 0;
                    }
            }

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */
        const getInputData = (inputContext) => {
                try {
                        const script = runtime.getCurrentScript();
                        const dados = JSON.parse(script.getParameter({name: 'custscript_rsc_aprop_dadosCalculo'}));
                        log.audit({title:'Dados', details: dados.length})

                        const label = JSON.parse(script.getParameter({name: 'custscript_rsc_aprop_label'}));
                        log.audit({title:'Label', details: label})

                        const period = script.getParameter({name: 'custscript_rsc_aprop_period'});
                        const trandate = script.getParameter({name: 'custscript_rsc_aprop_trandate'});
                        var headers = [];

                        for (var i = 0; i < dados.length; i++){
                                var dado = dados[i];

                                var sub = '';
                                for (var j = 0; j < label.length; j++){
                                        if (j == 0){
                                                /* Obtem Subsidiary */
                                                var pesqSub = dado[j] + '_' + dado[j];
                                                var sub = proposta.getSPEObra(pesqSub).codEmpreendimento;
                                        }
                                        if (j > 1){
                                                var contas = label[j].split('_');
                                                credito = contas[1];
                                                debito = contas[2];
                                                //log.debug({title: 'Contas', details: contas});
                                                valor = dado[j];
                                                var lines = [];
                                                if (valor !=  0){
                                                        lines.push({account: credito, type: 'credit', value: valor});
                                                        lines.push({account: debito, type: 'debit', value: valor});
                                                        var header = [];
                                                        header.push({subsidiary: sub,
                                                                postingperiod: period,
                                                                trandate: trandate,
                                                                memo: 'Apropriação Imobiliaria',
                                                                line: lines});
                                                        headers.push(header)
                                                }
                                        }
                                }
                        }
                        log.debug({title: 'Return', details: JSON.stringify(headers)});
                        return headers;
                } catch (e){
                        throw 'MR.getInputData: '+e;
                }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */
        const map = (mapContext) => {
                try {
                        var context = JSON.parse(mapContext.value);
                        log.audit({title: 'map context', details: context[0]});

                        if (context[0] != null){
                                log.audit({title: 'Data', details: formatDate(context[0].trandate)});
                                log.audit({title: 'Data', details: context[0].trandate});

                                /* Obtem o valor de saldo da conta, para calcular o valor a ser lançado */
                                var accountBalance = _getAccountBalance(context[0].line[0].account, context[0].postingperiod,context[0].subsidiary );

                                var journal = record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: false});
                                journal.setValue({fieldId: 'subsidiary', value: context[0].subsidiary});
                                journal.setValue({fieldId: 'postingperiod', value: context[0].period});
                                journal.setValue({fieldId: 'trandate', value: formatDate(context[0].trandate) });
                                journal.setValue({fieldId: 'memo', value: 'Apropriação Imobiliaria'});
                                journal.setValue({fieldId: 'custbody_rsc_aprop_flag', value: true});
                                for (var i = 0; i < context[0].line.length; i++){
                                        var linha = context[0].line[i];
                                        journal.setSublistValue({
                                                sublistId: 'line',
                                                fieldId: 'account',
                                                value: linha.account.toString(),
                                                line: i
                                        });

                                        var valorString = linha.value;
                                        valorString = valorString.replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, '');
                                    log.debug({title:'Valor valor retirado', details:valorString});
                                        //valorString = valorString.replace(',','');
                                    log.debug({title:'Valor valor retir', details:valorString});
                                        valorString = Number(valorString);
                                        valorString = valorString/100;
                                        log.debug({title:'Valor Saldo Conta', details:accountBalance});
                                        log.debug({title:'Valor Saldo a Apropriar', details:valorString});
                                        log.debug({title: 'Valor Lançamento', details:accountBalance - valorString})
                                        log.debug({title: 'Valor Lançamento credora', details:valorString - accountBalance})

                                    var balance = accountBalance - valorString;

                                        journal.setSublistValue({
                                                sublistId: 'line',
                                                fieldId: linha.type,
                                                value: balance,
                                                line: i
                                        });
                                }
                                var idJournal = journal.save({ignoreMandatoryFields: true});

                        }

                } catch (e){
                        log.audit({title: 'erro ', details: 'MR.getInputData: '+e});
                }

                /*var journal = record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: false});

                journal.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: credito,
                        line: 0
                });
                journal.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: valor,
                        line: 0
                });

                journal.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: debito,
                        line: 1
                });
                journal.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: valor,
                        line: 1
                });
                var idJournal = journal.save({ignoreMandatoryFields: true});*/
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }

        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {
        /*        handleErrorIfAny(context);

                var host = url.resolveDomain({hostType: url.HostType.APPLICATION});

                var author = -5;
                var recipients = 'thiago.silva@runsmart.cloud' //'luiz.morais@enl8.com.br';
                var subject = 'Arquivo Criado';
                var body = 'Os registros foram gerados corretamente!';

                email.send({
                        author: author,
                        recipients: recipients,
                        subject: subject,
                        body: body
                });*/
        }

        return {getInputData, map, reduce, summarize}

    });
