/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/encode', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/query'],
    /**
     * @param {encode} encode
     * @param {https} https
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(encode, https, record, runtime, search, query)
    {
            function selectAllRows( sql, queryParams = new Array() ) {
                    try {
                            var moreRows = true;
                            var rows = new Array();
                            var paginatedRowBegin = 1;
                            var paginatedRowEnd = 5000;

                            do {
                                    var paginatedSQL = 'SELECT * FROM ( SELECT ROWNUM AS ROWNUMBER, * FROM (' + sql + ' ) ) WHERE ( ROWNUMBER BETWEEN ' + paginatedRowBegin + ' AND ' + paginatedRowEnd + ')';
                                    var queryResults = query.runSuiteQL( { query: paginatedSQL, params: queryParams } ).asMappedResults();
                                    rows = rows.concat( queryResults );
                                    if ( queryResults.length < 5000 ) { moreRows = false; }
                                    paginatedRowBegin = paginatedRowBegin + 5000;
                            } while ( moreRows );
                    } catch( e ) {
                            log.error( { title: 'selectAllRows - error', details: { 'sql': sql, 'queryParams': queryParams, 'error': e } } );
                    }
                    return rows;
            }
            /**
             * Marks the beginning of the Map/Reduce process and generates input data.
             *
             * @typedef {Object} ObjectRef
             * @property {number} id - Internal ID of the record instance
             * @property {string} type - Record type id
             *
             * @return {Array|Object|Search|RecordRef} inputSummary
             * @since 2015.1
             */
            function getInputData()
            {
                    try
                    {
                            log.debug('getInputData-begin', "---------------------------------------------------------------------------------")

                            var sql = 'select id, custitem_avlr_integratedwithavatax, ' +
                                '       subsidiary, includechildren ' +
                                '       from item ' +
                                '       where itemtype in (\'InvtPart\',\'Group\',\'Kit\',\'NonInvtPart\',\'Service\') and isinactive = \'F\'';
                            var queryParams = new Array();
                            var arrResults = selectAllRows( sql, queryParams );




                            /*var scriptObj = runtime.getCurrentScript();
                            var internalId = scriptObj.getParameter({name: 'custscript_avlr_iteminternalid'});

                            var filter = [
                                    [
                                            ["formulanumeric: INSTR({custitem_avlr_integratedwithavatax}, {subsidiarynohierarchy})","isempty",""],
                                            "OR",
                                            ["formulanumeric: INSTR({custitem_avlr_integratedwithavatax}, {subsidiarynohierarchy})","lessthanorequalto","0"]
                                    ],
                                    "AND",
                                    ["type","anyof","InvtPart","Group","Kit","NonInvtPart","Service"],
                                    "AND",
                                    ["isinactive","is","F"]
                            ]

                            if(internalId)
                            {
                                    filter.push("AND");
                                    filter.push(["internalid","anyof", internalId]);
                            }

                            var itemSearchObj = search.create({
                                    type: "item",
                                    filters: filter,
                                    columns:["custitem_avlr_integratedwithavatax","subsidiarynohierarchy"]
                            });
                            var retorno = [];
                            // Run paged version of search with 1000 results per page
                            var myPagedData = itemSearchObj.runPaged({
                                    "pageSize": 1000
                            });
                            log.debug({title: 'Quantidade Paginas', details: myPagedData.count});
                            // Iterate over each page
                            myPagedData.pageRanges.forEach(function(pageRange){

                                    // Fetch the results on the current page
                                    var myPage = myPagedData.fetch({index: pageRange.index});

                                    log.debug({title:'Pagina Atual', details: pageRange.index});
                                    // Iterate over the list of results on the current page
                                    myPage.data.forEach(function(result){
                                            retorno.push(result);
                                    });
                            });
*/

                            log.debug('getInputData-end', "-----------------------------------------------------------------------------------")


                            return arrResults
                    }
                    catch (e)
                    {
                            log.debug('ERROR-getInputData', JSON.stringify(e))
                    }
            }

            /**
             * Executes when the map entry point is triggered and applies to each key/value pair.
             *
             * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
             * @since 2015.1
             */
            function map(context)
            {
                    try
                    {
                            var _itemSearch = JSON.parse(context.value);
                            //log.debug({title: '_itemSearch', details: _itemSearch});

                            if (_itemSearch.includechildren == 'T'){
                                    var queryResult = query.runSuiteQL({query: 'select id from subsidiary where isinactive = \'F\' and  iselimination = \'F\''});

                                    var results = queryResult.asMappedResults();
                                    var arraySub = [];
                                    if (results.length>0){
                                            for (i = 0; i < results.length; i++){
                                                    var resultado = results[i];
                                                    arraySub.push(resultado['id']);
                                            }
                                    }
                            }

                            if (_itemSearch.custitem_avlr_integratedwithavatax == null){

                            }
                            else {
                                    /* Incluir Caso subsidiaria não bata com o processado. */
                                    for (var i = 0; _itemSearch.custitem_avlr_integratedwithavatax; i++){
                                            var tipoParcela = arraySub.filter(word => word == _itemSearch.custitem_avlr_integratedwithavatax[i]);
                                            if (tipoParcela == null){
                                                    log.debug({title: 'Incluir', details: _itemSearch.id + ' Incluir Item '});
                                            } else {
                                                    log.debug({title: 'Não Incluir', details: _itemSearch.id});
                                            }
                                    }
                            }



                            if (1 == 2){

                            //log.debug('Map Context', context);
                            var _itemSearch = JSON.parse(context.value);

                            var scriptObj = runtime.getCurrentScript();
                            var _itemid = scriptObj.getParameter({name: 'custscript_enl_itemidfield'});
                            var _description = scriptObj.getParameter({name: 'custscript_enl_descriptionfield'});

                            var _internalid = _itemSearch.id;
                            var _type = _itemSearch.recordType;

                            var _itemLoad = record.load({type: _type, id: _internalid, isDynamic: true });
                            var _subsidiary = _itemLoad.getValue('subsidiary');
                            //var _integratedWithAvatax = _itemLoad.getValue('custitem_avlr_integratedwithavatax');

                            var _valueObj = {};

                            _valueObj.code = _itemLoad.getValue(_itemid);
                            _valueObj.agast = _itemLoad.getText('custitem_enl_it_taxgroup');

                            if(_itemLoad.getValue(_description))
                                    _valueObj.description = _itemLoad.getValue(_description).substr(0,60);

                            _valueObj.cityTaxConf = [];

                            if (_itemLoad.type != "serviceitem")
                            {
                                    _valueObj.source = getSourceItem(_itemLoad.getValue('custitem_enl_taxorigin'));

                                    var _productType = _itemLoad.getValue('custitem_enl_producttype');

                                    if (!_productType)
                                            _valueObj.productType = "NO RESTRICTION";
                                    else
                                            _valueObj.productType = getProductType(_productType);


                                    var _unitsTypeId = _itemLoad.getValue('unitstype')
                                    if(_unitsTypeId)
                                    {
                                            var _unitLoad = record.load({type: 'unitstype', id: _unitsTypeId});
                                            var _saleunit = _unitLoad.getSublistValue({sublistId: 'uom', fieldId: 'abbreviation', line: 1});
                                            if(_saleunit)
                                            {
                                                    _valueObj.salesUnit = _saleunit;
                                                    _valueObj.purchaseUnit = _saleunit;
                                            }
                                    }

                                    _valueObj.firstUse = false;
                                    _valueObj.sealCode = null;
                            }



                            log.debug("begin", "---------------------------------------------------------------------------------")
                            //log.debug('_itemSearch', _itemSearch.values.subsidiarynohierarchy);

                            var _subsidiaryLoad = record.load({type: record.Type.SUBSIDIARY, id: _itemSearch.values.subsidiarynohierarchy.value, isDynamic: true});
                            log.debug(_itemSearch.values.subsidiarynohierarchy, _valueObj)

                            var baseURL = _subsidiaryLoad.getValue('custrecord_enl_urlswfiscal');
                            if (!baseURL)
                            {
                                    log.debug('ERROR', 'Campo "FISCAL SW URL" não esta definido.');
                                    return;
                            }

                            var header = {};

                            if(_itemLoad.type == "serviceitem")
                            {
                                    header["Avalara-Product-Type"] = "service";

                                    var _url = baseURL + "/v2/companies/items/" + encodeURIComponent(_valueObj.code) + "?service";
                            }
                            else
                            {
                                    header["Avalara-Product-Type"] = "goods";

                                    var _url = baseURL + "/v2/companies/items/" + encodeURIComponent(_valueObj.code) + "?goods";
                            }

                            _url = _url.substr(0, 8).concat(_url.substr(8).replace('//', '/'));
                            log.debug("Send To Determination", _url);

                            var user = _subsidiaryLoad.getValue('custrecord_enl_avataxuser');
                            var pwd = _subsidiaryLoad.getValue('custrecord_enl_pwdavatax');
                            var companyCode = _subsidiaryLoad.getValue('custrecord_enl_companyid');

                            var base64String = encode.convert({
                                    string: (user + ':' + pwd),
                                    inputEncoding: encode.Encoding.UTF_8,
                                    outputEncoding: encode.Encoding.BASE_64
                            });

                            header["Authorization"] = "Basic " + base64String;
                            header["Content-Type"] = "application/json";


                            if(companyCode)
                                    header["Avalara-Company-Code"] = companyCode


                            var response = https.get({url: _url, headers: header});
                            //log.debug("response GET", response.body);
                            log.debug("response GET", + response.code + " : " + response.body);

                            if(response.code == 200)
                            {
                                    var response = https.put({url: _url, headers: header, body: JSON.stringify(_valueObj)});
                                    if(response.code == 204)
                                            log.debug("response PUT", "Success " + response.code + " : " + response.body);
                                    else
                                            log.debug("response PUT", response.code + " : " + response.body);
                            }
                            else
                            {
                                    if(_itemLoad.type == "serviceitem")
                                    {
                                            var _url = baseURL + "/v2/companies/items?service"

                                            if(!_valueObj.agast)
                                                    _valueObj.agast = "BRLC"
                                    }
                                    else
                                    {
                                            var _url = baseURL + "/v2/companies/items?goods"

                                            if(!_valueObj.agast)
                                                    _valueObj.agast = "BRNCM";
                                    }

                                    _url = _url.substr(0, 8).concat(_url.substr(8).replace('//', '/'));
                                    log.debug("Send To Determination", _url);

                                    var response = https.post({url: _url, headers: header, body: JSON.stringify(_valueObj)});
                                    if(response.code == 201)
                                    {
                                            log.debug("response POST", "Success " + response.code + " : " + response.body);
                                    }
                                    else
                                    {
                                            log.debug("response POST", response.code + " : " + response.body);

                                    }
                            }

                            if(response.code == 204 || response.code == 201)
                            {
                                    var _subsidiary = _itemLoad.getValue('custitem_avlr_integratedwithavatax');
                                    if(!_subsidiary)
                                    {
                                            _subsidiary = [];
                                            _subsidiary.push(_itemSearch.values.subsidiarynohierarchy.value)
                                    }
                                    else
                                    {
                                            var _index = _subsidiary.indexOf(_itemSearch.values.subsidiarynohierarchy.value);
                                            if(_index == -1)
                                                    _subsidiary.push(_itemSearch.values.subsidiarynohierarchy.value)
                                    }

                                    _itemLoad.setValue({fieldId: 'custitem_avlr_integratedwithavatax', value: _subsidiary});
                                    log.debug("Update Item", _itemLoad.save());
                            }

                            log.debug("end", "---------------------------------------------------------------------------------")
                            }
                    }
                    catch (e)
                    {
                            log.error('Map valueObj', _valueObj);

                            log.error('ERROR-map', JSON.stringify(e))
                    }
            }

            function getSourceItem(source)
            {
                    switch (source)
                    {
                            case "1": // Comprado
                                    return "0";
                            case "2": // Importado
                                    return "1";
                            case "3": // Importado Mercado Interno
                                    return "2";
                            case "4": // Nacional - Importação superior 40% e Inferior a 70%
                                    return "3";
                            case "5": // Nacional - Produzido conforme decreto
                                    return "4";
                            case "6": // Nacional - Importação inferior 40%
                                    return "5";
                            case "7": // Importado direto Camex
                                    return "6";
                            case "8": // Importado Mercado Interno Camex
                                    return "7";
                            case "9": // Nacional - mercadoria ou bem com conteúdo superior a 70%
                                    return "8";
                            default:
                                    return "0";
                    }
            }

            function getProductType(_productTypeId)
            {
                    switch (_productTypeId)
                    {
                            case "1":
                                    return "FOR PRODUCT";

                            case "2":
                                    return "FOR MERCHANDISE";

                            case "3":
                                    return "NO RESTRICTION";

                            case "4":
                                    return "SERVICE";

                            case "5":
                                    return "FEEDSTOCK";

                            case "6":
                                    return "FIXED ASSETS";

                            case "7":
                                    return "PACKAGING";

                            case "8":
                                    return "PRODUCT IN PROCESS";

                            case "9":
                                    return "SUBPRODUCT";

                            case "10":
                                    return "INTERMEDIATE PRODUCT";

                            case "11":
                                    return "MATERIAL FOR USAGE AND CONSUMPTION";

                            case "12":
                                    return "OTHER INPUTS";

                            default:
                                    return "FOR MERCHANDISE";
                    }
            }

            /**
             * Executes when the reduce entry point is triggered and applies to each group.
             *
             * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
             * @since 2015.1
             */
            function reduce(context)
            {

            }


            /**
             * Executes when the summarize entry point is triggered and applies to the result set.
             *
             * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
             * @since 2015.1
             */
            function summarize(summary)
            {
                    try
                    {
                            log.debug('summarize-end', "---------------------------------------------------------------------------------")
                    }
                    catch (e)
                    {
                            log.debug('ERROR-summarize', JSON.stringify(e))
                    }
            }

            return {
                    getInputData: getInputData,
                    map: map,
                    reduce: reduce,
                    summarize: summarize
            };

    });
