<?php
ob_start();
require_once "../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getNotifications($limit, $offset, $from, $to)
{
	global $db;
	global $userdata;
	
	$sql = 	"SELECT *
		FROM `notifications`
		WHERE `uid`=?
		AND `nid`<=? AND `nid`>=?
		ORDER BY `nid` DESC
		LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiii", $userdata['id'], $from, $to, $limit, $offset);
		$stmt->execute();
		
		$res = createNotificationArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createNotificationArray($res)
{
	$notifications = array();
	
	while ($row = $res->fetch_assoc())
		array_push($notifications, array(
			"id" => (int) $row['nid'],
			"text" => $row['text'],
			"icon" => $row['image'],
			"url" => $row['url'],
			"read" => $row['read'] == 1
		));
	
	return $notifications;
}

$limit = 15;
$offset = 0;
$from = time() + 3600;
$to = 0;

if (isset($_GET['limit']) && is_numeric($_GET['limit']))
	$limit = $_GET['limit'];
if (isset($_GET['from']) && is_numeric($_GET['from']))
	$from = $_GET['from'];
if (isset($_GET['to']) && is_numeric($_GET['to']))
	$to = $_GET['to'];
if (isset($_GET['offset']) && is_numeric($_GET['offset']))
	$offset = $_GET['offset'];

$limit = min(max($limit, 3), 512);

addJSON("notifications", getNotifications($limit, $offset, $from, $to));

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Webpage error", $errors);

echoJSON();
?>