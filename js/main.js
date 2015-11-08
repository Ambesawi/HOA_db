/*==============================================================================
 * (C) Copyright 2015 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version 
 * 2015-03-26 JJK	Solved initial DetailPage checkbox display problem by
 * 					moving format after the pagecontainer change (instead of
 * 					before it.  Let the page initialize first, then fill it.
 * 2015-04-09 JJK   Added Regular Expressions and functions for validating
 * 					email addresses and replacing non-printable characters
 * 2015-08-03 JJK	Modified to put the data parameters on the "a" element
 * 					and only response to clicks to the anchor
 * 2015-09-08 JJK   Added GetSalesReport to show sales to HOA properties
 * 2015-09-25 JJK	Added adminLevel to HoaRec to control updates
 * 2015-09-30 JJK	Added Search button
 * 2015-10-01 JJK	Added Create New Owner functionality
 * add check to make sure current owner is set on new owners and removed from others
 *============================================================================*/

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

//var validEmailAddrRegExStr = "^((\"([ !#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\]^_`a-z{|}~]|\\\\[ !\"#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\\\\\]^_`a-z{|}~])*\"|([!#$%&'*+\\-/0-9=?A-Z^_`a-z{|}~]|\\\\[ !\"#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\\\\\]^_`a-z{|}~])+)(\\.(\"([ !#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\]^_`a-z{|}~]|\\\\[ !\"#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\\\\\]^_`a-z{|}~])*\"|([!#$%&'*+\\-/0-9=?A-Z^_`a-z{|}~]|\\\\[ !\"#$%&'()*+,\\-./0-9:;<=>?@A-Z[\\\\\\]^_`a-z{|}~])+))*)@([a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?)*\\.(?![0-9]*\\.?$)[a-zA-Z0-9]{2,}\\.?)$";
//var regex = new RegExp(validEmailAddrRegExStr,"g"); 
/*
if (regex.test(inStr)) {
	resultStr = '<b style="color:green;">VALID</b>';
} else {
	resultStr = '<b style="color:red;">INVALID</b>';
}
*/

//Non-Printable characters - Hex 01 to 1F, and 7F
var nonPrintableCharsStr = "[\x01-\x1F\x7F]";
//"g" global so it does more than 1 substitution
var regexNonPrintableChars = new RegExp(nonPrintableCharsStr,"g");

function cleanStr(inStr) {
	return inStr.replace(regexNonPrintableChars,'');
}


function waitCursor() {
    $('*').css('cursor', 'progress');
    $(".ajaxError").html("");
}

$(document).ajaxComplete(function(event, request, settings) {
    $('*').css('cursor', 'default');
});

$(document).ajaxError(function(e, xhr, settings, exception) {
	console.log("ajax exception = "+exception);
	console.log("ajax exception xhr.responseText = "+xhr.responseText);
    $(".ajaxError").html("An Error has occurred (see console log)");
});


// This is a functions that scrolls to #id
function scrollTo(id)
{
    // Only scroll if on mobile device
    if ($(window).width() < 601 && id) {
        $('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
    }
}


$(document).ready(function(){

    // http://xdsoft.net/jqplugins/datetimepicker/
    /*
    $(".DateTime").datetimepicker({
        format:'Y-m-d H:i'
    });    
    $(".Date").datetimepicker({
        timepicker:false,
        format:'Y-m-d'
    });    
    jQuery('#datetimepicker6').datetimepicker({
    	  timepicker:false,
    	  onChangeDateTime:function(dp,$input){
    	    alert($input.val())
    	  }
    	});
    	
    $(".Date").datetimepicker({
        timepicker:false,
        format:'Y-m-d',
  	  	onChangeDateTime:function(dp,$input){
  	  		alert($input.val())
  	  	}
    $(".Date").datetimepicker({
        timepicker:false,
        format:'Y-m-d'
    });    
    });    
        <input type="text" class="Date" name="ErrBeginDateTime" id="ErrBeginDateTime"  placeholder="Begin Date (YYYY-MM-DD)" data-mini="true">
    */
	
}); // $(document).ready(function(){

	
$(document).on("pageinit","#SearchPage",function(){
    // Respond to any change in values and call service
    $("#SearchInput").change(function() {
        waitCursor();
        $("#PropertyListDisplay tbody").html("");
    	// Get the list
    	$.getJSON("getHoaPropertiesList.php","parcelId="+cleanStr($("#parcelId").val())+
    										"&checkNo="+cleanStr($("#checkNo").val())+
    										"&address="+cleanStr($("#address").val())+
    										"&ownerName="+cleanStr($("#ownerName").val())+
    										"&phoneNo="+cleanStr($("#phoneNo").val())+
    										"&altAddress="+cleanStr($("#altAddress").val()),function(hoaPropertyRecList){
    		displayPropertyList(hoaPropertyRecList);
            $("#PropertyListDisplay tbody").html(tr);
    	});
        event.stopPropagation();
    });

    // Respond to the Search button click (because I can't figure out how to combine it with input change)
    $(document).on("click","#SearchButton",function(){
        waitCursor();
        $("#PropertyListDisplay tbody").html("");
    	// Get the list
    	$.getJSON("getHoaPropertiesList.php","parcelId="+cleanStr($("#parcelId").val())+
    										"&checkNo="+cleanStr($("#checkNo").val())+
    										"&address="+cleanStr($("#address").val())+
    										"&ownerName="+cleanStr($("#ownerName").val())+
    										"&phoneNo="+cleanStr($("#phoneNo").val())+
    										"&altAddress="+cleanStr($("#altAddress").val()),function(hoaPropertyRecList){
    		displayPropertyList(hoaPropertyRecList);
    	});
        event.stopPropagation();
    });

    $(document).on("click","#PropertyListDisplay tr td a",function(){
        waitCursor();
        var $this = $(this);
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-parcelId"),function(hoaRec){
        	// Let the new page initialize first
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#DetailPage");
            // Then fill it with new content
            formatPropertyDetailResults(hoaRec);
        });
    });
    
});

