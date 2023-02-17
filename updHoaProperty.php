<?php
/*==============================================================================
 * (C) Copyright 2015,2018,2020 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version to get data
 * 2015-12-21 JJK	Removed Member boolean from the update
 * 2016-08-19 JJK   Added UserEmail
 * 2018-10-27 JJK	Re-factored to use POST and return JSON data of
 *                  re-queried record
 * 2020-08-01 JJK   Re-factored to use jjklogin for authentication
 * 2020-12-21 JJK   Re-factored to use jjklogin package
 * 2023-02-17 JJK   Refactor for non-static jjklogin class and settings from DB
 *============================================================================*/
// Define a super global constant for the log file (this will be in scope for all functions)
define("LOG_FILE", "./php.log");
require_once 'vendor/autoload.php';

// Figure out how many levels up to get to the "public_html" root folder
$webRootDirOffset = substr_count(strstr(dirname(__FILE__),"public_html"),DIRECTORY_SEPARATOR) + 1;
// Get settings and credentials from a file in a directory outside of public_html
// (assume a settings file in the "external_includes" folder one level up from "public_html")
$extIncludePath = dirname(__FILE__, $webRootDirOffset+1).DIRECTORY_SEPARATOR.'external_includes'.DIRECTORY_SEPARATOR;
require_once $extIncludePath.'hoadbSecrets.php';
require_once $extIncludePath.'jjkloginSettings.php';
// Common functions
require_once 'php_secure/commonUtil.php';
// Common database functions and table record classes
require_once 'php_secure/hoaDbCommon.php';

use \jkauflin\jjklogin\LoginAuth;

try {
    $loginAuth = new LoginAuth($hostJJKLogin, $dbadminJJKLogin, $passwordJJKLogin, $dbnameJJKLogin);
    $userRec = $loginAuth->getUserRec();
    if ($userRec->userName == null || $userRec->userName == '') {
        throw new Exception('User is NOT logged in', 500);
    }
    if ($userRec->userLevel < 2) {
        throw new Exception('User is NOT authorized (contact Administrator)', 500);
    }

	$username = $userRec->userName;

	header("Content-Type: application/json; charset=UTF-8");
	# Get JSON as a string
	$json_str = file_get_contents('php://input');

	# Decode the string to get a JSON object
	$param = json_decode($json_str);

	/*
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, parcelId = " . $param->parcelId . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, vacantCheckbox = " . $param->vacantCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, rentalCheckbox = " . $param->rentalCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, managedCheckbox = " . $param->managedCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, foreclosureCheckbox = " . $param->foreclosureCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, bankruptcyCheckbox = " . $param->bankruptcyCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, liensCheckbox = " . $param->liensCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, useEmailCheckbox = " . $param->useEmailCheckbox . PHP_EOL, 3, "hoadb.log");
	error_log(date('[Y-m-d H:i] '). "updHoaProperty, propertyComments = " . $param->propertyComments . PHP_EOL, 3, "hoadb.log");
	*/

	//--------------------------------------------------------------------------------------------------------
	// Create connection to the database
	//--------------------------------------------------------------------------------------------------------
	$conn = getConn($host, $dbadmin, $password, $dbname);
	$stmt = $conn->prepare("UPDATE hoa_properties SET Vacant=?,Rental=?,Managed=?,Foreclosure=?,Bankruptcy=?,Liens_2B_Released=?,UseEmail=?,Comments=?,LastChangedBy=?,LastChangedTs=CURRENT_TIMESTAMP WHERE Parcel_ID = ? ; ");
	$stmt->bind_param("iiiiiiisss", $param->vacantCheckbox,$param->rentalCheckbox,$param->managedCheckbox,$param->foreclosureCheckbox,$param->bankruptcyCheckbox,$param->liensCheckbox,$param->useEmailCheckbox,$param->propertyComments,$username,$param->parcelId);
	$stmt->execute();
	$stmt->close();

	// Re-query the record from the database and return as a JSON structure
	$hoaRec = getHoaRec($conn,$param->parcelId,"","","");
	$hoaRec->adminLevel = $userRec->userLevel;
	$conn->close();
	echo json_encode($hoaRec);

} catch(Exception $e) {
    //error_log(date('[Y-m-d H:i] '). "in " . basename(__FILE__,".php") . ", Exception = " . $e->getMessage() . PHP_EOL, 3, LOG_FILE);
    echo json_encode(
        array(
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        )
    );
}

?>
