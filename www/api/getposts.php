<?php
ob_start();
include_once "../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getPosts($limit, $offset, $from, $to, $parent)
{
	global $db;
	global $userdata;
	
	$sql = "
		SELECT *,
		(UNIX_TIMESTAMP(date)) AS `time`,
		(SELECT COUNT(*) FROM `like` WHERE `pid`=`post`.`pid`) AS `likes`,
		(SELECT COUNT(*) FROM `posts` `com` WHERE `com`.`rto`=`post`.`pid` AND `com`.`deleted`=0) AS `comments`,
		(SELECT GROUP_CONCAT(`mediaid`) FROM `media_posts` `media` WHERE `media`.`postid`=`post`.`pid`) AS `media`,
		((SELECT COUNT(*) FROM `postedit` `editcount` WHERE `editcount`.`pid`=`post`.`pid`)-1) AS `edits`,
		(SELECT `text` FROM `postedit` `thisedit` WHERE `thisedit`.`editid`=`post`.`posteditid`) AS `text`,
		EXISTS(SELECT * FROM `like` `iliked` WHERE `iliked`.`pid`=`post`.`pid` AND `iliked`.`uid`=?) AS `liked`
		FROM `posts` `post`
		JOIN `accounts` ON `accounts`.`id`=`post`.`uid`
		WHERE `post`.`deleted`='0' AND `post`.`date`<=FROM_UNIXTIME(?) AND `post`.`date`>=FROM_UNIXTIME(?) AND `post`.`rto`=? AND (`post`.`uid`=? OR `post`.`uid` IN (SELECT `fid` FROM `stalkers` WHERE `uid`=?))
		ORDER BY `post`.`pid` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiiiiii", $userdata['id'], $from, $to, $parent, $userdata['id'], $userdata['id'], $limit, $offset);
		$stmt->execute();
		
		$res = createPostArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function getFriendsPosts($limit, $offset, $from, $to, $post, $uid)
{
	global $db;
	global $userdata;
	
	$sql = "
		SELECT *,
		(UNIX_TIMESTAMP(date)) AS `time`,
		(SELECT COUNT(*) FROM `like` WHERE `pid`=`post`.`pid`) AS `likes`,
		(SELECT COUNT(*) FROM `posts` `com` WHERE `com`.`rto`=`post`.`pid` AND `com`.`deleted`=0) AS `comments`,
		(SELECT GROUP_CONCAT(`mediaid`) FROM `media_posts` `media` WHERE `media`.`postid`=`post`.`pid`) AS `media`,
		((SELECT COUNT(*) FROM `postedit` `editcount` WHERE `editcount`.`pid`=`post`.`pid`)-1) AS `edits`,
		(SELECT `text` FROM `postedit` `thisedit` WHERE `thisedit`.`editid`=`post`.`posteditid`) AS `text`,
		EXISTS(SELECT * FROM `like` `iliked` WHERE `iliked`.`pid`=`post`.`pid` AND `iliked`.`uid`=?) AS `liked`
		FROM `posts` `post`
		JOIN `accounts` ON `accounts`.`id`=`post`.`uid`
		WHERE `post`.`deleted`='0' AND `post`.`date`<=FROM_UNIXTIME(?) AND `post`.`date`>=FROM_UNIXTIME(?) AND `post`.`rto`=? AND `post`.`uid`=?
		ORDER BY `post`.`pid` DESC LIMIT ? OFFSET ?";
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("iiiiiii", $userdata['id'], $from, $to, $parent, $uid, $limit, $offset);
		$stmt->execute();
		
		$res = createPostArray($stmt->get_result());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createPostArray($res)
{
	global $userdata;
	$nameparts = explode(" ", $userdata['name']);
	
	$posts = array();
	
	while ($row = $res->fetch_assoc())
	{
		$postobject = array();
		
		$postobject["id"] = (int) $row['pid'];
		$postobject["name"] = preg_replace("/\[name\]/", $row['name'], $row['title']);
		$postobject["username"] = $row['username'];
		$postobject["uid"] = (int) $row['id'];
		$postobject["text"] = preg_replace(array("/\[first name\]/", "/\[last name\]/", "/\[name\]/"), array($nameparts[0], end($nameparts), $userdata['name']), $row['text']);
		$postobject["liked"] = $row['liked'] == true;
		$postobject["likes"] = (int) $row['likes'];
		$postobject['comments'] = (int) $row['comments'];
		if ($row['media'] == "")
			$postobject['media'] = array();
		else
			$postobject["media"] = explode(",", $row['media']);
		$postobject["edits"] = (int) $row['edits'];
		$postobject["shares"] = 0;
		$postobject["time"] = $row['time'];
		if (isset($row['latitude']) && isset($row['longitude']))
			$postobject["geolocation"] = $row['latitude'] . ',' . $row['longitude'];
		array_push($posts, $postobject);
	}
	
	return $posts;
}

$limit = 30;
$offset = 0;
$from = time() + 3600;
$to = 0;
$post = 0;

if (isset($_GET['limit']) && is_numeric($_GET['limit']))
	$limit = $_GET['limit'];
if (isset($_GET['from']) && is_numeric($_GET['from']))
	$from = $_GET['from'];
if (isset($_GET['to']) && is_numeric($_GET['to']))
	$to = $_GET['to'];
if (isset($_GET['offset']) && is_numeric($_GET['offset']))
	$offset = $_GET['offset'];
if (isset($_GET['pid']) && is_numeric($_GET['pid']))
	$post = $_GET['pid'];

$limit = min(max($limit, 3), 128);

if (isset($_GET['user']) && is_numeric($_GET['user']))
	addJSON("post", getFriendsPosts($limit, $offset, $from, $to, $post, $_GET['user']));
else
	addJSON("post", getPosts($limit, $offset, $from, $to, $post));

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>