function displayPropertyList(hoaPropertyRecList) {
	var tr = '<tr><td>No records found - try different search parameters</td></tr>';
    rowId = 0;
	$.each(hoaPropertyRecList, function(index, hoaPropertyRec) {
		rowId = index + 1;
		if (index == 0) {
    		tr = '';
    	    tr +=    '<tr>';
    	    tr +=      '<th>Row</th>';
    	    tr +=      '<th>Parcel Id</th>';
    	    if ($(window).width() > 800) {
	    	    tr +=  	   '<th>Lot No</th>';
	    	    tr +=      '<th>Sub Div</th>';
    	    }
    	    tr +=      '<th>Parcel Location</th>';
    	    tr +=      '<th>Owner Name</th>';
    	    tr +=      '<th>Owner Phone</th>';
    	    tr +=    '</tr>';
		}
	    tr +=  '<tr>';
	    tr +=    '<td>'+rowId+'</td>';
	    tr +=    '<td><a data-parcelId="'+hoaPropertyRec.parcelId+'" href="#">'+hoaPropertyRec.parcelId+'</a></td>';
	    if ($(window).width() > 800) {
		    tr +=    '<td>'+hoaPropertyRec.lotNo+'</td>';
		    tr +=    '<td>'+hoaPropertyRec.subDivParcel+'</td>';
	    }
	    tr +=    '<td>'+hoaPropertyRec.parcelLocation+'</td>';
	    tr +=    '<td>'+hoaPropertyRec.ownerName+'</td>';
	    tr +=    '<td>'+hoaPropertyRec.ownerPhone+'</td>';
	    tr +=  '</tr>';
	});

    $("#PropertyListDisplay tbody").html(tr);
}

function setCheckbox(checkVal){
	var checkedStr = '';
	if (checkVal == 1) {
		checkedStr = 'checked=true';
	}
	return '<input type="checkbox" data-mini="true" '+checkedStr+' disabled="disabled">';
}
function setCheckboxEdit(checkVal,idName){
	var checkedStr = '';
	if (checkVal == 1) {
		checkedStr = 'checked=true';
	}
	return '<input id="'+idName+'" type="checkbox" data-mini="true" '+checkedStr+'>';
}
function setInputText(idName,textVal,textSize){
	return '<input id="'+idName+'" type="text" value="'+textVal+'" size="'+textSize+'" maxlength="'+textSize+'" data-mini="true" >';
}
function setInputDate(idName,textVal,textSize){
	return '<input id="'+idName+'" class="Date" type="text" value="'+textVal+'" size="'+textSize+'" maxlength="'+textSize+'" placeholder="YYYY-MM-DD" data-mini="true" >';
}

