/**
 * @NScriptType ClientScript
 * @NApiVersion 2.0
 * @scriptName rsc-cnab-batch-cl
 */
define([ 'N/ui/dialog', 'N/runtime', 'N/currentRecord', './rsc-cnab-batch' ],

    /**
     *
     * @param dialog
     * @param runtime
     * @param currentRecord
     * @param lib
     * @return {{saveRecord: (function(*): boolean)}}
     */
    function( dialog, runtime, currentRecord, lib )
    {

        // Alterações por Miguel Buzato @ LaRCom Unicamp: adicionado field de página para paginação da sublista
        function pageInit(ctx) {
            document.lrc_page = 1;
            document.lrc_pages = 1;
            document.lrc_selected = {};
            document.lrc_deleted = {};

            document.lrc_page_set = function(page) {
                document.lrc_page = page;
                document.getElementById("lrc_cnab_pages").innerHTML = document.lrc_page + "/" + document.lrc_pages;

                var record = ctx.currentRecord;
                const numLines = record.getLineCount({ sublistId: 'list' });
                lib.clearInstallments( record, numLines );
                lib.getInstallments( null, null, null, null, null, null, null, record, document.lrc_page );
            };

            document.lrc_page_next = function() {
                if(document.lrc_page + 1 <= document.lrc_pages) {
                    document.lrc_page_set(document.lrc_page + 1);
                }
            };

            document.lrc_page_prev = function() {
                if(document.lrc_page - 1 > 0) {
                    document.lrc_page_set(document.lrc_page - 1);
                }
            };
        }

        /**
         * @function
         * @param context
         */
        function fieldChanged( context )
        {
            var record = currentRecord.get();
            if( context.fieldId === 'subsidiary' )
            {
                const subsidiaryId = record.getValue({ fieldId: 'subsidiary' });
                const bankAccountField = record.getField({ fieldId: 'custpage_bankaccount' });

                if( !lib.insertBankAccountOptions(subsidiaryId, bankAccountField) )
                {
                    lib.clearFieldOptions( bankAccountField );
                    lib.clearFieldOptions( record.getField({fieldId: 'custpage_layout'}) );
                }
            }
            else if( context.fieldId === 'custpage_bankaccount' )
            {
                const bankAccountId = record.getValue({ fieldId: 'custpage_bankaccount' });
                const layoutField = record.getField({ fieldId: 'custpage_layout' });
                lib.clearFieldOptions( layoutField );
                lib.insertLayoutOptions(bankAccountId, layoutField)
            }
            else if( context.fieldId === 'interest' || context.fieldId === 'fine' || context.fieldId === 'rebate' || context.fieldId === 'discount' )
            {
                lib.setAmount( record, context.line );
            }
        }

        /**
         * @function
         * @return {boolean}
         */
        function search()
        {
            var record = currentRecord.get();
            const startDate = record.getValue({ fieldId: 'startdate' });
            const endDate = record.getValue({ fieldId: 'enddate' });
            const status = record.getValue({ fieldId: 'status' });

            if( startDate && endDate && status )
            {
                const numLines = record.getLineCount({ sublistId: 'list' });
                lib.clearInstallments( record, numLines );
                document.lrc_selected = {};
                document.lrc_deleted = {};
                const bankAccount = record.getValue({ fieldId: 'custpage_bankaccount' });
                const vendor = record.getValue({ fieldId: 'vendor' });
                const customer = record.getValue({ fieldId: 'customer' });
                const layout = record.getValue({ fieldId: 'custpage_layout' });
                lib.getInstallments( startDate, endDate, status, bankAccount, vendor, customer, layout, record, -1 );
            }
            else
            {
                dialog.alert({
                    title: lib.label().alert,
                    message: lib.label().filtersMandatory
                });
                return false;
            }
        }

        /**
         * @function
         */
        function lineInit()
        {
            const record = currentRecord.get();
            const id = record.getCurrentSublistValue({ sublistId: 'list', fieldId: 'id' });
            if( id ) {
                document.getElementById('list_addedit').disabled = false;
                document.getElementById('list_insert').disabled = true;
            }
        }

        /**
         * @function
         */
        function sublistChanged(ctx)
        {
            document.getElementById('list_addedit').disabled = true;
            for(var l = 0; l < ctx.currentRecord.getLineCount("list"); l++) {
                document.lrc_selected[ctx.currentRecord.getSublistValue({
                    fieldId: "transactionid",
                    sublistId: "list",
                    line: l
                })] = ctx.currentRecord.getSublistValue({
                    fieldId: "select",
                    sublistId: "list",
                    line: l
                });
            }
        }

        /**
         * @function
         * @return {boolean}
         */
        function validateDelete()
        {
            // Alterações por Miguel Buzato @ LaRCom Unicamp: consertado deletar linhas
            if(document.lrc_cnab_clear) return true;
            
            const record = currentRecord.get();
            // Essa checagem nunca se torna positiva. Não entendi sua necessidade.
            // const _delete = record.getCurrentSublistValue({ sublistId: 'list', fieldId: 'delete' });

            var id = record.getCurrentSublistValue({
                sublistId: "list",
                fieldId: "transactionid"
            });

            document.lrc_deleted[id] = true;
            document.lrc_selected[id] = false;

            return true;
        }

        /**
         * @function
         * @return {boolean}
         */
        function validateInsert()
        {
            return false;
        }

        /**
         * @function
         */
        function selectAll()
        {
            const record = currentRecord.get();
            lib.markAll( record, true );

            Object.keys(document.lrc_selected).forEach(function(id) {
                document.lrc_selected[id] = true;
            });
        }

        /**
         * @function
         */
        function unselectAll()
        {
            const record = currentRecord.get();
            lib.markAll( record, false );

            Object.keys(document.lrc_selected).forEach(function(id) {
                document.lrc_selected[id] = false;
            });
        }

        // Alterações por Miguel Buzato @ LaRCom Unicamp: salvando dados de transações selecionadas
        function saveRecord(ctx) {
            if(document.lrc_selected != null) {
                ctx.currentRecord.setValue({
                    fieldId: "lrc_selected",
                    value: JSON.stringify({selected: document.lrc_selected, deleted: document.lrc_deleted})
                });
            }

            return true;
        }

        return {
            fieldChanged: fieldChanged,
            search: search,
            lineInit: lineInit,
            sublistChanged: sublistChanged,
            validateDelete: validateDelete,
            validateInsert: validateInsert,
            selectAll: selectAll,
            unselectAll: unselectAll,
            pageInit: pageInit,
            saveRecord: saveRecord
        }
    });
