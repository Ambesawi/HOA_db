/*==============================================================================
 * (C) Copyright 2015,2020 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version
 * 2016-05-19 JJK   Modified to get the country web site URL's from config
 * 2016-06-05 JJK   Split Edit modal into 1 and 2Col versions
 * 2016-06-09 JJK	Added duesStatementNotes to the individual dues
 * 					statement and adjusted the format
 * 2016-06-24 JJK	Working on adminExecute (for yearly dues statement)
 * 2016-07-01 JJK	Got progress bar for adminExecute working by moving loop
 * 					processing into an asynchronous recursive function.
 * 2016-07-13 JJK   Finished intial version of yearly dues statements
 * 2016-07-14 JJK   Added Paid Dues Counts report
 * 2016-07-28 JJK	Corrected compound interest problem with a bad start date
 * 					Added print of LienComment after Total Due on Dues Statement
 * 2016-07-30 JJK   Changed the Yearly Dues Statues to just display prior
 * 					years due messages instead of amounts.
 * 					Added yearlyDuesStatementNotice for 2nd notice message.
 * 					Added DateDue to CSV for reports
 * 2016-08-19 JJK	Added UseMail to properties and EmailAddr to owners
 * 2016-08-20 JJK	Implemented email validation check
 * 2016-08-26 JJK   Went live, and Paypal payments working in Prod!!!
 * 2017-08-13 JJK	Added a dues email test function, and use of payment
 * 					email for dues statements
 * 2017-08-18 JJK   Added an unsubscribe message to the dues email
 * 2017-08-19 JJK   Added yearly dues statement notice and notes different
 * 					for 1st and Additional notices
 * 2017-08-20 JJK   Added Mark notice mailed function and finished up
 *                  Email logic.
 * 					Added logic to set NoticeDate
 * 2018-01-21 JJK	Corrected set of default firstNotice to false (so 2nd
 * 					notices would correctly use the alternate notes)
 * 2018-10-14 JJK   Re-factored for modules
 * 2018-11-03 JJK   Got update Properties working again with JSON POST
 * 2018-11-04 JJK   (Jackson's 16th birthday)
 * 2018-11-17 JJK   To solve the async loop issue I modified AdminRequest to
 *                  do all data queries in the PHP module and pass back a
 *                  large array of data to process in a sync loop
 * 2018-11-25 JJK   Renamed to pdfModule and implemented configuration object
 *                  rather than global variables (to solve email issue)
 * 2018-11-26 JJK   Implemented error handling and logging for failed
 *                  email sends
 * 2019-09-14 JJK   Added a FirstNoticeCheckbox for explicit designation
 *                  of 1st or Additional notices.  Pass along and use in
 *                  the functions instead of comparing array count with
 *                  total number of properties
 * 2019-09-22 JJK   Checked logic for dues emails and communications
 * 2020-02-15 JJK   For the dues emails, adding display list of records
 *                  (for both test and real) to confirm logic
 *                  Fixed the bug that was getting string 'false' value
 *                  instead of boolean false
 *
 * 2020-08-03 JJK   Re-factored for new error handling
 * 2020-08-10 JJK   Added some validation checks (Dad's 80th birthday)
 * 2020-08-29 JJK   Modified the dues email send to be individual request
 * 2020-09-25 JJK   Added Payment Reconciliation function
 * 2020-09-30 JJK   Added logic to save, update, and re-display paymentList
 * 2020-10-01 JJK   Added SalesUpload, and made upload file generic
 * 2020-10-28 JJK   Re-did Dues Email logic using Communication records
 * 2020-12-24 JJK   Added SalesDownload to get file from County site
 * 2021-04-24 JJK   Modified sales file upload from ajax to fetch
*============================================================================*/
var admin = (function () {
    'use strict';  // Force declaration of variables before use (among other things)

    //=================================================================================================================
    // Private variables for the Module
    var paymentList = null;
    var commList = null;

    //=================================================================================================================
    // Variables cached from the DOM
    var $document = $(document);
    var $moduleDiv = $('#AdminPage');
    var $ajaxError = $moduleDiv.find(".ajaxError");
    // Figure out a better way to do this
    var $DuesAmt = $moduleDiv.find("#DuesAmt");
    var $FiscalYear = $moduleDiv.find("#FiscalYear");
    var $ConfirmationModal = $document.find("#ConfirmationModal");
    var $FileUploadModal = $document.find("#FileUploadModal");
    var $FileUploadForm = $document.find("#FileUploadForm");
    var $FileUploadTitle = $document.find("#FileUploadTitle");
    var $ConfirmationButton = $ConfirmationModal.find("#ConfirmationButton");
    var $ConfirmationMessage = $ConfirmationModal.find("#ConfirmationMessage");
    var $AdminResults = $moduleDiv.find("#AdminResults");
    var $ResultMessage = $moduleDiv.find("#ResultMessage");
    var $FirstNoticeCheckbox = $moduleDiv.find("#FirstNoticeCheckbox");
    var $DuesButtons = $moduleDiv.find("#DuesButtons");
    var $DuesListDisplay = $moduleDiv.find("#DuesListDisplay tbody");
    //var $SalesDownload = $moduleDiv.find("#SalesDownload");

    //=================================================================================================================
    // Bind events
    $moduleDiv.on("click", ".AdminButton", _adminRequest);
    $moduleDiv.on("click", ".AdminExecute", _adminExecute);
    $ConfirmationButton.on("click", "#AdminExecute", _adminExecute);
    $FileUploadModal.on("submit", "#FileUploadForm", _handleFileUpload);
    $moduleDiv.on("click", ".LogPayment", _logPayment);
    $moduleDiv.on("click", "#DuesEmails", _duesEmailsButtons);

    // 2020-12-24 Can't figure out how to wait until the config values are set before trying to set the HREF
    //var currYear = new Date().getFullYear();
    //var downloadURL = config.getVal('countySalesDataUrl') + currYear + '.ZIP';
    //$SalesDownload.attr("href", downloadURL);

    //=================================================================================================================
    // Module methods
    function _adminRequest(event) {
        //console.log("in _adminRequest");

        // Validate add assessments (check access permissions, timing, year, and amount)
        // get confirmation message back
        var fy = util.cleanStr($FiscalYear.val());
        var duesAmt = util.cleanStr($DuesAmt.val());
        var action = event.target.getAttribute('id');
        $.getJSON("adminValidate.php", "action=" + action +
            "&fy=" + fy +
            "&duesAmt=" + duesAmt, function (adminRec) {
            $ConfirmationMessage.html(adminRec.message);

            $ConfirmationButton.empty();
            var buttonForm = $('<form>').prop('class', "form-inline").attr('role', "form");
            // If the action was Valid, append an action button
            if (adminRec.result == "Valid") {
                if (action == "PaymentReconcile" || action == "SalesUpload") {
                    if (action == "PaymentReconcile") {
                        $FileUploadTitle.html('Payment Reconciliation CSV');
                    } else if (action == "SalesUpload") {
                        $FileUploadTitle.html('County Sales ZIP file');
                    }
                    // Set the action as a class on the upload form and display the modal
                    $FileUploadForm.attr("class", action);
                    $FileUploadModal.modal();
                } else {
                    buttonForm.append($('<button>')
                        .prop('id', "AdminExecute")
                        .prop('class', "btn btn-sm btn-danger m-1")
                        .attr('type', "button")
                        .attr('data-dismiss', "modal").html('Continue')
                        .attr('data-action', action)
                        .attr('data-fy', fy)
                        .attr('data-duesAmt', duesAmt));

                    buttonForm.append($('<button>').prop('class', "btn btn-sm btn-info m-1").attr('type', "button").attr('data-dismiss', "modal").html('Close'));
                    $ConfirmationButton.append(buttonForm);
                    $ConfirmationModal.modal();
                }
            } else {
                buttonForm.append($('<button>').prop('class', "btn btn-sm btn-info m-1").attr('type', "button").attr('data-dismiss', "modal").html('Close'));
                $ConfirmationButton.append(buttonForm);
                $ConfirmationModal.modal();
            }
        });
    }

    function _duesEmailsButtons(event) {
        $AdminResults.html("Dues Notice Emails");
        $ResultMessage.html("");

        $DuesButtons.empty();
        $DuesListDisplay.empty();

                $DuesButtons.append($('<a>')
                    .prop('id', "DuesEmailsCreateList")
                    .attr('href', "#")
                    .attr('class', "btn btn-primary mr-2 AdminExecute")
                    .attr('data-action', "DuesEmailsCreateList")
                    .attr('role', "button")
                    .html("Create List"))

                    .append($('<a>')
                        .prop('id', "DuesEmailsCheckList")
                        .attr('href', "#")
                        .attr('class', "btn btn-primary mr-2 AdminExecute")
                        .attr('data-action', "DuesEmailsCheckList")
                        .attr('role', "button")
                        .html("Check List"))

                    .append($('<a>')
                        .prop('id', "DuesEmailsSendList")
                        .attr('href', "#")
                        .attr('class', "btn btn-primary AdminExecute")
                        .attr('data-action', "DuesEmailsSendList")
                        .attr('role', "button")
                        .html("Send Emails"));
    }

    // Respond to the Continue click for an Admin Execute function
    function _adminExecute(event) {
            $DuesListDisplay.empty();
            $ResultMessage.html("Executing Admin request...(please wait)");
            var action = event.target.getAttribute("data-action");
            //console.log("in adminExecute, action = " + action);

            // Get all the data needed for processing
            $.getJSON("adminExecute.php", "action=" + action +
                "&fy=" + event.target.getAttribute("data-fy") +
                "&duesAmt=" + event.target.getAttribute("data-duesAmt") +
                "&parcelId=" + event.target.getAttribute("data-parcelId")
                , function (adminRec) {

                $ResultMessage.html(adminRec.message);

                if (action.startsWith('DuesEmails')) {
                    commList = adminRec.commList;
                    _duesEmailListDisplay();
                }
            });
    }

    function _duesEmailListDisplay() {
        $DuesListDisplay.empty();

        $.each(commList, function (index, commRec) {
            var tr = '';
            if (index == 0) {
                $('<tr class="small">')
                    .append($('<th>').html('Cnt'))
                    .append($('<th>').html('Test'))
                    .append($('<th>').html('Timestamp'))
                    .append($('<th>').html('Parcel Id'))
                    .append($('<th>').html('Name'))
                    .append($('<th>').html('Type'))
                    .append($('<th>').html('Email'))
                    .appendTo($DuesListDisplay);
            }

            tr = $('<tr class="small">');
            tr.append($('<td>').html(index+1))

            tr.append($('<td>')
                .append($('<a>')
                    .attr('href', "#")
                    .attr('class', "btn btn-sm btn-danger AdminExecute")
                    .attr('data-parcelId', commRec.Parcel_ID)
                    .attr('data-action', "DuesEmailsTest")
                    .attr('role', "button")
                    .html("Test"))
            );

            tr.append($('<td>').html(commRec.LastChangedTs))
            tr.append($('<td>')
                .append($('<a>')
                    .attr('class', "DetailDisplay")
                    .attr('data-parcelId', commRec.Parcel_ID)
                    .attr('href', "#")
                    .html(commRec.Parcel_ID))
            );
            tr.append($('<td>').html(commRec.Mailing_Name))
            tr.append($('<td>').html(commRec.CommType))
            tr.append($('<td>').html(commRec.EmailAddr))

            tr.appendTo($DuesListDisplay);

        }); // End of loop through Parcels

    }


        /*
    function _duesNotices(hoaRecList,firstNotice) {
        var adminEmailSkipCnt = 0;
        var duesNoticeCnt = 0;
        var displayAddress = '';
        var commType = 'Dues Notice';
        var commDesc = '';
        var noticeType = "1st";
        if (!firstNotice) {
            noticeType = 'Additional';
        }

        // Create a pdfRec and initialize the PDF object
        var pdfRec = pdfModule.init('Member Dues Notice');

        //console.log("_duesNotices, Before adminLoop, hoaRecList.length = " + hoaRecList.length);
        $ResultMessage.html("Executing Admin request...(processing list)");

        $.each(hoaRecList, function (index, hoaRec) {
            //console.log(index + ", ParcelId = " + hoaRec.Parcel_ID + ", OwnerID = " + hoaRec.ownersList[0].OwnerID + ", Owner = " + hoaRec.ownersList[0].Owner_Name1 + ", hoaRec.DuesEmailAddr = " + hoaRec.DuesEmailAddr);
            // When generating DuesNotices for the 1st notice, skip the ones with Property UseEmail set (if there is a valid email)
            if (firstNotice && hoaRec.UseEmail && hoaRec.DuesEmailAddr != '') {
                adminEmailSkipCnt++;
            } else {
                duesNoticeCnt++;
                if (index > 0) {
                    // If not the first record for DuesNotices, then add a new page for the next parcel
                    pdfRec = pdfModule.addPage(pdfRec);
                }
                // Call function to format the yearly dues statement for an individual property
                pdfRec = pdfModule.formatYearlyDuesStatement(pdfRec, hoaRec, firstNotice);

                // Get a displayAddress for the Communication record
                displayAddress = hoaRec.Parcel_Location;
                if (hoaRec.ownersList[0].AlternateMailing) {
                    displayAddress = hoaRec.ownersList[0].Alt_Address_Line1;
                }
                commDesc = noticeType + " Notice for postal mail created for " + displayAddress;
                // log communication for notice created
                communications.LogCommunication(hoaRec.Parcel_ID, hoaRec.ownersList[0].OwnerID, commType, commDesc);
            }
        }); // End of loop through Parcels

        $("#ResultMessage").html("Yearly dues notices created, total = " + duesNoticeCnt + ", (Total skipped for UseEmail = " + adminEmailSkipCnt + ")");
        // Download the PDF file
        pdfRec.pdf.save(util.formatDate() + "-YearlyDuesNotices.pdf");
    }

    function _markMailed(hoaRecList,firstNotice) {
        var adminEmailSkipCnt = 0;
        var markMailedCnt = 0;
        var displayAddress = '';
        var commType = 'Dues Notice';
        var commDesc = '';

        $ResultMessage.html("Executing Admin request...(processing list)");

        $.each(hoaRecList, function (index, hoaRec) {
            if (firstNotice && hoaRec.UseEmail && hoaRec.DuesEmailAddr != '') {
                adminEmailSkipCnt++;
            } else {
                markMailedCnt++;
                // Get a displayAddress for the Communication record
                displayAddress = hoaRec.Parcel_Location;
                if (hoaRec.ownersList[0].AlternateMailing) {
                    displayAddress = hoaRec.ownersList[0].Alt_Address_Line1;
                }

                commDesc = "Notice for postal mail mailed for " + displayAddress;
                // log communication for notice created
                communications.LogCommunication(hoaRec.Parcel_ID, hoaRec.ownersList[0].OwnerID, commType, commDesc);
            }

        }); // End of loop through Parcels

        $ResultMessage.html("Postal dues notices marked mailed, total = " + markMailedCnt + ", (Total skipped for UseEmail = " + adminEmailSkipCnt + ")");
    }
    */


    function _handleFileUpload(event) {
        // Prevent the event from trying to execute the form action
        event.preventDefault();

        $ResultMessage.html("Executing request...(please wait)");

        var fileUploadForm = document.getElementById('FileUploadForm');
        if (fileUploadForm.classList.contains('PaymentReconcile')) {
            //console.log("in _handleFileUplodad, action = PaymentReconcile");
            _paymentReconcile(fileUploadForm);
        } else if (fileUploadForm.classList.contains('SalesUpload')) {
            //console.log("in _handleFileUplodad, action = SalesUpload");
            _salesUpload(fileUploadForm);
        }
    }

    function _salesUpload(fileUploadForm) {
        $ResultMessage.html("Processing sales file...");
        $FileUploadModal.modal('hide');

        // Call service to upload the sales file and compare with database records
        var url = 'salesUpload.php';
        fetch(url, {
            method: 'POST',
            body: new FormData(fileUploadForm)
        })
        .then(response => response.json())
        .then(adminRec => {
            $ResultMessage.html(adminRec.message);
        })
        .catch(error => {
            console.error('Error in request to '+url, error);
        });
    }

    function _paymentReconcile(fileUploadForm) {
        $FileUploadModal.modal('hide');

        // Call service to upload the payments file and compare with database records
        var url = 'paymentUpload.php';
        $.ajax(url, {
            type: 'POST',
            data: new FormData(fileUploadForm),
            contentType: false,
            cache: false,
            processData: false,
            dataType: 'json'
            //dataType: "html"
        }).done(function (result) {
            //console.log("result = " + result);
            if (result.error) {
                console.log("error = " + result.error);
                $ajaxError.html("<b>" + result.error + "</b>");
            } else {
                var adminRec = result
                paymentList = adminRec.paymentList;
                _paymentReconcileDisplay(adminRec.message);
            }
        }).fail(function (xhr, status, error) {
            console.log('Error in AJAX request to ' + url + ', status = ' + status + ', error = ' + error)
            $ajaxError.html("<b>" + "Error in request" + "</b>");
        })
    }

    function _paymentReconcileDisplay(message) {
        $ResultMessage.html(message);
        $DuesListDisplay.empty();
        $.each(paymentList, function (index, paymentRec) {
            //console.log("***** " + index + ", trans = " + paymentRec.txn_id + ", date = " + paymentRec.payment_date);
            var tr = '';
            if (index == 0) {
                $('<tr>')
                    .append($('<th>').html('Cnt'))
                    .append($('<th>').html('Transaction Id'))
                    .append($('<th>').html('Payment Date'))
                    .append($('<th>').html('Logged'))
                    .append($('<th>').html('PAID'))
                    .append($('<th>').html('Email'))
                    .append($('<th>').html('Parcel Id'))
                    .append($('<th>').html('Name'))
                    .append($('<th>').html('From Email'))
                    .appendTo($DuesListDisplay);

                $("#ResultMessage").html("# of payments = <b>" + paymentList.length + "</b>, Fiscal Year = <b>" + paymentRec.FY
                                            + "</b>, Dues Amt = <b>" + paymentRec.DuesAmt+"</b> "+message);
            }

            tr = $('<tr class="small">');
            tr.append($('<td>').html(index+1))
            tr.append($('<td>').html(paymentRec.txn_id))
            tr.append($('<td>').html(paymentRec.payment_date))

            if (paymentRec.TransLogged) {
                tr.append($('<td>').html(util.setBoolText(paymentRec.TransLogged)))
            } else {
                tr.append($('<td>')
                    .append($('<a>')
                        .attr('data-index', index)
                        .attr('data-parcelId', paymentRec.Parcel_ID)
                        .attr('data-ownerId', paymentRec.OwnerID)
                        .attr('data-fy', paymentRec.FY)
                        .attr('data-txn_id', paymentRec.txn_id)
                        .attr('data-payment_date', paymentRec.payment_date)
                        .attr('data-fromEmail', paymentRec.fromEmail)
                        .attr('data-gross', paymentRec.gross)
                        .attr('data-fee', paymentRec.fee)
                        .attr('href', "#")
                        .attr('class', "btn btn-success btn-sm LogPayment")
                        .attr('role', "button")
                        .html("Log"))
                );
            }

            if (paymentRec.MarkedPaid) {
                tr.append($('<td>').html(util.setBoolText(paymentRec.MarkedPaid)))
            } else {
                tr.append($('<td>')
                    .append($('<a>')
                        .attr('data-index', index)
                        .attr('data-parcelId', paymentRec.Parcel_ID)
                        .attr('data-ownerId', paymentRec.OwnerID)
                        .attr('data-fy', paymentRec.FY)
                        .attr('data-txn_id', paymentRec.txn_id)
                        .attr('data-payment_date', paymentRec.payment_date)
                        .attr('data-fromEmail', paymentRec.fromEmail)
                        .attr('data-gross', paymentRec.gross)
                        .attr('data-fee', paymentRec.fee)
                        .attr('href', "#")
                        .attr('class', "btn btn-primary btn-sm LogPayment")
                        .attr('role', "button")
                        .html("Pay"))
                );
            }

            if (paymentRec.EmailSent) {
                tr.append($('<td>').html(util.setBoolText(paymentRec.EmailSent)))
            } else {
                tr.append($('<td>')
                    .append($('<a>')
                        .attr('data-index', index)
                        .attr('data-parcelId', paymentRec.Parcel_ID)
                        .attr('data-ownerId', paymentRec.OwnerID)
                        .attr('data-fy', paymentRec.FY)
                        .attr('data-txn_id', paymentRec.txn_id)
                        .attr('data-payment_date', paymentRec.payment_date)
                        .attr('data-fromEmail', paymentRec.fromEmail)
                        .attr('data-gross', paymentRec.gross)
                        .attr('data-fee', paymentRec.fee)
                        .attr('href', "#")
                        .attr('class', "btn btn-warning btn-sm LogPayment")
                        .attr('role', "button")
                        .html("Send"))
                );
            }

            tr.append($('<td>')
                .append($('<a>')
                    .attr('class', "DetailDisplay")
                    .attr('data-parcelId', paymentRec.Parcel_ID)
                    .attr('href', "#")
                    .html(paymentRec.Parcel_ID))
            );

            tr.append($('<td>').html(paymentRec.name))
            tr.append($('<td>').html(paymentRec.fromEmail))
            tr.appendTo($DuesListDisplay);

        }); // End of loop through Parcels

    }

    function _logPayment(event) {
        var index = event.target.getAttribute("data-index");
        var paramMap = new Map();
        paramMap.set('parcelId', event.target.getAttribute("data-parcelId"));
        paramMap.set('ownerId', event.target.getAttribute("data-ownerId"));
        paramMap.set('fy', event.target.getAttribute("data-fy"));
        paramMap.set('txn_id', event.target.getAttribute("data-txn_id"));
        paramMap.set('payment_date', event.target.getAttribute("data-payment_date"));
        paramMap.set('fromEmail', event.target.getAttribute("data-fromEmail"));
        paramMap.set('gross', event.target.getAttribute("data-gross"));
        paramMap.set('fee', event.target.getAttribute("data-fee"));

        //console.log("in _logPayment, util.getJSONfromInputs = " + util.getJSONfromInputs(null, paramMap));

        var url = 'handlePaymentTransaction.php';
        $.ajax(url, {
            type: 'POST',
            contentType: "application/json",
            data: util.getJSONfromInputs(null, paramMap),
            //data: new FormData(this),
            dataType: "json",
            //dataType: "html"
        }).done(function (result) {
            //console.log("result = " + result);
            if (result.error) {
                console.log("error = " + result.error);
                $ajaxError.html("<b>" + result.error + "</b>");
            } else {
                var adminRec = result
                // Get the updated flags from the result and update in the existing array
                paymentList[index].TransLogged = adminRec.paymentList[0].TransLogged;
                paymentList[index].MarkedPaid = adminRec.paymentList[0].MarkedPaid;
                paymentList[index].EmailSent = adminRec.paymentList[0].EmailSent;
                // Re-diplay the payment list
                _paymentReconcileDisplay(adminRec.message);
            }
        }).fail(function (xhr, status, error) {
            console.log('Error in AJAX request to ' + url + ', status = ' + status + ', error = ' + error)
            $ajaxError.html("<b>" + "Error in request" + "</b>");
        })
    }

    //=================================================================================================================
    // This is what is exposed from this Module
    return {
    };

})(); // var admin = (function(){
