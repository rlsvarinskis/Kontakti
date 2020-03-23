<?php
ob_start();
require_once "../../util/session.php";
header('Content-type: application/json');

$status = "NO_INPUT";

function isLiked($pid, $uid)
{
	global $db;
	
	$sql = "SELECT * FROM `like` WHERE `pid`=? AND `uid`=?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("ii", $pid, $uid);
		$stmt->execute();
		
		$res = $stmt->get_result();
		
		$stmt->close();
		
		return $res->num_rows > 0;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function like($pid, $uid)
{
	global $db;
	
	$sql = "INSERT INTO `like`(`uid`, `pid`) VALUES (?, ?)";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("ii", $uid, $pid);
		$stmt->execute();
		$stmt->close();
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
	}
}

function unlike($pid, $uid)
{
	global $db;
	
	$sql = "DELETE FROM `like` WHERE `pid`=? AND `uid`=?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("ii", $pid, $uid);
		$stmt->execute();
		$stmt->close();
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
	}
}

function getLikes($pid)
{
	global $db;
	
	$sql = "SELECT * FROM `like` WHERE `pid`=?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("i", $pid);
		$stmt->execute();
		
		$res = $stmt->get_result();
		
		$stmt->close();
		
		return $res->num_rows;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return -1;
	}
}

if (!empty($_POST['post']) && is_numeric($_POST['post']))
{
	$pid = $_POST['post'];
	$uid = $userdata['id'];
	
	$wasLiked = false;
	
	if ($wasLiked = isLiked($pid, $uid))
		unlike($pid, $uid);
	else
		like($pid, $uid);
		
	addJSON("id", $pid);
	addJSON("liked", !$wasLiked);
	addJSON("likes", getLikes($pid));
	
	$status = "SUCCESS";
}

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>