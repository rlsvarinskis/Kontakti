<?php
ob_start();
include_once "../../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function deleteLikes($postid)
{
	global $db;
	
	if ($stmt = $db->prepare("DELETE FROM `like` WHERE `pid`=?"))
	{
		$stmt->bind_param("i", $postid);
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

function deletePost($postid)
{
	global $db;
	global $userdata;
	
	if ($stmt = $db->prepare("UPDATE `posts` SET `deleted`=1 WHERE `pid`=? AND `uid`=? AND `deleted`=0 LIMIT 1"))
	{
		$stmt->bind_param("ii", $postid, $userdata['id']);
		$stmt->execute();
		
		if ($stmt->affected_rows <= 0)
		{
			$stmt->close();
			$GLOBALS['status'] = "NOTHING_CHANGED";
			return false;
		} else
		{
			$stmt->close();
			return true;
		}
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

if (isset($_POST['pid']) && is_numeric($_POST['pid']))
{
	if (deletePost($_POST['pid']))
		deleteLikes($_POST['pid']);
} else
	$status = "NO_INPUT";

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>