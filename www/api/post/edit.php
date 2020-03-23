<?php
ob_start();
include_once "../../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

$mysqldate = date("Y-m-d H:i:s");

function canPost()
{
	global $userdata;
	global $db;
	
	if (strtotime($userdata['lastpost']) >= (time() - $GLOBALS['POST_TIMEOUT']))
	{
		$timeleft = $GLOBALS['POST_TIMEOUT'] - (time() - strtotime($userdata['lastpost'])) + 1;
		$s = "s";
		if ($timeleft == 1)
			$s = "";
		//echoMessage("Please wait", "Please wait another " . $timeleft . " second" . $s . " before posting again");
		$GLOBALS['status'] = "WAIT";
		addJSON("wait_time", $timeleft);
		return false;
	} else
	{
		if ($stmt = $db->prepare("UPDATE `accounts` SET `lastpost`=? WHERE `id`=?"))
		{
			$stmt->bind_param("si", $GLOBALS['mysqldate'], $userdata['id']);
			$stmt->execute();
			$stmt->close();
			return true;
		} else
		{
			$GLOBALS['status'] = "DB_ERROR";
			echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
			return false;
		}
	}
}

function checkPost($pid)
{
	global $db;
	global $userdata;
	
	if ($stmt = $db->prepare("SELECT `pid` FROM `posts` WHERE `pid`=? AND `uid`=? AND `deleted`=0 LIMIT 1"))
	{
		$stmt->bind_param("ii", $pid, $userdata['id']);
		$stmt->execute();
		return $stmt->get_result()->num_rows > 0;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function insertPostText($text, $long, $lat)
{
	global $db;
	global $userdata;
	
	if ($stmt = $db->prepare("INSERT INTO `postedit`(`uid`, `pid`, `date`, `sesid`, `text`, `longitude`, `latitude`) VALUES (?, 0, ?, ?, ?, ?, ?)"))
	{
		if (strlen($text) > 65536)
			$text = substr($text, 65536);
		$stmt->bind_param("isssss", $userdata['id'], $GLOBALS['mysqldate'], $userdata['sessionid'], $text, $long, $lat);
		$stmt->execute();
		$stmt->close();
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return -1;
	}
	
	return $db->insert_id;
}

function linkPostText($postid, $posteditid)
{
	global $db;
	global $userdata;
	
	if ($stmt = $db->prepare("UPDATE `posts` SET `posteditid`=? WHERE `pid`=? AND `uid`=?"))
	{
		$stmt->bind_param("iii", $posteditid, $postid, $userdata['id']);
		$stmt->execute();
		$stmt->close();
		
		return true;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

if (isset($_POST['pid']) && is_numeric($_POST['pid']) && ((isset($_POST['text']) && strlen($_POST['text']) > 0)))
{
	if (canPost() && checkPost($_POST['pid']))
	{
		$long = (isset($_POST['latitude']) && is_numeric($_POST['latitude'])) ? $_POST['latitude'] : null;
		$lat = (isset($_POST['longitude']) && is_numeric($_POST['longitude'])) ? $_POST['longitude'] : null;
		
		$posteditid = insertPostText($_POST['text'], $long, $lat);
		
		if ($posteditid != -1)
			linkPostText($_POST['pid'], $posteditid);
	}
} else
	$status = "NO_INPUT";

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();

?>