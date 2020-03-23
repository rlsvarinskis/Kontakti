<?php
include "../util/session.php";

$mysqldate = date("Y-m-d H:i:s");

$image = $_POST['imgdataurl'];
if (strlen($image) > 10)
{
	$album = getOrCreateAlbum("Profile pictures", $mysqldate);
	$imgname = saveImage($image, $album, $mysqldate);
	if ($stmt = $db->prepare("UPDATE accounts SET picture=? WHERE id=?"))
	{
		$stmt->bind_param("si", $filename, $userdata['id']);
		$stmt->execute();
		$stmt->close();
	}
} else
	echoErr("No image", "To change your profile picture you must provide a picture to change it to.");
?>