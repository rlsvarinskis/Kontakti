<?php
$reqs = true;
include "../util/session.php";

$imgurl = "../images/notfound.png";
$ctype = "image/png";

if (isset($_GET['id']))
{
	if ($stmt = $db->prepare("SELECT `mediaid`,`type` FROM `media` WHERE `mediaid`=? AND `deleted`=0"))
	{
		$stmt->bind_param("s", $_GET['id']);
		$stmt->execute();
		$result = $stmt->get_result();
		if (mysqli_num_rows($result) > 0)
		{
			$data = $result->fetch_array();
			$imgurl = "../media/" . $data['mediaid'];
			if (!file_exists($imgurl)) $imgurl = "../images/notfound.png";
			else $ctype = $data['type'];
		}
		$stmt->close();
	}
} 

$headers = apache_request_headers();
$lmod = "" . gmdate('D, d M Y H:i:s', filemtime($imgurl));

header("Content-type: " . $ctype);

if ($imgurl != "../images/notfound.png")
{
	foreach ($headers as $header => $value)
	{
		if ($header == "If-Modified-Since")
		{
			if ($value == $lmod)
			{
				header("HTTP/1.1 304 Not Modified");
				exit;
			}
		}
	}
}

header('Last-Modified: ' . $lmod);
echo file_get_contents($imgurl);
?>