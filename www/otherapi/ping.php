<?php
include_once "../util/session.php";

if (isset($_GET['getpings']))
{
	
	$sql = "SELECT * FROM pingpong WHERE pong='" . $userdata['id'] . "';";
	
	$res = mysqli_query($db, $sql);
	if (!$res)
	{
		echo "Error: " . mysqli_error($db);
	} else
	{
		while ($row = mysqli_fetch_array($res))
		{
			echo $row['ping'];
		}
	}
} else
{
	$ping = null;
	
	if (isset($_GET['ping']) && is_numeric($_GET['ping']))
	{
		$ping = $_GET['ping'];
	} else
	{
		die("Who?");
	}
	
	$sql = "ALTER TABLE pingpong SET ping='" . $userdata['id'] . "',pong='$ping',amount=amount+1 WHERE pong='" . $userdata['id'] . "' AND ping='$ping';";
	
	if (isset($_GET['pong']))
	{
		$sql = "INSERT INTO `pingpong`(`ping`, `pong`, `amount`) VALUES (" . $userdata['id'] . ",$ping,1)";
	}
	
	$res = mysqli_query($db, $sql);
	if (!$res)
	{
		echo "Error: " . mysqli_error($db);
	}
}
?>