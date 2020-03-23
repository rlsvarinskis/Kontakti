<?php
include_once "../util/session.php";

if (isset($_GET['color']))
{
	$color = $_GET['color'];
	if (preg_match('/^[a-f0-9]{6}$/i', $color))
	{
		if ($stmt = $db->prepare("UPDATE objectdata SET bgcolor=? WHERE uid=?"))
		{
			$stmt->bind_param("si", $color, $userdata['id']);
			$stmt->execute();
			$stmt->close();
		}
	}
}
?>