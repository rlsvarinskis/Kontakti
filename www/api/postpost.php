<?php
ob_start();
require "../util/mediatools.php";
include_once "../util/session.php";
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

function insertPost($pid, $pei, $long, $lat)
{
	global $db;
	global $userdata;
		
	if ($stmt = $db->prepare("INSERT INTO `posts` (`uid`, `rto`, `date`, `title`, `posteditid`, `sesid`, `longitude`, `latitude`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"))
	{
		$title = "[name]";
		$stmt->bind_param("iissssss", $userdata['id'], $pid, $GLOBALS['mysqldate'], $title, $pei, $userdata['sessionid'], $long, $lat);
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
	
	if ($stmt = $db->prepare("UPDATE `postedit` SET `pid`=? WHERE `editid`=?"))
	{
		$stmt->bind_param("ii", $postid, $posteditid);
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

function attachFiles($files, $postid, $long = null, $lat = null)
{
	//$album = "Photos";
	//$albumdata = null;

	//if (isset($_POST['album']))
	//	$album = $_POST['album'];
	
	if (is_numeric($files) && $files > 0)
	{
		//$album = getOrCreateAlbum($album, $GLOBALS['mysqldate'], $long, $lat);
		for ($x = 0; $x < $files; $x++)
		{
			$file = $_POST["file$x"];
				if (addMediaToPost($postid, /*saveImage($file, $album, $GLOBALS['mysqldate'])*/$file) != "SUCCESS")
					$GLOBALS['status'] = "DB_ERROR";
		}
	}
}

if (isset($_POST['pid']) && is_numeric($_POST['pid']) && ((isset($_POST['text']) && strlen($_POST['text']) > 0) || (isset($_POST['files']))))
{
	if (canPost())
	{
		$long = (isset($_POST['latitude']) && is_numeric($_POST['latitude'])) ? $_POST['latitude'] : null;
		$lat = (isset($_POST['longitude']) && is_numeric($_POST['longitude'])) ? $_POST['longitude'] : null;
		
		$posteditid = insertPostText($_POST['text'], $long, $lat);
		if ($posteditid != -1)
		{
			$postid = insertPost($_POST['pid'], $posteditid, $long, $lat);
			if ($postid != -1)
			{
				linkPostText($postid, $posteditid);
				attachFiles($_POST['files'], $postid, $long, $lat);
			}
		}
	}
} else
	$status = "NO_INPUT";

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();

?>