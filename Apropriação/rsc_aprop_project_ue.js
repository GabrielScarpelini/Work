/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} context
         * @param {Record} context.newRecord - New record
         * @param {Record} context.oldRecord - Old record
         * @param {string} context.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (context) => {
            log.audit({title: 'Context Value', details: context.oldRecord});
            /*Valida apenas se permanece o valor do campo igual. */
            context.newRecord.setValue('custentity_rsc_aprop_subsidiaria', context.newRecord.getValue('subsidiary'));
            if (context.newRecord.getValue('custentity_rsc_term_cl_suspensiva') == null){
                var data = new Date(context.newRecord.getValue('custentity_rsc_inicio_venda'));
                data.setDate(data.getDate() + 180);
                context.newRecord.setValue('custentity_rsc_term_cl_suspensiva',  data);
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {


        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
