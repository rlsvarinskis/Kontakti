<?php

function createFriendship($i, $user, $newid)
{
	global $db;
	global $userdata;
	
	if ($i == $user)
	{
		echoMessage("Nope.avi", "You can't be friends with yourself, cuck!", "info");
		return;
		//pls fuk off
	}
	
	$min = min($i, $user);
	$max = max($i, $user);
	
	if ($stmt = $db->prepare("INSERT INTO `friends`(`rid`, `fid`, `rstatus`, `fstatus`) VALUES (?,?,?,0)"))
	{
		$stmt->bind_param("iii", $min, $max, $newid);
		$stmt->execute();
		if ($newid != 2)
		{
			notify($user, $userdata['name'] . ' wants to become a kontakt with you', '/profilemedia/avatar' . $userdata['id'] . '/', '/kontakts.php');
			echoMessage("Kontakt request", "Your kontakt request has been sent!", "info");
		} else
		{
			echoMessage("B&", "You successfully banned this loser!", "info");
		}
		$stmt->close();
	} else
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
}

function alterFriendship($i, $user, $newid)
{
	global $db;
	global $userdata;
	
	if ($i == $user)
	{
		echoMessage("Nope.avi", "You can't friend request yourself, cuck!", "info");
		return;
	}
	
	$min = min($i, $user);
	$max = max($i, $user);
	
	$newstatus = ($min == $i) ? "$newid,0" : "0,$newid";
	$tochng = ($min == $i) ? "r" : "f";
	
	if ($stmt = $db->prepare("INSERT INTO `friends`(`rid`, `fid`, `rstatus`, `fstatus`) VALUES (?,?,$newstatus) ON DUPLICATE KEY (UPDATE `friends` SET `" . $tochng . "status`=? WHERE `rid`=? AND `fid`=?)"))
	{
		$stmt->bind_param("iiiii", $min, $max, $newid, $min, $max);
		$stmt->execute();
		echoMessage("Altered", "You successfully altered your friendship status!", "info");
		echoMessage("Affected", $stmt->affected_rows . " rows were affected", "info");
		if ($stmt->affected_rows == 1)
		{
			notify($user, $userdata['name'] . ' wants to become a kontakt with you', '/profilemedia/avatar' . $userdata['id'] . '/', '/kontakts.php');
			echoMessage("Kontakt request", "Your kontakt request has been sent!", "info");
		}
		$stmt->close();
	} else
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
}

function block($i, $user)
{
	global $db;
	global $userdata;
	
	if ($i == $user)
	{
		echoMessage("Nope.avi", "You can't block yourself, cuck!", "info");
		return;
	}
	
	$min = min($i, $user);
	$max = max($i, $user);
	
	$newstatus = ($min == $i) ? "2,0" : "0,2";
	$tochng = ($min == $i) ? "r" : "f";
	
	if ($stmt = $db->prepare("INSERT INTO `friends`(`rid`, `fid`, `rstatus`, `fstatus`) VALUES (?,?,$newstatus) ON DUPLICATE KEY (UPDATE `friends` SET `" . $tochng . "status`= 2 WHERE `rid`=? AND `fid`=?)"))
	{
		$stmt->bind_param("iiii", $min, $max, $min, $max);
		$stmt->execute();
		echoMessage("B&", "You successfully blocked this loser!", "info");
		echoMessage("Affected", $stmt->affected_rows . " rows were affected", "info");
		$stmt->close();
	} else
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
}

?>