function DemoAssistant(request, response) {
    try {
        //create an object (nlobjassistant) and store that in ‘assistant’ variable
        var assistant = nlapiCreateAssistant("Employee Registration Form");

        //set title of the assistant
        assistant.setTitle('Employee Details');

        // indicate that all steps must be completed sequentially
        assistant.setOrdered(true);

        //adding steps
        assistant.addStep('PersonalDetails', 'Set Personal Details').setHelpText("Enter your personal details");
        assistant.addStep('ContactDetails', 'Enter Contacts Details').setHelpText("Enter your contact details");
        assistant.addStep('EmployementDetails', 'Enter Employement Details').setHelpText("Enter your employement details");
        assistant.addStep('Finished', 'Registration Completed');

        //setting actions
        if (request.getMethod() == 'GET') {

            if (!assistant.isFinished()) {

                if (assistant.getCurrentStep() == null) {

                    assistant.setCurrentStep(assistant.getStep("PersonalDetails"));

                    //add splash screen
                    assistant.setSplash("Welcome!", "Enter your details");

                }

                var step = assistant.getCurrentStep();

                //display part
                if (step.getName() == 'PersonalDetails') {

                    assistant.addField("custpage_firstname", "text", "First Name");
                    assistant.addField("custpage_lastname", "text", "Last Name");

                }

                else if (step.getName() == 'ContactDetails') {

                    assistant.addField("custpage_phone", "phone", "Phone");
                    assistant.addField("custpage_email", "email", "E-mail");
                    assistant.addField("custpage_address", "textarea", "Address");

                }

                else if (step.getName() == 'EmployementDetails') {

                    assistant.addField("custpage_empid", "text", "Employee ID");
                    assistant.addField("custpage_companyname", "text", "Company Name");

                }

                else if (step.getName() == 'Finished') {

                    var personalDetails = assistant.getStep('PersonalDetails');
                    var contactDetails = assistant.getStep('ContactDetails');
                    var employementDetails = assistant.getStep('EmployementDetails');

                    //fetching values from previous steps
                    var firstName = personalDetails.getFieldValue('custpage_firstname');
                    var lastName = personalDetails.getFieldValue('custpage_lastname');

                    var phone = contactDetails.getFieldValue('custpage_phone');
                    var email = contactDetails.getFieldValue('custpage_email');
                    var address = contactDetails.getFieldValue('custpage_address');

                    var empId = employementDetails.getFieldValue('custpage_empid');
                    var companyName = employementDetails.getFieldValue('custpage_companyname');

                    //displaying
                    assistant.addField('custpage_displayfirstname', 'Label', "First Name : " + firstName);
                    assistant.addField('custpage_displaylastname', 'Label', "Last Name : " + lastName);
                    assistant.addField('custpage_displayphone', 'Label', "Phone : " + phone);
                    assistant.addField('custpage_displayemail', 'Label', "Email : " + email);
                    assistant.addField('custpage_displayaddress', 'Label', "Address : " + address);
                    assistant.addField('custpage_displayempid', 'Label', "Employee ID : " + empId);
                    assistant.addField('custpage_displaycompanyname', 'Label', "Company Name : " + companyName);

                    assistant.addField('custpage_displaymessage', 'Label', "Click Finish to submit");

                }

            }

            //writing to page
            response.writePage(assistant);

        }

        else {

            if (assistant.getLastAction() == "finish") {
                assistant.setFinished("You have completed");
                assistant.sendRedirect(response);
            }

            else {
                assistant.setCurrentStep(assistant.getNextStep());
                assistant.sendRedirect(response);
            }

        }

        //writing to page
        response.writePage(assistant);

    }

    catch (er) {

        nlapiLogExecution('DEBUG','Error',er.message);

    }

}
