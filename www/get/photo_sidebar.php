<?php
$reqs = true;
include "../util/session.php";

$imgurl = "../images/sidebar.png";
$ctype = "image/png";

if (isset($_GET['uid']))
{
	if ($stmt = $db->prepare("SELECT `mediaid`,`type` FROM `accounts` JOIN `media` ON `accounts`.`sidebarbg`=`media`.`mediaid` WHERE `accounts`.`id`=? AND `media`.`deleted`=0"))
	{
		$stmt->bind_param("i", $_GET['uid']);
		$stmt->execute();
		$result = $stmt->get_result();
		if (mysqli_num_rows($result) > 0)
		{
			$data = $result->fetch_array();
			$ctype = $data['type'];
			$imgurl = "../media/" . $data['mediaid'];
		}
		$stmt->close();
	}
} else
{
	if ($stmt = $db->prepare("SELECT `mediaid`,`type` FROM `media` WHERE `mediaid`=? AND `deleted`=0"))
	{
		$stmt->bind_param("s", $userdata['sidebarbg']);
		$stmt->execute();
		$result = $stmt->get_result();
		if (mysqli_num_rows($result) > 0)
		{
			$data = $result->fetch_array();
			$ctype = $data['type'];
			$imgurl = "../media/" . $data['mediaid'];
		}
		$stmt->close();
	}
}

$headers = apache_request_headers();
$modifiedSince = "" . gmdate('D, d M Y H:i:s', filemtime($imgurl));

header("Content-type: " . $ctype);

foreach ($headers as $header => $value)
{
	if ($header == "If-Modified-Since")
	{
		if ($value == $modifiedSince)
		{
			header("HTTP/1.1 304 Not Modified");
			exit;
		}
	}
}

header('Last-Modified: ' . $modifiedSince);

echo file_get_contents($imgurl);
?>