function formatPropertyDetailResults(hoaRec){
    var tr = '';
    var checkedStr = '';

    // Get the admin level to see if user is allowed to edit data
	if (hoaRec.adminLevel > 1) {
	    tr += '<tr><th>Parcel Id:</th><td><a data-ParcelId="'+hoaRec.Parcel_ID+'" href="#">'+hoaRec.Parcel_ID+'</a></td></tr>';
	} else {
	    tr += '<tr><th>Parcel Id:</th><td>'+hoaRec.Parcel_ID+'</a></td></tr>';
	}
    tr += '<tr><th>Lot No:</th><td>'+hoaRec.LotNo+'</td></tr>';
    tr += '<tr><th>Sub Division: </th><td>'+hoaRec.SubDivParcel+'</td></tr>';
    tr += '<tr><th>Location: </th><td>'+hoaRec.Parcel_Location+'</td></tr>';
    tr += '<tr><th>Street No: </th><td>'+hoaRec.Property_Street_No+'</td></tr>';
    tr += '<tr><th>Street Name: </th><td>'+hoaRec.Property_Street_Name+'</td></tr>';
    tr += '<tr><th>City: </th><td>'+hoaRec.Property_City+'</td></tr>';
    tr += '<tr><th>State: </th><td>'+hoaRec.Property_State+'</td></tr>';
    tr += '<tr><th>Zip Code: </th><td>'+hoaRec.Property_Zip+'</td></tr>';
    tr += '<tr><th>Member: </th><td>'+setCheckbox(hoaRec.Member)+'</td></tr>';
    tr += '<tr><th>Vacant: </th><td>'+setCheckbox(hoaRec.Vacant)+'</td></tr>';
    tr += '<tr><th>Rental: </th><td>'+setCheckbox(hoaRec.Rental)+'</td></tr>';
    tr += '<tr><th>Managed: </th><td>'+setCheckbox(hoaRec.Managed)+'</td></tr>';
    tr += '<tr><th>Foreclosure: </th><td>'+setCheckbox(hoaRec.Foreclosure)+'</td></tr>';
    tr += '<tr><th>Bankruptcy: </th><td>'+setCheckbox(hoaRec.Bankruptcy)+'</td></tr>';
    tr += '<tr><th>ToBe Released: </th><td>'+setCheckbox(hoaRec.Liens_2B_Released)+'</td></tr>';
    tr += '<tr><th>Comments: </th><td>'+hoaRec.Comments+'</td></tr>';
    $("#PropertyDetail tbody").html(tr);
    
    var own1 = '';
    var currOwnerID = '';
    tr = '';
	$.each(hoaRec.ownersList, function(index, rec) {
		if (index == 0) {
    	    tr = tr +   '<tr>';
    	    tr = tr +     '<th>OwnId</th>';
    	    tr = tr +     '<th>Owner</th>';
    	    tr = tr +     '<th>Date Purchased</th>';
    	    tr = tr +     '<th>Phone Number</th>';
    	    tr = tr +     '<th>Alt Address</th>';
    	    tr = tr +     '<th>Comments</th>';
    	    tr = tr +   '</tr>';
    	    ownName1 = rec.Owner_Name1;
    	    currOwnerID = rec.OwnerID;
		}
	    tr = tr + '<tr>';
	    //tr = tr +   '<td data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="'+rec.OwnerID+'"><a href="#EditPage">'+rec.OwnerID+'</a></td>';
	    tr = tr +   '<td>'+rec.OwnerID+'</td>';
	    /*
	    if (rec.CurrentOwner) {
	    	own1 = rec.Owner_Name1;
		    tr = tr +   '<td data-OwnerId="'+rec.OwnerID+'"><a href="#EditPage">'+rec.OwnerID+'</a></td>';
	    } else {
		    tr = tr +   '<td>'+rec.OwnerID+'</td>';
	    }
	    */
    	if (hoaRec.adminLevel > 1) {
    	    tr = tr +   '<td><a data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="'+rec.OwnerID+'" href="#">'+rec.Owner_Name1+' '+rec.Owner_Name2+'</a></td>';
    	} else {
    	    tr = tr +   '<td>'+rec.Owner_Name1+' '+rec.Owner_Name2+'</a></td>';
    	}
	    tr = tr +   '<td>'+rec.DatePurchased.substring(0,10)+'</td>';
	    tr = tr +   '<td>'+rec.Owner_Phone+'</td>';
	    tr = tr +   '<td>'+rec.Alt_Address_Line1+'</td>';
	    tr = tr +   '<td>'+rec.Comments+'</td>';
	    tr = tr + '</tr>';
	});
	$("#PropertyOwners tbody").html(tr);

	var TaxYear = '';
    tr = '';
	$.each(hoaRec.assessmentsList, function(index, rec) {
		if (index == 0) {
    	    tr = tr +   '<tr>';
    	    tr = tr +     '<th>OwnId</th>';
    	    tr = tr +     '<th>Year</th>';
    	    tr = tr +     '<th>Dues Amt</th>';
    	    tr = tr +     '<th>Date Due</th>';
    	    tr = tr +     '<th>Paid</th>';
    	    tr = tr +     '<th>Date Paid</th>';
    	    tr = tr +     '<th>Payment</th>';
    	    tr = tr +     '<th>Comments</th>';
    	    tr = tr +   '</tr>';
    	    TaxYear = rec.DateDue.substring(0,4);
		}
	    tr = tr + '<tr>';
	    tr = tr +   '<td>'+rec.OwnerID+'</td>';
    	if (hoaRec.adminLevel > 1) {
    	    tr = tr +   '<td><a data-ParcelId="'+hoaRec.Parcel_ID+'" data-FY="'+rec.FY+'" href="#">'+rec.FY+'</a></td>';
    	} else {
    	    tr = tr +   '<td>'+rec.FY+'</a></td>';
    	}
	    tr = tr +   '<td>'+rec.DuesAmt+'</td>';
	    tr = tr +   '<td>'+rec.DateDue.substring(0,10)+'</td>';
	    tr = tr +   '<td>'+setCheckbox(rec.Paid)+'</td>';
	    tr = tr +   '<td>'+rec.DatePaid.substring(0,10)+'</td>';
	    tr = tr +   '<td>'+rec.PaymentMethod+'</td>';
	    tr = tr +   '<td>'+rec.Comments+'</td>';
	    tr = tr + '</tr>';
	});
    $("#PropertyAssessments tbody").html(tr);
    
    if ($(window).width() > 600) {
        var mcTreasURI = 'http://mctreas.org/master.cfm?parid='+hoaRec.Parcel_ID+'&taxyr='+TaxYear+'&own1='+ownName1;
        $("#MCTreasLink").html('<a href="'+encodeURI(mcTreasURI)+'" class="ui-btn ui-mini ui-btn-inline ui-icon-action ui-btn-icon-left ui-corner-all" data-mini="true" target="_blank">County<br>Treasurer<br>Information</a>');    

        var mcAuditorURI = 'http://www.mcrealestate.org/search/CommonSearch.aspx?mode=PARID';
        //$("#MCAuditorLink").html('<a href="'+encodeURI(mcAuditorURI)+'" class="ui-btn ui-corner-all ui-mini btnMarginPad" target="_blank">Montgomery<br>County<br>Auditor</a>');    
        $("#MCAuditorLink").html('<a href="'+encodeURI(mcAuditorURI)+'" class="ui-btn ui-mini ui-btn-inline ui-icon-action ui-btn-icon-left ui-corner-all" data-mini="true" target="_blank">County<br>Property<br>Information</a>');    
    }

	if (hoaRec.adminLevel > 1) {
	    $("#NewOwner").html('<br> <a id="NewOwnerButton" data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="'+currOwnerID+'" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-user ui-btn-icon-left ui-corner-all">New Owner</a>');
	    //$("#AddAssessment").html('<a id="AddAssessmentButton" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-plus ui-btn-icon-left ui-corner-all">Add Assessment</a>');
	}

		
} // End of function formatDetailResults(hoaRec){


