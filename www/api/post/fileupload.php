<?php

function getFilename()
{
	global $userdata;
	global $db;
	
	$filename = ":";
	
	$type = $_GET['type'];
	
	$privacy = 0;
	
	$album = getOrCreateAlbum("Photos", $GLOBALS['mysqldate']);
	
	if ($stmt = $db->prepare("INSERT INTO `media`(`uid`, `album`, `date`, `type`, `privacy`) VALUES (?,?,?,?,?)")) //Insert media into database
	{
		$stmt->bind_param("iissi", $userdata['id'], $album['album'], $GLOBALS['mysqldate'], $type, $privacy);
		$stmt->execute();
		addJSON("errno", $stmt->errno);
		addJSON("error", $stmt->error);
		addJSON("insertid", $stmt->insert_id);
		$filename = $stmt->insert_id;
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	return $filename;
}

function uploadInput()
{
	$filename = getFilename();
	
	$input = fopen('php://input', "r");
	
	$output = fopen("D:\\wamp\\www\\kontakti\\media\\" . $filename, "w+");

	$buffer = null;
	
	do
	{
		$buffer = fgets($input, 4096);
		fwrite($output, $buffer);
	} while (strlen($buffer) != 0);
	
	fclose($input);
	fclose($output);
	
	return $filename;
}
	
ob_start();
include_once "../../util/session.php";
include_once "../../util/mediatools.php";
header('Content-type: application/json');

$status = "SUCCESS";

$mysqldate = date("Y-m-d H:i:s");

addJSON("fileid", uploadInput());

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>