<?php
ob_start();
require_once "../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getFriends($from, $to, $limit, $offset)
{
	global $db;
	global $userdata;
	
	$sql = "(SELECT *, `friends`.`fstatus` AS `status`, `friends`.`rstatus` AS `yourstatus`
		FROM `friends` JOIN `accounts` ON `accounts`.`id`=`friends`.`fid` WHERE `friends`.`rid`=? ORDER BY `time`,`id` DESC LIMIT ?) UNION (SELECT *, `friends`.`rstatus` AS `status`, `friends`.`fstatus` AS `yourstatus`
		FROM `friends` JOIN `accounts` ON `accounts`.`id`=`friends`.`rid` WHERE `friends`.`fid`=? ORDER BY `time`,`id` DESC LIMIT ?)
		LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiiii", $userdata['id'], $limit, $userdata['id'], $limit/*, $from, $to*/, $limit, $offset);
		$stmt->execute();
		
		$res = createFriendsArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createFriendsArray($res)
{
	$kontakts = array();
	while ($row = $res->fetch_assoc())
	{
		if ($row['status'] == $row['yourstatus'] && $row['status'] == 0)
			continue;
		if ($row['status'] == 2)
			$row['status'] = 1;
		array_push($kontakts, array(
			"id" => (int) $row['id'],
			"name" => $row['name'],
			"url" => $row['username'],
			"theirtype" => $row['status'],
			"yourtype" => $row['yourstatus'],
			"time" => strtotime($row['time'])
		));
	}
	return $kontakts;
}

$limit = 30;
$offset = 0;
$from = 18446744073709551615;
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

$limit = min(max($limit, 3), 512);

addJSON("kontakt", getFriends($from, $to, $limit, $offset));

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Webpage error", $errors);

echoJSON();
?>