$(document).on("pageinit","#DetailPage",function(){
	
    // Response to Detail link clicks
	// *** 8/3/2015 fix so it only reacts to the clicks on the property one
    $(document).on("click","#PropertyDetail tr td a",function(){
        waitCursor();
        var $this = $(this);
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-ParcelId"),function(hoaRec){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#EditPage");
            formatPropertyDetailEdit(hoaRec);
        });
    });	

    $(document).on("click","#PropertyOwners tr td a",function(){
        waitCursor();
        var $this = $(this);
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-ParcelId")+"&ownerId="+$this.attr("data-OwnerId"),function(hoaRec){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#EditPage");
    		createNew = false;
            formatOwnerDetailEdit(hoaRec,createNew);
        });
    });	
    $(document).on("click","#NewOwnerButton",function(){
        waitCursor();
        var $this = $(this);
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-ParcelId")+"&ownerId="+$this.attr("data-OwnerId"),function(hoaRec){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#EditPage");
    		createNew = true;
            formatOwnerDetailEdit(hoaRec,createNew);
        });
    });	
	
    $(document).on("click","#PropertyAssessments tr td a",function(){
        waitCursor();
        var $this = $(this);
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-ParcelId")+"&fy="+$this.attr("data-FY"),function(hoaRec){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#EditPage");
            formatAssessmentDetailEdit(hoaRec);
        });
    });	

}); // End of $(document).on("pageinit","#DetailPage",function(){

function formatPropertyDetailEdit(hoaRec){
    var tr = '';
    var checkedStr = '';

    // action or type of update
    $("#EditPageHeader").text("Edit Property");
    
    tr += '<tr><th>Parcel Id:</th><td>'+hoaRec.Parcel_ID+'</td></tr>';
    tr += '<tr><th>Lot No:</th><td>'+hoaRec.LotNo+'</td></tr>';
    tr += '<tr><th>Sub Division: </th><td>'+hoaRec.SubDivParcel+'</td></tr>';
    tr += '<tr><th>Location: </th><td>'+hoaRec.Parcel_Location+'</td></tr>';
    tr += '<tr><th>Street No: </th><td>'+hoaRec.Property_Street_No+'</td></tr>';
    tr += '<tr><th>Street Name: </th><td>'+hoaRec.Property_Street_Name+'</td></tr>';
    tr += '<tr><th>City: </th><td>'+hoaRec.Property_City+'</td></tr>';
    tr += '<tr><th>State: </th><td>'+hoaRec.Property_State+'</td></tr>';
    tr += '<tr><th>Zip Code: </th><td>'+hoaRec.Property_Zip+'</td></tr>';
    //tr += '<tr><th>Member: </th><td>'+setCheckboxEdit(hoaRec.Member,'MemberCheckbox')+'</td></tr>';
    tr += '<tr><th>Member: </th><td>'+setCheckbox(hoaRec.Member,'MemberCheckbox')+'</td></tr>';
    tr += '<tr><th>Vacant: </th><td>'+setCheckboxEdit(hoaRec.Vacant,'VacantCheckbox')+'</td></tr>';
    tr += '<tr><th>Rental: </th><td>'+setCheckboxEdit(hoaRec.Rental,'RentalCheckbox')+'</td></tr>';
    tr += '<tr><th>Managed: </th><td>'+setCheckboxEdit(hoaRec.Managed,'ManagedCheckbox')+'</td></tr>';
    tr += '<tr><th>Foreclosure: </th><td>'+setCheckboxEdit(hoaRec.Foreclosure,'ForeclosureCheckbox')+'</td></tr>';
    tr += '<tr><th>Bankruptcy: </th><td>'+setCheckboxEdit(hoaRec.Bankruptcy,'BankruptcyCheckbox')+'</td></tr>';
    tr += '<tr><th>ToBe Released: </th><td>'+setCheckboxEdit(hoaRec.Liens_2B_Released,'LiensCheckbox')+'</td></tr>';
    tr += '<tr><th>Comments: </th><td>'+setInputText("PropertyComments",hoaRec.Comments,"80")+'</td></tr>';
    
    tr += '<tr><th></th><td>'+
    	  '<a id="SavePropertyEdit" data-ParcelId="'+hoaRec.Parcel_ID+'" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-plus ui-btn-icon-left ui-corner-all">Save</a>' +
          '<a href="#" data-rel="back" class="ui-btn ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-left ui-corner-all">Cancel</a>' +
          '</td></tr>';

    $("#EditTable tbody").html(tr);

} // End of function formatPropertyDetailEdit(hoaRec){

