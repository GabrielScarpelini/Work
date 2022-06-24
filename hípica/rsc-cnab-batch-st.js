/**
 * @NScriptType suitelet
 * @NApiVersion 2.0
 * @scriptName rsc-cnab-batch-st
 */
define([ 'N/ui/serverWidget', './rsc-cnab-batch', 'N/task' ],

    function( ui, lib, task )
    {
        function onRequest(context)
        {
            var assistant = ui.createAssistant({ title: lib.label().title });
            assistant.clientScriptModulePath = './rsc-cnab-batch-cl.js';
            var bankData = assistant.addStep({ id: 'bankdata', label: lib.label().bankData });
            var installments = assistant.addStep({ id: 'installments', label: lib.label().installments });
            assistant.addStep({ id: 'generation', label: lib.label().generation });
            assistant.errorHtml = null;

            var writeBankData = function()
            {
                var sub = assistant.addField({ id:'subsidiary', type:'select', label:lib.label().subsidiary, source:'subsidiary' });
                sub.isMandatory = true;
                var ba = assistant.addField({ id:'custpage_bankaccount', type:'select', label:lib.label().bankAccount });
                ba.isMandatory = true;
                var la = assistant.addField({ id:'custpage_layout', type:'select', label:'Layout' });
                la.isMandatory = true;

                if( assistant.getLastStep() && assistant.getLastStep().id === 'installments' )
                {
                    var params = context.request.parameters;
                    sub.defaultValue = params.subsidiary;
                    lib.addBankAccountOptions( params.subsidiary, ba );
                    lib.addLayoutOptions( params.custpage_bankaccount, la );
                }
                else
                {
                    sub.defaultValue = '';
                }
            };

            var writeInstallments = function()
            {
                var params = context.request.parameters;

                /** Batch Data Group */
                assistant.addFieldGroup({ id:'batchdata', label:lib.label().batchData });
                var pd = assistant.addField({ id:'paymentdate', type:'date', label:lib.label().paymentDate, container: 'batchdata' });
                pd.isMandatory = true;
                pd.defaultValue = '';

                /** Filters Group */
                assistant.addFieldGroup({ id:'filters', label:lib.label().filters });
                var sd = assistant.addField({ id:'startdate', type:'date', label:lib.label().startDate, container: 'filters' });
                sd.defaultValue = '';
                var ed = assistant.addField({ id:'enddate', type:'date', label:lib.label().endDate, container: 'filters' });
                ed.defaultValue = '';
                var s = assistant.addField({ id:'status', type:'select', label:'Status', source:'customlist_rsc_cnab_status', container: 'filters' });
                s.defaultValue = '';
                var vendor = assistant.addField({ id:'vendor', type:'select', label:lib.label().vendor, source:'vendor', container: 'filters' });
                vendor.updateBreakType({ breakType: ui.FieldBreakType.STARTCOL });
                vendor.defaultValue = '';
                var c = assistant.addField({ id:'customer', type:'select', label:lib.label().customer, source:'customer', container: 'filters' });
                c.defaultValue = '';

                // Alterações por Miguel Buzato @ LaRCom Unicmap: adicionado field de página para paginação da sublista
                assistant.addField({
                    id: "page",
                    type: "INLINEHTML",
                    label: "Página",
                    container: "filters"
                }).defaultValue = "<p style='margin:16px 0;font-size:16px;'><a style='font-weight:bold;text-decoration:none;background-color: #F2F2F2;border: 1px gray solid;border-radius: 3px;padding: 0px 6px;' href='javascript:document.lrc_page_prev()'>\<</a> <span id='lrc_cnab_pages'>1/1</span> <a style='font-weight:bold;text-decoration:none;background-color: #F2F2F2;border: 1px gray solid;border-radius: 3px;padding: 0px 6px;' href='javascript:document.lrc_page_next()'>\></a>    <span style='font-size:10px;' id='lrc_cnab_total'>(Total: 0)</span></p>";

                assistant.addField({
                    id: "lrc_selected",
                    type: "TEXTAREA",
                    label: "Selecionados",
                }).updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});

                /** Sublist */
                var type = lib.getRecordTypes( params.custpage_layout );
                var list = assistant.addSublist({ id: 'list', label: lib.label().inst, type: ui.SublistType.INLINEEDITOR });
                list.addField({ id:'select', type:'checkbox', label:lib.label().select });
                list.addField({ id:'id', type:'text', label:'Installment Id' }).updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addField({ id:'tranid', type:'text', label:lib.label().tranId }).updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'entitytext', type:'text', label:lib.label().entity }).updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'entity', type:'text', label:lib.label().entity }).updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addField({ id:'method', type:'text', label:lib.label().method, source:'customrecord_rsc_cnab_paymentmethod' }).
                updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addField({ id:'methodtext', type:'text', label:lib.label().method, source:'customrecord_rsc_cnab_paymentmethod' }).
                updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'installment', type:'text', label:lib.label().instNu }).updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'duedate', type:'date', label:lib.label().dueDate }).updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'statusins', type:'select', label:'Status', source:'customlist_rsc_cnab_status' }).
                updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'interest', type:'currency', label:lib.label().interest });
                list.addField({ id:'fine', type:'currency', label:lib.label().fine });
                list.addField({ id:'rebate', type:'currency', label:lib.label().rebate });
                list.addField({ id:'discount', type:'currency', label:lib.label().discount });
                list.addField({ id:'amount', type:'currency', label:lib.label().amount }).updateDisplayType({ displayType : ui.FieldDisplayType.DISABLED });
                list.addField({ id:'delete', type:'checkbox', label:'delete' }).updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addField({ id:'origin', type:'currency', label:'origin' }).updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addField({ id:'transactionid', type:'text', label:'Transaction Id' }).updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                list.addButton({ id:'search', label:lib.label().search, functionName:'search' });
                list.addButton({ id:'selectall', label:lib.label().selectAll, functionName:'selectAll' });
                list.addButton({ id:'unselectall', label:lib.label().unselectAll, functionName:'unselectAll' });

                var subHidden = assistant.addField({ id:'subsidiary', type:'text', label:'Subsidiary' });
                subHidden.defaultValue = params.subsidiary;
                subHidden.updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                var baHidden = assistant.addField({ id:'custpage_bankaccount', type:'text', label:'Bank Account' });
                baHidden.defaultValue = params.custpage_bankaccount;
                baHidden.updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                var lHidden = assistant.addField({ id:'custpage_layout', type:'text', label:'Layout' });
                lHidden.defaultValue = params.custpage_layout;
                lHidden.updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
                var pHidden = assistant.addField({ id:'recordtype', type:'text', label:'Record Type' });
                pHidden.defaultValue = JSON.stringify(type);
                pHidden.updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });
            };

            var writeGeneration = function( installmentsObj )
            {
                var layoutId = context.request.parameters.custpage_layout;
                var bankAccountId = context.request.parameters.custpage_bankaccount;
                var layout = lib.getLayout( layoutId );
                var controllerId = lib.createController( installmentsObj, layout );
                //lib.generateOurNumber( bankAccountId, installmentsObj, layout );

                for( var key in installmentsObj )
                {
                    installmentsObj[ key ].controller = {};
                    installmentsObj[ key ].controller = controllerId;
                }

                var output = lib.getLink( controllerId, lib.label().controller+' #'+controllerId, 'customrecord_rsc_cnab_controller' );
                assistant.addField({ id:'message1', type:'inlinehtml', label:'Message1' }).defaultValue =
                    '<p style="font-size:15px;">'+lib.label().message1+'</p>';
                assistant.addField({ id:'message2', type:'inlinehtml', label:'Message2' }).defaultValue =
                    '<p style="font-size:15px;">'+lib.label().message2+'</p>';
                assistant.addField({ id:'link', type:'inlinehtml', label:'Link' }).defaultValue = '<p style="font-size:15px;">'+output+'</p>';

                var cHidden = assistant.addField({ id:'controller', type:'text', label:'Controller' });
                cHidden.defaultValue = controllerId;
                cHidden.updateDisplayType({ displayType : ui.FieldDisplayType.HIDDEN });

                task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_rsc_cnab_batch_mr',
                    deploymentId: 'customdeploy_rsc_cnab_batch_mr',
                    params: { custscript_rsc_cnab_batchdata_ds: JSON.stringify(installmentsObj) }
                }).submit();
            };

            var writeResult = function()
            {
                const controllerId = context.request.parameters.controller;
                context.response.sendRedirect({
                    type: 'RECORD',
                    identifier: 'customrecord_rsc_cnab_controller',
                    id: Number(controllerId)
                });
            };

            var writeCancel = function()
            {
                context.response.write( lib.label().cancelled );
            };

            if( context.request.method === 'GET' )
            {
                writeBankData();
                assistant.currentStep = bankData;
                context.response.writePage( assistant )
            }
            else if( context.request.parameters.next === 'Finish' )
            {
                writeResult();
            }
            else if( context.request.parameters.cancel )
            {
                writeCancel();
            }
            else if( assistant.getNextStep().id === 'installments' )
            {
                if( assistant.getLastStep().id === 'generation' )
                {
                    writeBankData();
                    assistant.currentStep = bankData;
                }
                else
                {
                    writeInstallments();
                    assistant.currentStep = assistant.getNextStep();
                }
                context.response.writePage( assistant );
            }
            else if( assistant.getNextStep().id === 'generation' )
            {
                var inst = lib.getInstallmentsList( context.request );
                if( inst.hasInstallments && !inst.hasDiferent )
                {
                    writeGeneration( inst.installments );
                    assistant.currentStep = assistant.getNextStep();
                }
                else
                {
                    writeInstallments();
                    if( inst.hasDiferent ) {
                        assistant.errorHtml = '<p style="font-size:15px;">'+lib.label().statusDif+'</p>';
                    } else {
                        assistant.errorHtml = '<p style="font-size:15px;">'+lib.label().noInstallments+'</p>';
                    }
                    assistant.currentStep = installments;
                }
                context.response.writePage( assistant );
            }
            else
            {
                writeBankData();
                assistant.currentStep = assistant.getNextStep();
                context.response.writePage( assistant );
            }
        }

        return {
            onRequest: onRequest
        };
    });
