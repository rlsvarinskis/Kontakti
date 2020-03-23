<?php
ob_start();
require_once "../util/session.php";
header('Content-type: application/json');

if ($stmt = $db->prepare("SELECT COUNT(*) FROM `friends` WHERE `friends`.`fid`=? AND `friends`.`fstatus`=0 AND `friends`.`rstatus`=0"))
{
	$stmt->bind_param("i", $userdata['id']);
	$stmt->execute();
	$result = $stmt->get_result();
	addJSON("requests", $result->fetch_row()[0]);
	$stmt->close();
} else
	echoDBError($db->error, __FILE__ . ":" . __LINE__);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>