function formatOwnerDetailEdit(hoaRec,createNew){
    var tr = '';
    var checkedStr = '';
    var buttonStr = '';
    var ownerId = '';

    // action or type of update
	if (createNew) {
	    $("#EditPageHeader").text("New Owner");
	} else {
	    $("#EditPageHeader").text("Edit Owner");
	}

	rec = hoaRec.ownersList[0];
	salesRec = null;
	if (hoaRec.salesList[0] != null) {
		salesRec = hoaRec.salesList[0];
	}

	ownerId = rec.OwnerID;
	tr = '';
	if (createNew) {
	    tr += '<tr><th>Owner Id:</th><td>CREATE NEW OWNER</td></tr>';
	} else {
	    tr += '<tr><th>Owner Id:</th><td>'+rec.OwnerID+'</td></tr>';
	}
    tr += '<tr><th>Parcel Id:</th><td>'+rec.Parcel_ID+'</td></tr>';
    
    if (salesRec != null) {
        tr += '<tr><th>Current Owner: </th><td>'+setCheckbox(rec.CurrentOwner,'CurrentOwnerCheckbox')+'</td><td><h4>Sales Information</h4></td></tr>';
        tr += '<tr><th>Owner Name1:</th><td>'+ setInputText("OwnerName1",rec.Owner_Name1,"50")+'</td><td>'+salesRec.OWNERNAME1+'</td></tr>';
        tr += '<tr><th>Owner Name2:</th><td>'+ setInputText("OwnerName2",rec.Owner_Name2,"50")+'</td></tr>';
        tr += '<tr><th>Date Purchased:</th><td>'+ setInputDate("DatePurchased",rec.DatePurchased,"10")+'</td><td>'+salesRec.SALEDT+'</td></tr>';
        tr += '<tr><th>Mailing Name:</th><td>'+ setInputText("MailingName",rec.Mailing_Name,"50")+'</td><td>'+salesRec.MAILINGNAME1+' '+salesRec.MAILINGNAME2+'</td></tr>';
        tr += '<tr><th>Alternate Mailing: </th><td>'+setCheckboxEdit(rec.AlternateMailing,'AlternateMailingCheckbox')+'</td></tr>';
        tr += '<tr><th>Address Line1:</th><td>'+ setInputText("AddrLine1",rec.Alt_Address_Line1,"50")+'</td><td>'+salesRec.PADDR1+'</td></tr>';
        tr += '<tr><th>Address Line2:</th><td>'+ setInputText("AddrLine2",rec.Alt_Address_Line2,"50")+'</td><td>'+salesRec.PADDR2+'</td></tr>';
        tr += '<tr><th>City:</th><td>'+ setInputText("AltCity",rec.Alt_City,"40")+'</td><td>'+salesRec.PADDR3+'</td></tr>';
    } else {
        tr += '<tr><th>Current Owner: </th><td>'+setCheckbox(rec.CurrentOwner,'CurrentOwnerCheckbox')+'</td></tr>';
        tr += '<tr><th>Owner Name1:</th><td>'+ setInputText("OwnerName1",rec.Owner_Name1,"50")+'</td></tr>';
        tr += '<tr><th>Owner Name2:</th><td>'+ setInputText("OwnerName2",rec.Owner_Name2,"50")+'</td></tr>';
        tr += '<tr><th>Date Purchased:</th><td>'+ setInputDate("DatePurchased",rec.DatePurchased,"10")+'</td></tr>';
        tr += '<tr><th>Mailing Name:</th><td>'+ setInputText("MailingName",rec.Mailing_Name,"50")+'</td></tr>';
        tr += '<tr><th>Alternate Mailing: </th><td>'+setCheckboxEdit(rec.AlternateMailing,'AlternateMailingCheckbox')+'</td></tr>';
        tr += '<tr><th>Address Line1:</th><td>'+ setInputText("AddrLine1",rec.Alt_Address_Line1,"50")+'</td></tr>';
        tr += '<tr><th>Address Line2:</th><td>'+ setInputText("AddrLine2",rec.Alt_Address_Line2,"50")+'</td></tr>';
        tr += '<tr><th>City:</th><td>'+ setInputText("AltCity",rec.Alt_City,"40")+'</td></tr>';
    }
    tr += '<tr><th>State:</th><td>'+ setInputText("AltState",rec.Alt_State,"20")+'</td></tr>';
    tr += '<tr><th>Zip:</th><td>'+ setInputText("AltZip",rec.Alt_Zip,"20")+'</td></tr>';
    tr += '<tr><th>Owner Phone:</th><td>'+ setInputText("OwnerPhone",rec.Owner_Phone,"30")+'</td></tr>';
    tr += '<tr><th>Comments: </th><td>'+setInputText("OwnerComments",rec.Comments,"12")+'</td></tr>';
    tr += '<tr><th>Last Changed:</th><td>'+rec.LastChangedTs+'</td></tr>';
    tr += '<tr><th>Changed by:</th><td>'+rec.LastChangedBy+'</td></tr>';
    
	if (createNew) {
	    tr += '<tr><th></th><td>'+
	  	  '<a id="SaveOwnerEdit" data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="NEW" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-plus ui-btn-icon-left ui-corner-all">Create New</a>' +
	  	  '<a href="#" data-rel="back" class="ui-btn ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-left ui-corner-all">Cancel</a>' +
	  	  '</td></tr>';
	} else {
	    tr += '<tr><th></th><td>'+
	  	  '<a id="SaveOwnerEdit" data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="'+ownerId+'" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-plus ui-btn-icon-left ui-corner-all">Save</a>' +
	  	  '<a href="#" data-rel="back" class="ui-btn ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-left ui-corner-all">Cancel</a>' +
	  	  '</td></tr>';
	}

    $("#EditTable tbody").html(tr);

    $(".Date").datetimepicker({
        timepicker:false,
        format:'Y-m-d'
    });    

} // End of function formatOwnerDetailEdit(hoaRec){

