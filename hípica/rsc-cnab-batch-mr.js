/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @scriptName rsc-cnab-batch-mr
 */
define([ 'N/record', 'N/log', 'N/runtime', './rsc-cnab-batch', 'N/error', './rsc-cnab-batch-file' ],
    /**
     *
     * @param record
     * @param log
     * @param runtime
     * @param lib
     * @param Nerror
     * @param file
     * @return {{getInputData: getInputData, summarize: summarize, map: map}}
     */
    function( record, log, runtime, lib, Nerror, file )
    {
        /**
         * @function getInputData - get the expense report list to be processed
         * @return {Object}
         */
        function getInputData()
        {
            try
            {
                const script = runtime.getCurrentScript();
                const installments = script.getParameter({ name:'custscript_rsc_cnab_batchdata_ds' });
                log.debug( 'getInputData', installments );
                return JSON.parse( installments );

            } catch (e) {
                throw 'MR.getInputData: '+e;
            }
        }

        /**
         * @function
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         */
        function map( context )
        {
            var installment = JSON.parse( context.value );
            var id = context.key;
            log.audit('ID', id )
            log.audit('INSTALMENT', installment )

            try
            {
                var transaction = record.load({ type: installment.transactionType, id: installment.transaction, isDynamic: true });
                var line = transaction.findSublistLineWithValue({ sublistId: 'installment', fieldId: 'id', value: id });
                log.audit('transaction', transaction)
                log.audit('line', line)
                if( line > -1 )
                {
                    lib.setInstallmentValue( transaction, installment, line );
                    var values = lib.getInstallmentValue( transaction, line, id, installment.entityType, installment.layout );
                    lib.updateSequentialBank( values.custrecord_rsc_cnab_inst_locationba_ls.bankId );
                    values.controller = installment.controller;
                    values.layout = installment.layout;
                    values.transaction = installment.transaction;
                    values.cnabType = installment.cnabType;
                    context.write({ key: id, value: values });
                    log.audit("LOG IF", 123)
                }

            } catch( e ) {
                log.error( 'map', 'installment id: ' + id + ' -- error: ' + e );
                throw Nerror.create({ name: installment.controller, message: e });
            }
        }

        /**
         * @function
         * @param context
         */
        function summarize( context )
        {
            var errors = [];
            var controllerId = 0;
            var installments = {};
            var segments = [];
            var layout = 0;
            var folder = 0;
            var fileId = undefined;
            /** Errors Iterator */
            context.mapSummary.errors.iterator().each( function( key, error )
            {
                var e = JSON.parse( error );
                controllerId = e.name;
                errors.push( key );
                return true;
            });
            /** Output Iterator */
            context.output.iterator().each( function( key, value )
            {
                installments[ key ] = {};
                installments[ key ] = JSON.parse( value );
                controllerId = installments[ key ].controller;
                layout = installments[ key ].layout;
                folder = installments[ key ].custrecord_rsc_cnab_inst_locationba_ls.folder;
                lib.includeSegmentType( segments, installments[ key ].custrecord_rsc_cnab_inst_paymentmetho_ls.segment );
                return true;
            });
            /** Create File */
            if( Object.getOwnPropertyNames(installments).length > 0 )
            {
                var _segments = lib.getSegments( layout, lib.filterSegmentType( segments ) );
                var fileContent = file.buildFile( _segments, installments );
                fileId = lib.createFile( fileContent, folder );
            }
            /** Update Controller */
          	log.audit( 'logController', controllerId );
            lib.updateController( controllerId, errors, fileId );
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        };
    });
