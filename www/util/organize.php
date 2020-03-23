<?php
set_time_limit(0);

function connectDB()
{
	global $error;
	$db=mysqli_connect("localhost", "Website", "qaSLMHwN2xDXXMCH","kontakti");
	
	if (!$db)
	{
		die('Could not connect: ' . mysqli_error($db));
	}
	return $db;
}

$db = connectDB();

organizePosts($db);
echo "<br />";
organizeNotifications($db);
echo "<br />";
organizeEdits($db);

function organizeEdits($db)
{
	echo "Organizing edits...<br />";
	flush();

	$res = mysqli_query($db, "SELECT * FROM `postedit` ORDER BY `editid` ASC");

	if (!$res)
	{
		echo mysqli_error($res) . "<br />";
		flush();
	}

	$row = null;
	$lastid = 1;
	$outputid = 0;
	while ($row = mysqli_fetch_array($res))
	{
		$id = $row['editid'];
		$outputid = $id;
		if ($id != $lastid)
		{
			$query = mysqli_query($db, "UPDATE `postedit` SET `editid`='$lastid' WHERE `editid`='$id'");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
			$query = mysqli_query($db, "UPDATE `posts` SET `posteditid`=$lastid WHERE `posteditid`=$id");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
		}
		$lastid += 1;
	}
	$outputid += 1;
	$query = mysqli_query($db, "ALTER TABLE `postedit` AUTO_INCREMENT=$lastid");
	if (!$query)
	{
		echo mysqli_error($query) . "<br />";
		flush();
	}
	echo "Output: Changed $outputid to $lastid<br />";
	flush();
}

function organizePosts($db)
{
	echo "Organizing posts...<br />";
	flush();

	$res = mysqli_query($db, "SELECT * FROM `posts` ORDER BY `pid` ASC");

	if (!$res)
	{
		echo mysqli_error($res) . "<br />";
		flush();
	}

	$row = null;
	$lastid = 1;
	$outputid = 0;
	while ($row = mysqli_fetch_array($res))
	{
		$id = $row['pid'];
		$outputid = $id;
		if ($id != $lastid)
		{
			$query = mysqli_query($db, "UPDATE `posts` SET `pid`='$lastid' WHERE `pid`='$id'");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
			$query = mysqli_query($db, "UPDATE `like` SET `pid`=$lastid WHERE `pid`=$id");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
			$query = mysqli_query($db, "UPDATE `posts` SET `rto`='$lastid' WHERE `rto`='$id'");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
		}
		$lastid += 1;
	}
	$outputid += 1;
	$query = mysqli_query($db, "ALTER TABLE `posts` AUTO_INCREMENT=$lastid");
	if (!$query)
	{
		echo mysqli_error($query) . "<br />";
		flush();
	}
	echo "Output: Changed $outputid to $lastid<br />";
	flush();
}

function organizeNotifications($db)
{
	echo "Organizing notifications...<br />";
	flush();

	$res = mysqli_query($db, "SELECT * FROM notifications ORDER BY nid ASC");

	if (!$res)
	{
		echo mysqli_error($res) . "<br />";
	}

	$row = null;
	$lastid = 1;
	$outputid = 0;
	while ($row = mysqli_fetch_array($res))
	{
		$id = $row['nid'];
		$outputid = $id;
		if ($id != $lastid)
		{
			$query = mysqli_query($db, "UPDATE `notifications` SET `nid`='$lastid' WHERE `nid`='$id'");
			if (!$query)
			{
				echo mysqli_error($query) . "<br />";
				flush();
			}
		}
		$lastid += 1;
	}
	$outputid += 1;
	$query = mysqli_query($db, "ALTER TABLE `notifications` AUTO_INCREMENT=$lastid");
	if (!$query)
	{
		echo mysqli_error($query) . "<br />";
	}
	echo "Output: Changed $outputid to $lastid<br />";
}
?>