function formatAssessmentDetailEdit(hoaRec){
    var tr = '';
    var checkedStr = '';
    var buttonStr = '';
    var ownerId = '';
    var fy = '';

    // action or type of update
    $("#EditPageHeader").text("Edit Assessment");

    rec = hoaRec.assessmentsList[0];
	ownerId = rec.OwnerID;
	fy = rec.FY;
	tr = '';
    tr += '<tr><th>Fiscal Year:</th><td>'+rec.FY+'</td></tr>';
    tr += '<tr><th>Owner Id:</th><td>'+rec.OwnerID+'</td></tr>';
    tr += '<tr><th>Parcel Id:</th><td>'+rec.Parcel_ID+'</td></tr>';
    
    tr += '<tr><th>Dues Amount:</th><td>'+setInputText("DuesAmount",rec.DuesAmt,"10")+'</td></tr>';
    tr += '<tr><th>Date Due:</th><td>'+setInputDate("DateDue",rec.DateDue,"10")+'</td></tr>';
    tr += '<tr><th>Paid: </th><td>'+setCheckboxEdit(rec.Paid,'PaidCheckbox')+'</td></tr>';
    tr += '<tr><th>Date Paid:</th><td>'+setInputDate("DatePaid",rec.DatePaid,"10")+'</td></tr>';
    tr += '<tr><th>Payment Method:</th><td>'+setInputText("PaymentMethod",rec.PaymentMethod,"20")+'</td></tr>';
    tr += '<tr><th>Comments: </th><td>'+setInputText("AssessmentsComments",rec.Comments,"10")+'</td></tr>';
    tr += '<tr><th>Last Changed:</th><td>'+rec.LastChangedTs+'</td></tr>';
    tr += '<tr><th>Changed by:</th><td>'+rec.LastChangedBy+'</td></tr>';

    tr += '<tr><th></th><td>'+
	  	  '<a id="SaveAssessmentEdit" data-ParcelId="'+hoaRec.Parcel_ID+'" data-OwnerId="'+ownerId+'" data-FY="'+fy+'" href="#" class="ui-btn ui-mini ui-btn-inline ui-icon-plus ui-btn-icon-left ui-corner-all">Save</a>' +
	  	  '<a href="#" data-rel="back" class="ui-btn ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-left ui-corner-all">Cancel</a>' +
	  	  '</td></tr>';

	$("#EditTable tbody").html(tr);

    $(".Date").datetimepicker({
        timepicker:false,
        format:'Y-m-d'
    });    

} // End of function formatAssessmentDetailEdit(hoaRec){


