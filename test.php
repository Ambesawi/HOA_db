<?php
/*==============================================================================
 * (C) Copyright 2021 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:  Scrip to test functions
 *----------------------------------------------------------------------------
 * Modification History
 * 2021-09-06 JJK 	Initial version to test mail functions
 *============================================================================*/
require_once 'vendor/autoload.php';
// Define a super global constant for the log file (this will be in scope for all functions)
//define("LOG_FILE", "./php.log");
define("LOG_FILE", "./test.log");
// Figure out how many levels up to get to the "public_html" root folder
$webRootDirOffset = substr_count(strstr(dirname(__FILE__),"public_html"),DIRECTORY_SEPARATOR) + 1;
// Get settings and credentials from a file in a directory outside of public_html
// (assume a settings file in the "external_includes" folder one level up from "public_html")
$extIncludePath = dirname(__FILE__, $webRootDirOffset+1).DIRECTORY_SEPARATOR.'external_includes'.DIRECTORY_SEPARATOR;
require_once $extIncludePath.'hoadbSecrets.php';
// Common functions
require_once 'php_secure/commonUtil.php';
// Common database functions and table record classes
require_once 'php_secure/hoaDbCommon.php';


// Check URL param against secret key for scheduled jobs
if (getParamVal("key") != $scheduledJobKey) {
    echo "Not authorized to execute request";
    exit;
}

// Create a Mailer object for the SMTP transport using parameters from secrets
$mailer = getMailer($mailUsername, $mailPassword, $mailServer, $mailPort);

//--------------------------------------------------------------------------------------------------------
// Create connection to the database
//--------------------------------------------------------------------------------------------------------
$conn = getConn($host, $dbadmin, $password, $dbname);

//$fromEmailAddress = getConfigValDB($conn,"fromEmailAddress");
//$treasurerEmail = getConfigValDB($conn,"treasurerEmail");
//$paymentEmailList = getConfigValDB($conn,"paymentEmailList");
$EmailAddr = getConfigValDB($conn,'duesEmailTestAddress');

$subject = 'GRHA Test email ';
$messageStr = '<h2>This is a test of email from GRHA</h2>';
error_log(date('[Y-m-d H:i:s] '). "in " . basename(__FILE__,".php") . ", email = $EmailAddr" . PHP_EOL, 3, LOG_FILE);

// Create a Mailer object for the SMTP transport
$sendMailSuccess = sendMail($mailer,$EmailAddr,$subject,$messageStr,$mailUsername);
$resultStr = "After email to $EmailAddr, sendMailSuccess = $sendMailSuccessStr";
error_log(date('[Y-m-d H:i] '). "in " . basename(__FILE__,".php") . ", $resultStr " . PHP_EOL, 3, LOG_FILE);

echo $resultStr;
?>
