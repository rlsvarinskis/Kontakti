<?php
ob_start();
require_once "../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getMedia($from, $to, $limit, $offset)
{
	global $db;
	global $userdata;
	
	$sql = "
		SELECT * 
		FROM `media` `content`
		JOIN `accounts` ON `accounts`.`id`=`content`.`uid`
		WHERE `content`.`deleted`='0'
		AND (`content`.`uid`=?)
		AND `content`.`mediaid`<=? AND `content`.`mediaid`>=?
		ORDER BY `content`.`mediaid` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiii", $userdata['id'], $from, $to, $limit, $offset);
		$stmt->execute();
		
		$res = createMediaArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function getMediaInAlbum($from, $to, $limit, $offset, $album)
{
	global $db;
	global $userdata;
	
	$sql = "
		SELECT * 
		FROM `media` `content`
		JOIN `accounts` ON `accounts`.`id`=`content`.`uid`
		WHERE `content`.`deleted`='0' AND `content`.`album`=?
		AND (`content`.`uid`=? OR `content`.`uid` IN (SELECT `fid` FROM `stalkers` WHERE `uid`=?))
		AND `content`.`mediaid`<=? AND `content`.`mediaid`>=?
		ORDER BY `content`.`mediaid` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiiiii", $album, $userdata['id'], $userdata['id'], $from, $to, $limit, $offset);
		$stmt->execute();
		
		$res = createMediaArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createMediaArray($res)
{
	$media = array();
	while ($row = $res->fetch_assoc())
	{	
		$medium = array();
		$medium['id'] = (int) $row['mediaid'];
		$medium['type'] = $row['type'];
		//echo '"text":"' . $text . '",';
		//echo '"liked":' . ($row['liked'] ? "false" : "true") . ',';
		//echo '"likes":' . $row['likes'] . ',';
		//echo '"comments":' . $row['comments'] . ',';
		//echo '"shares":0,';
		$medium['time'] = strtotime($row['date']);
		if (isset($row['latitude']) && isset($row['longitude']))
			$medium['geolocation'] = $row['latitude'] . ',' . $row['longitude'];
		array_push($media, $medium);
	}
	return $media;
}

$limit = 30;
$offset = 0;
$from = time() + 3600;
$to = 0;
$album = "";

if (isset($_GET['limit']) && is_numeric($_GET['limit']))
	$limit = $_GET['limit'];
if (isset($_GET['from']) && is_numeric($_GET['from']))
	$from = $_GET['from'];
if (isset($_GET['to']) && is_numeric($_GET['to']))
	$to = $_GET['to'];
if (isset($_GET['offset']) && is_numeric($_GET['offset']))
	$offset = $_GET['offset'];

$limit = min(max($limit, 3), 64);

if (isset($_GET['album']) && is_numeric($_GET['album']) && $_GET['album'] != "0")
	addJSON("media", getMediaInAlbum($from, $to, $limit, $offset, $_GET['album']));
else
	addJSON("media", getMedia($from, $to, $limit, $offset));

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Webpage error", $errors);

echoJSON();

?>