$(document).on("pageinit","#EditPage",function(){
	// Functions for EditPage - respond to requests for update
	$(document).on("click","#SavePropertyEdit",function(){
        waitCursor();
    	
        var $this = $(this);
        var $parcelId = $this.attr("data-parcelId");
        var $memberBoolean = $("#MemberCheckbox").is(":checked");
        var $vacantBoolean = $("#VacantCheckbox").is(":checked");
        var $rentalBoolean = $("#RentalCheckbox").is(":checked");
        var $managedBoolean = $("#ManagedCheckbox").is(":checked");
        var $foreclosureBoolean = $("#ForeclosureCheckbox").is(":checked");
        var $bankruptcyBoolean = $("#BankruptcyCheckbox").is(":checked");
        var $liensBoolean = $("#LiensCheckbox").is(":checked");

        //$.getJSON("updHoaDbData.php","parcelId="+$this.attr("data-parcelId"),function(hoaRec){
        $.get("updHoaProperty.php","parcelId="+$parcelId+
        						 "&memberBoolean="+$memberBoolean+
        						 "&vacantBoolean="+$vacantBoolean+
        						 "&rentalBoolean="+$rentalBoolean+
        						 "&managedBoolean="+$managedBoolean+
        						 "&foreclosureBoolean="+$foreclosureBoolean+
        						 "&bankruptcyBoolean="+$bankruptcyBoolean+
        						 "&liensBoolean="+$liensBoolean+
        						 "&propertyComments="+cleanStr($("#PropertyComments").val()),function(results){

        	//console.log("After updHoaProperty");
        	
        	// Re-read the updated data for the Detail page display
            $.getJSON("getHoaDbData.php","parcelId="+$parcelId,function(hoaRec){
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "#DetailPage");
                formatPropertyDetailResults(hoaRec);
            });
        }); // End of $.get("updHoaDbData.php","parcelId="+$parcelId+

       	
    });	// End of $(document).on("click","#SavePropertyEdit",function(){

    $(document).on("click","#SaveOwnerEdit",function(){
        waitCursor();
    	
        var $this = $(this);
        var $parcelId = $this.attr("data-parcelId");
        var $ownerId = $this.attr("data-OwnerId");

        //var $currentOwnerBoolean = $("#CurrentOwnerCheckbox").is(":checked");
        var $alternateMailingBoolean = $("#AlternateMailingCheckbox").is(":checked");

        $.get("updHoaOwner.php","parcelId="+$parcelId+
        						 "&ownerId="+$ownerId+
        						 //"&currentOwnerBoolean="+$currentOwnerBoolean+
        						 "&ownerName1="+cleanStr($("#OwnerName1").val())+
        						 "&ownerName2="+cleanStr($("#OwnerName2").val())+
        						 "&datePurchased="+cleanStr($("#DatePurchased").val())+
        						 "&mailingName="+cleanStr($("#MailingName").val())+
           						 "&alternateMailingBoolean="+$alternateMailingBoolean+
           						 "&addrLine1="+cleanStr($("#AddrLine1").val())+
        						 "&addrLine2="+cleanStr($("#AddrLine2").val())+
        						 "&altCity="+cleanStr($("#AltCity").val())+
        						 "&altState="+cleanStr($("#AltState").val())+
        						 "&altZip="+cleanStr($("#AltZip").val())+
        						 "&ownerPhone="+cleanStr($("#OwnerPhone").val())+
        						 "&ownerComments="+cleanStr($("#OwnerComments").val()),function(results){

        	// Re-read the updated data for the Detail page display
            $.getJSON("getHoaDbData.php","parcelId="+$parcelId,function(hoaRec){
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "#DetailPage");
                formatPropertyDetailResults(hoaRec);
            });
        }); // End of $.get("updHoaDbData.php","parcelId="+$parcelId+

    });	// End of $(document).on("click","#SaveOwnerEdit",function(){


    $(document).on("click","#SaveAssessmentEdit",function(){
        waitCursor();
    	
        var $this = $(this);
        var $parcelId = $this.attr("data-parcelId");
        var $ownerId = $this.attr("data-OwnerId");
        var $fy = $this.attr("data-FY");

        var $paidBoolean = $("#PaidCheckbox").is(":checked");

        $.get("updHoaAssessment.php","parcelId="+$parcelId+
				 					 "&ownerId="+$ownerId+
				 					 "&fy="+$fy+
        						 "&duesAmount="+cleanStr($("#DuesAmount").val())+
        						 "&dateDue="+cleanStr($("#DateDue").val())+
        						 "&paidBoolean="+$paidBoolean+
        						 "&datePaid="+cleanStr($("#DatePaid").val())+
        						 "&paymentMethod="+cleanStr($("#PaymentMethod").val())+
        						 "&assessmentsComments="+cleanStr($("#AssessmentsComments").val()),function(results){

        	// Re-read the updated data for the Detail page display
            $.getJSON("getHoaDbData.php","parcelId="+$parcelId,function(hoaRec){
                $( ":mobile-pagecontainer" ).pagecontainer( "change", "#DetailPage");
                formatPropertyDetailResults(hoaRec);
            });
        }); // End of $.get("updHoaDbData.php","parcelId="+$parcelId+

    });	// End of $(document).on("click","#SaveAssessmentEdit",function(){

    
}); // End of $(document).on("pageinit","#EditPage",function(){


$(document).on("pageinit","#ReportsPage",function(){

	$(document).on("click","#SalesReport",function(){
        waitCursor();
        $("#ReportListDisplay tbody").html("");
        
    	// Get the list
	    formatSalesReportList(false);
        
        event.stopPropagation();
    });

	
	$(document).on("click","#SalesNewOwnerReport",function(){
	    waitCursor();
	    $("#ReportListDisplay tbody").html("");
	    
		// Get the list
	    formatSalesReportList(true);
	    
	    event.stopPropagation();
	});
	
	
}); // End of $(document).on("pageinit","#ReportsPage",function(){


