<?php
ob_start();
require_once "../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getAlbums($from, $to, $limit, $offset)
{
	global $db;
	global $userdata;
	
	$sql = "SELECT *,
		(SELECT COUNT(*) FROM `media` WHERE `media`.`album`=`album`.`album`) AS `amount`
		FROM `albums` `album`
		WHERE `album`.`deleted`='0' AND `album`.`uid`=? AND `album`.`album`<=" . /*FROM_UNIXTIME*/ "(?) AND `album`.`album`>=" . /*FROM_UNIXTIME*/ "(?)
		ORDER BY `album`.`album` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiii", $userdata['id'], $from, $to, $limit, $offset);
		$stmt->execute();
		
		$res = createAlbumArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function getFriendsAlbums($from, $to, $limit, $offset, $uid)
{
	global $db;
	global $userdata;
	
	$sql = "SELECT *,
		(SELECT COUNT(*) FROM `media` WHERE `media`.`album`=`album`.`album`) AS `amount`
		FROM `albums` `album`
		WHERE `album`.`deleted`='0' AND `album`.`album`<=" . /*FROM_UNIXTIME*/ "(?) AND `album`.`album`>=" . /*FROM_UNIXTIME*/ "(?)
		`album`.`uid`=? AND `album`.`uid` IN (SELECT `fid` FROM `stalkers` WHERE `uid`=?)
		ORDER BY `album`.`album` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiiii", $from, $to, $uid, $userdata['id'], $limit, $offset);
		$stmt->execute();
		
		$res = createAlbumArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createAlbumArray($res)
{
	$albums = array();
	while ($row = $res->fetch_assoc())
	{
		$album = array();
		
		$album['id'] = (int) $row['album'];
		$album['name'] = $row['name'];
		$album['cover'] = $row['cover'];
		$album['amount'] = $row['amount'];
		$album['time'] = strtotime($row['date']);
		if (isset($row['latitude']) && isset($row['longitude']))
			$album['geolocation'] = $row['latitude'] . ',' . $row['longitude'];
		array_push($albums, $album);
	}
	return $albums;
}

$limit = 30;
$offset = 0;
$from = time() + 3600;
$to = 0;

if (isset($_GET['limit']) && is_numeric($_GET['limit']) && $_GET['limit'] > 0)
	$limit = $_GET['limit'];
if (isset($_GET['from']) && is_numeric($_GET['from']))
	$from = $_GET['from'];
if (isset($_GET['to']) && is_numeric($_GET['to']))
	$to = $_GET['to'];
if (isset($_GET['offset']) && is_numeric($_GET['offset']))
	$offset = $_GET['offset'];

$limit = min(max($limit, 3), 64);

if (isset($_GET['user']) && is_numeric($_GET['user']) && $_GET['user'] != $userdata['id'])
	addJSON("album", getFriendsAlbums($from, $to, $limit, $offset, $_GET['user']));
else
	addJSON("album", getAlbums($from, $to, $limit, $offset));

/*if (count($albums) < $limit)
	array_push($albums, array(
		"id"=>0,
		"name"=>"All photos",
		"cover"=>1,
		"amount"=>"?",
		"time"=>0
	));*/

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>