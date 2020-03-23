<?php
include_once "../util/session.php";

$notifications = 0;

if ($stmt = $db->prepare("SELECT `notifications` FROM `profiledata` WHERE uid=?"))
{
	$stmt->bind_param("i", $userdata['id']);
	$stmt->execute();
	$stmt->bind_result($notifications);
	$stmt->fetch();
	$stmt->close();
}

if ($notifications == 0)
{
	echo "Disable";
} else
{
	echo "Enable";
}

if ($stmt = $db->prepare("UPDATE `profiledata` SET `notifications` = NOT `notifications` WHERE uid=?"))
{
	$stmt->bind_param("i", $userdata['id']);
	$stmt->execute();
	$stmt->close();
}
?>