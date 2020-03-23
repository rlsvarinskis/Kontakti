<?php
ob_start();
require "../util/friends.php";
require_once "../util/session.php";
header('Content-type: application/json');

function makeQuery($user, $newid)
{
	global $db;
	global $userdata;
	
	if ($stmt = $db->prepare("SELECT * FROM `friends` WHERE (`fid`=? AND `rid`=?) OR (`fid`=? AND `rid`=?)"))
	{
		$stmt->bind_param("iiii", $userdata['id'], $user, $user, $userdata['id']);
		$stmt->execute();
		workResponse($stmt->get_result(), $user, $newid);
		$stmt->close();
	} else
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
}

function workResponse($res, $user, $newid)
{
	global $userdata;
	$i = $userdata['id'];
	
	if ($res->num_rows > 0)
		alterRelation($i, $user, $newid, $res);
	else if ($newid == 2)
		block($i, $user);
	else
		createFriendship($i, $user, $newid);
}

function alterRelation($i, $user, $newid, $res)
{
	$data = $res->fetch_assoc();
	
	if ($data['rid'] == $i) //I own this relationship
		alterMyRelation($i, $user, $newid, $data);
	else if ($data['rid'] == $user) //The target owns the relationship
		alterTheirRelation($i, $user, $newid, $data);
}

function alterMyRelation($i, $user, $newid, $data)
{
	global $userdata;
	global $db;
	
	if ($data['fstatus'] == 0 && $newid == $data['rstatus'] && $data['rstatus'] != 2) //Friend request still not accepted
	{
		notify($user, $userdata['name'] . ' wants to become a kontakt with you', '/profilemedia/avatar' . $userdata['id'] . '/', '/kontakts.php');
		echoMessage("Kontakt request", "You resent your kontakt request", "info");
	} else if ($data['rstatus'] == 2 && $newid != 2) //Unbanning
	{
		
	} else
	{
		
	}
	
	if (isset($_GET['newid']) && is_numeric($_GET['newid']))
	{;
		if ($newid == -1)
		{
			$sql='DELETE FROM `friends` WHERE `rid`=' . $data['rid'] . ' AND `fid`=' . $data['fid'];
			$ret = mysqli_query($db, $sql);
			if (!$ret)
			{
				echoError("Database error", mysqli_error($db), $sql);
			}
			echoMessage("Remove", "You no longer have anything to do with this kontakt.", "info");
		} else
		{
			
		}
	} else if ($data['fstatus'] == 0) //Unaccepted kontakt request
	{
	} else if ($data['rstatus'] == 2)
	{
		$sql='DELETE FROM `friends` WHERE `rid`=' . $data['rid'] . ' AND `fid`=' . $data['fid'];
		$ret = mysqli_query($db, $sql);
		if (!$ret)
		{
			echoError("Database error", mysqli_error($db), $sql);
		}
		echoMessage("Unblock", "You have unblocked this kontakt", "info");
	} else
	{
		//
	}
}

function alterTheirRelation($i, $user, $newid, $data)
{
	global $db;
	global $userdata;
	echoMessage("Hit", __FILE__ . ":" . __LINE__, "info");
	
	if (isset($_GET['newid']) && is_numeric($_GET['newid']))
	{
		if ($newid == -1)
		{
			$sql='DELETE FROM `friends` WHERE `rid`=' . $data['rid'] . ' AND `fid`=' . $data['fid'];
			$ret = mysqli_query($db, $sql);
			if (!$ret)
			{
				echoError("Database error", mysqli_error($db), $sql);
			}
			echoMessage("Remove", "You no longer have anything to do with this kontakt.", "info");
		} else
		{
			
		}
	} else if ($data['fstatus'] == 0)
	{
		$sql='
		UPDATE `friends` SET `fstatus`=1, `rstatus`=1 WHERE `fid`=' . $i . ' AND `rid`=' . $user;
		$reta = mysqli_query($db, $sql);
		$sql = 'INSERT IGNORE INTO `stalkers`(`uid`, `fid`) VALUES (' . $user . ', ' . $i . ')';
		$retb = mysqli_query($db, $sql);
		$sql = 'INSERT IGNORE INTO `stalkers`(`uid`, `fid`) VALUES (' . $i . ', ' . $user . ')';
		$retc = mysqli_query($db, $sql);
		if (!$reta || !$retb || !$retc)
		{
			echoError("Database error", mysqli_error($db), $sql);
		} else
		{
			notify($user, $userdata['name'] . ' accepted your kontakt request', '/profilemedia/avatar' . $userdata['id'] . '/', '/kontakts.php');
		}
		echoMessage("Kontakt request", "You accepted this kontakt request", "info");
	} else if ($data['fstatus'] == 2)
	{
		echoMessage("Failed to send request", "This kontakt has blocked you.<br />", "info");
	} else
	{
		//
	}
}

$status = "NO_INPUT";

if (isset($_GET['user']) && is_numeric($_GET['user']))
{
	if ($_GET['user'] == $userdata['id'])
		echoMessage("Friendship is magic!", "But sadly.... You can't friend request your self...<br />If you would have been sticking to the official pages, you would have never received this error...<br />But... Since you're here, view this nice picture of friendship:<br /><img src='http://www.watchcartoononline.com/thumbs/My-Little-Pony-Friendship-Is-Magic-Season-2-Episode-7-May-the-Best-Pet-Win-.jpg' alt='PONIES!!!' title='Friendship is magic :D'></img>");
	else
	{
		if (isset($_GET['newid']) && is_numeric($_GET['newid']))
			/*$status = makeQuery(intval($_GET['user']), intval($_GET['newid']));*/
			$status = alterFriendship($userdata['id'], $intval($_GET['user']), intval($_GET['newid']));
		else
			echoMessage("Unspecified action", "No action was specified");
	}
} else
{
	echoMessage("Friendship is magic!", "But sadly.... You didn't specify who you want to become kontakts with...<br />If you would have been sticking to the official pages, you would have never received this error...<br />But... Since you're here, view this nice picture of friendship:<br /><img src='http://www.watchcartoononline.com/thumbs/My-Little-Pony-Friendship-Is-Magic-Season-2-Episode-7-May-the-Best-Pet-Win-.jpg' alt='PONIES!!!' title='Friendship is magic :D'></img>");
}

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>