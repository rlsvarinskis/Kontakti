<?php
ob_start();
require "../util/mediatools.php";
require_once "../util/session.php";
header('Content-type: application/json');

$status = "NO_INPUT";

function makeAlbum()
{
	$result = null;
	if (empty($_POST['name']))
		echoMessage("Failed to create an album", "To create an album, you must specify a name");
	else if (isset($_POST['longitude']) && isset($_POST['latitude']) && is_numeric($_POST['longitude']) && is_numeric($_POST['latitude']))
		$result = make($_POST['name'], $_POST['longitude'], $_POST['latitude']);
	else
		$result = make($_POST['name']);
	
	if ($result != null)
	{
		$album = array();
		
		$album['id'] = (int) $result['album'];
		$album['name'] = $result['name'];
		$album['cover'] = $result['cover'];
		/*$album['amount'] = (int) $result['amount'];*/
		$album['amount'] = "?";
		if (isset($result['latitude']) && isset($result['longitude']))
			$album['geolocation'] = $result['latitude'] . ',' . $result['longitude'];
		$album['time'] = strtotime($result['date']);
		return $album;
	}
}

function make($name, $long = null, $lat = null)
{
	$GLOBALS['status'] = "SUCCESS";
	return createAlbum($name, date("Y-m-d H:i:s"), $long, $lat);
}

function delAlbum()
{
	if (!isset($_POST['album']))
		echoMessage("Failed to delete album", "You must specify which album you want to delete");
	else if (!is_numeric($_POST['album']))
		echoMessage("Failed to delete album", "You must specify the id of the album you want to delete");
	else
		$GLOBALS['status'] = strtoupper(deleteAlbum($_POST['album']));
}

function renAlbum()
{
	if (!isset($_POST['album']))
		echoMessage("Failed to rename album", "You must specify which album you want to rename");
	else if (!is_numeric($_POST['album']))
		echoMessage("Failed to rename album", "You must specify the id of the album you want to rename");
	else if (empty($_POST['newname']))
		echoMessage("Failed to rename album", "You must specify a new name for the album");
	else
		$GLOBALS['status'] = strtoupper(renameAlbum($_POST['album'], $_POST['newname']));
}

function movMedia()
{
	if (!isset($_POST['to']))
		echoMessage("Failed to move media", "You must specify which album you want to move the media to");
	else if (!is_numeric($_POST['to']))
		echoMessage("Failed to move media", "You must specify the id of the album you want to move the media to");
	else if (empty($_POST['media']))
		echoMessage("Failed to rename album", "You must specify a new name for the album");
	else
		$GLOBALS['status'] = strtoupper(moveMedia($_POST['to'], explode(",", $_POST['media'])));
}

if (!empty($_POST['action']))
{
	switch (strtolower($_POST['action']))
	{
		case "make":
			makeAlbum();
			break;
		case "delete":
			delAlbum();
			break;
		case "rename":
			renAlbum();
			break;
		case "move":
			movMedia();
			break;
		case "cover":
			break;
		default:
			break;
	}
}

addJSON("status", $status);

$errors = ob_get_clean();
if ($errors != '')
	echoErr("Server side error", $errors);

echoJSON();
?>