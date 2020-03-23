<?php
ob_start();
include_once "../../util/session.php";
header('Content-type: application/json');

$status = "SUCCESS";

function getPost($post)
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
		WHERE `post`.`deleted`='0' AND `post`.`pid`=?
		LIMIT 1"; //TODO privacy
	
	if ($stmt = $db->prepare($sql))
	{
		$stmt->bind_param("ii", $userdata['id'], $post);
		$stmt->execute();
		
		$res = createPostObject($stmt->get_result()->fetch_assoc());
		
		$stmt->close();
		
		return $res;
	} else
	{
		$GLOBALS['status'] = "DB_ERROR";
		echoDBError(mysqli_error($db), __FILE__ . ":" . __LINE__);
		return false;
	}
}

function createPostObject($row)
{
	global $userdata;
	$nameparts = explode(" ", $userdata['name']);
	
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
	
	return $postobject;
}

$post = 0;

if (isset($_GET['pid']) && is_numeric($_GET['pid']))
	addJSON("post", getPost($_GET['pid']));
else
	$status = "NO_INPUT";

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>