function formatSalesReportList(notProcessedBoolean){
	$.getJSON("getSalesReport.php","notProcessedBoolean="+notProcessedBoolean,function(hoaSalesReportRec){
		var tr = '';
	    rowId = 0;
		$.each(hoaSalesReportRec.salesList, function(index, hoaSalesRec) {
			rowId = index + 1;
			if (index == 0) {
	    	    tr +=    '<tr>';
	    	    tr +=      '<th>Row</th>';
	    	    //tr +=      '<th>Parcel Id</th>';
	    	    tr +=  	   '<th>Sale Date</th>';
	    	    tr +=      '<th>Parcel Location</th>';
	    	    tr +=      '<th>Old Owner Name</th>';
	    	    tr +=      '<th>New Owner Name</th>';
	    	    tr +=      '<th>Mailing Name1</th>';
	    	    tr +=      '<th>Mailing Name2</th>';
	    	    //tr +=      '<th>Notification</th>';
	    	    tr +=    '</tr>';
			}
		    tr +=  '<tr>';
		    tr +=    '<td>'+rowId+'</td>';
		    //tr +=    '<td><a data-parcelId="'+hoaSalesRec.PARID+'" href="#">'+hoaSalesRec.PARID+'</a></td>';
		    
	    	if (hoaSalesReportRec.adminLevel > 1 && notProcessedBoolean) {
    		    tr +=    '<td><a data-ParcelId="'+hoaSalesRec.PARID+'" data-SaleDate="'+hoaSalesRec.SALEDT+'" data-Action="Process" href="#">'+hoaSalesRec.SALEDT+'</a>';
    		    tr +=    '    <a data-ParcelId="'+hoaSalesRec.PARID+'" data-SaleDate="'+hoaSalesRec.SALEDT+'" data-Action="Ignore" href="#" linebtn class="ui-btn ui-mini ui-btn-inline ui-corner-all">Ignore</a></td>';
	    	} else {
    		    tr +=    '<td>'+hoaSalesRec.SALEDT+'</td>';
	    	}
		    tr +=    '<td>'+hoaSalesRec.PARCELLOCATION+'</td>';
		    tr +=    '<td>'+hoaSalesRec.OLDOWN+'</td>';
		    tr +=    '<td>'+hoaSalesRec.OWNERNAME1+'</td>';
		    tr +=    '<td>'+hoaSalesRec.MAILINGNAME1+'</td>';
		    tr +=    '<td>'+hoaSalesRec.MAILINGNAME2+'</td>';
		    //tr +=    '<td>'+hoaSalesRec.NotificationFlag+'</td>';
		    tr +=  '</tr>';
		});

		$("#ReportListDisplay tbody").html(tr);
	});
}

$(document).on("click","#ReportListDisplay tr td a",function(){
    waitCursor();
    var $this = $(this);
    if ($this.attr("data-Action") == "Ignore") {
    	// update flag

    	var $parcelId = $this.attr("data-ParcelId");
    	var $saleDate = $this.attr("data-SaleDate");

        $.get("updHoaSales.php","PARID="+$parcelId+
				 "&SALEDT="+$saleDate,function(results){
        	// Re-read the update data and re-display sales list
    	    formatSalesReportList(true);
        }); // End of $.get("updHoaSales.php","parcelId="+$parcelId+

    } else {
        $.getJSON("getHoaDbData.php","parcelId="+$this.attr("data-ParcelId")+"&saleDate="+$this.attr("data-SaleDate"),function(hoaRec){
            $( ":mobile-pagecontainer" ).pagecontainer( "change", "#EditPage");
            formatOwnerDetailEdit(hoaRec,true);
        });
    }
});	// End of $(document).on("click","#ReportListDisplay tr td a",function(){



$(document).on("pageinit","#AdminPage",function(){
	$('#summernote').summernote();

	$.get("getFile.php","",function(response){
		$('#summernote').code(response);
	});
	
	
	//$('.summernote').summernote({
	/*
	$('#summernote').summernote({
		  height: 300,                 // set editor height

		  minHeight: null,             // set minimum height of editor
		  maxHeight: null,             // set maximum height of editor

		  focus: true,                 // set focus to editable area after initializing summernote
	});
	*/
	
	/*
	Get the HTML contents of the first summernote in the set of matched elements.

	var sHTML = $('.summernote').code();
	Get the HTML content of the second summernote with jQuery eq.

	var sHTML = $('.summernote').eq(1).code();
	A string of HTML to set as the content of each matched element.

	$('.summernote').code(sHTML);
	*/

});

$(document).on("pageinit","#UsersPage",function(){
});


// no, not sending json to the server, just a string
//contentType: "application/json; charset=utf-8",
/*
$.ajax({
    url: 'updHoaDbData.php',
    data: hoaRec,
    type: 'POST',
    async: false,
    dataType: 'json',
    cache: false,
    success:function(data, textStatus, jqXHR){
        console.log('AJAX SUCCESS');
    }, 
    complete : function(data, textStatus, jqXHR){
        console.log('AJAX COMPLETE');
    }
});
*/
//$hoaRec = $_POST['hoaRec'];
