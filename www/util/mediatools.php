<?php

function getAlbums($uid)
{
	global $db;
	
	$albums = [];
	
	if ($stmt = $db->prepare("SELECT * FROM `albums` WHERE `uid`=?")) //Select albums
	{
		$stmt->bind_param("i", $uid);
		$stmt->execute();
		$result = $stmt->get_result();
		for ($i = 0; $i < $result->num_rows; $i++)
			$albums[$i] = $result->fetch_assoc();
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	
	return $albums;
}

function getAlbum($album)
{
	global $userdata;
	global $db;
	
	$albumdata = null;
	
	if ($stmt = $db->prepare("SELECT * FROM `albums` WHERE `album`=? AND `uid`=? LIMIT 1")) //Select album
	{
		$stmt->bind_param("ii", $album, $userdata['id']);
		$stmt->execute();
		$albumdata = $stmt->get_result()->fetch_assoc();
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	
	return $albumdata;
}

function getAlbumWithName($album)
{
	global $userdata;
	global $db;
	
	$albumdata = null;
	
	if ($stmt = $db->prepare("SELECT * FROM `albums` WHERE `name`=? AND `uid`=? LIMIT 1")) //Select album
	{
		$stmt->bind_param("si", $album, $userdata['id']);
		$stmt->execute();
		$albumdata = $stmt->get_result()->fetch_assoc();
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	
	return $albumdata;
}

function getOrCreateAlbum($album, $date, $longitude = null, $latitude = null)
{
	global $userdata;
	global $db;
	
	$albumdata = getAlbumWithName($album);
	
	if ($albumdata == null)
		$albumdata = createAlbum($album, $date, $longitude, $latitude);
	
	return $albumdata;
}

function createAlbum($album, $date, $longitude = null, $latitude = null)
{
	global $userdata;
	global $db;
	
	if ($stmt = $db->prepare("INSERT INTO `albums`(`uid`, `name`, `date`, `longitude`, `latitude`) VALUES (?, ?, ?, ?, ?)")) //Create album
	{
		$stmt->bind_param("issss", $userdata['id'], $album, $date, $longitude, $latitude);
		$stmt->execute();
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	
	return getAlbum($db->insert_id);
}

function deleteAlbum($album)
{
	global $userdata;
	global $db;
	
	if ($stmt = $db->prepare("UPDATE `albums` SET `deleted`=1 WHERE `album`=? AND `uid`=?")) //Select album
	{
		$stmt->bind_param("ii", $album, $userdata['id']);
		$stmt->execute();
		if ($stmt->affected_rows == 0)
		{
			$stmt->close();
			return "NOTHING_CHANGED";
		} else
		{
			$stmt->close();
			return "SUCCESS";
		}
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		return "DB_ERROR";
	}
}

function renameAlbum($album, $name)
{
	global $userdata;
	global $db;
	
	if ($stmt = $db->prepare("UPDATE `albums` SET `name`=? WHERE `album`=? AND `uid`=?")) //Select album
	{
		$stmt->bind_param("sii", $name, $album, $userdata['id']);
		$stmt->execute();
		if ($stmt->affected_rows == 0)
		{
			$stmt->close();
			return "NOTHING_CHANGED";
		} else
		{
			$stmt->close();
			return "SUCCESS";
		}
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		return "DB_ERROR";
	}
}

function moveMedia($to, $media)
{
	if (sizeof($media) == 0)
	{
		//echoMessage("Moved all media!", "You have successfully moved NO media! Good job 'Hacker4Chan'.");
		return "NOTHING_CHANGED";
	}
	for ($i = 0; $i < sizeof($media); $i++)
	{
		if (!is_numeric($media[$i]))
		{
			//echoMessage("Failed to move media", "You must specify what you want to move!");
			return "NO_INPUT";
		}
	}
	
	global $userdata;
	global $db;
	
	//$questions = join(',', array_fill(0, count($media), '?'));
	$media = implode(",", $media);
	
	if ($stmt = $db->prepare("UPDATE `media` SET `album`=? WHERE `uid`=? AND `mediaid` IN ($media)")) //Select album
	{
		$stmt->bind_param("ii", $to, $userdata['id']);
		$stmt->execute();
		if ($stmt->affected_rows == 0)
		{
			$stmt->close();
			//echoMessage("Moved all media!", "You have successfully moved NO media! Good job 'Hacker4Chan'.");
			return "NOTHING_CHANGED";
		} else
		{
			//echoMessage("Moved all media!", "You moved " . $stmt->affected_rows . " pieces of media. " . $media);
			$stmt->close();
			return "SUCCESS";
		}
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		return "DB_ERROR";
	}
}



function addMediaToPost($postid, $mediaid)
{
	global $db;
	
	if ($stmt = $db->prepare("INSERT INTO `media_posts`(`postid`, `mediaid`) VALUES (?, ?)")) //Insert
	{
		$stmt->bind_param("ii", $postid, $mediaid);
		$stmt->execute();
		if ($stmt->affected_rows == 0)
		{
			$stmt->close();
			return "NOTHING_CHANGED";
		} else
		{
			$stmt->close();
			return "SUCCESS";
		}
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		return "DB_ERROR";
	}
}


function getImages($uid, $album = -1)
{
	global $db;
	
	$images = [];
	
	$albumText = "";
	if ($album != -1)
		$albumText = " AND `album`=" . $album;
	
	if ($stmt = $db->prepare("SELECT * FROM `media` WHERE `uid`=?" . $albumText . " ORDER BY `time` DESC"))
	{
		$stmt->bind_param("i", $uid);
		$stmt->execute();
		$result = $stmt->get_result();
		for ($i = 0; $i < mysqli_num_rows($result); $i++)
			$images[$i] = $result->fetch_assoc();
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	
	return $images;
}


function saveImage($data, $album, $date, $privacy = 0)
{
	global $userdata;
	global $db;
	
	$filename = ":";
	
	$type = "png";
	$data = preg_replace('#^data:image/([.a-zA-Z0-9-_]+);base64,#', '$1;', $data);
	$type = substr($data, 0, strpos($data, ";"));
	
	$data = preg_replace('#^[.a-zA-Z0-9-_]+;#', '', $data);
	$data = str_replace('', '', $data);
	
	if ($stmt = $db->prepare("INSERT INTO `media`(`uid`, `album`, `date`, `type`, `privacy`) VALUES (?,?,?,?,?)")) //Insert media into database
	{
		$stmt->bind_param("iissi", $userdata['id'], $album['album'], $date, $type, $privacy);
		$stmt->execute();
		$filename = $stmt->insert_id;
		$stmt->close();
	} else
	{
		echoDBError($db->error, __FILE__ . ":" . __LINE__);
		$GLOBALS['status'] = "DB_ERROR";
	}
	$data = str_replace(' ', '+', $data);
	$data = base64_decode($data);
	$file = "D:\\wamp\\www\\kontakti\\media\\$filename.$type"; //TODO use variables instead of hardcoded string
	$success = file_put_contents($file, $data);
	return $filename;
}

?>