<?php
$verifyaccount = true;
include_once "../util/session.php";

if (isset($_POST['key']) && $userdata['verified'] == 0)
{
	$key = "";
	if ($stmt = $db->prepare("SELECT `key` FROM `profiledata` WHERE `uid`=?"))
	{
		$stmt->bind_param("i", $userdata['id']);
		$stmt->execute();
		$stmt->bind_result($key);
		$stmt->fetch();
		$stmt->close();
	}
	if ($key === "")
	{
		die("Failed to retireve key");
	}
	
	if ($key === $_POST['key'])
	{
		echo "true";
		if ($stmt = $db->prepare("UPDATE accounts SET verified=13 WHERE id=?"))
		{
			$stmt->bind_param("i", $userdata['id']);
			$stmt->execute();
			$stmt->close();
		}
	} else
	{
		echo "Incorrect key";
	}
} else
{
	echo "There is no key >:)";
}
?>