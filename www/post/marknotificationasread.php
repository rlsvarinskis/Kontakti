<?php
include_once "../util/session.php";

$nid = 0;

if (isset($_POST['id']) && is_numeric($_POST['id']))
{
	$nid = $_POST['id'];
} else
{
	echoMessage("Error!","You have not selected the notification id!");
	die("");
}

$uid=$userdata['id'];

$res = mysqli_query($db,"UPDATE `notifications` SET `read`=1 WHERE `nid`=$nid AND `uid`=$uid");
if (!$res)
{
	echoError("Database error", mysqli_error($db), "UPDATE `notifications` SET `read`=1 WHERE `nid`=$nid AND `uid`=$uid");
}
?>