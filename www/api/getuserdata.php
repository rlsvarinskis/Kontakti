<?php
require_once "../util/session.php";

$user = $userdata['id'];
$done = false;

if (isset($_GET['user']) && is_numeric($_GET['user']))
{
	$user = $_GET['user'];
	echo '{"error": "Feature is currently not available"}';
	exit;
}

$sql = "
	SELECT *
	FROM `accounts`
	WHERE `accounts`.`id`='$user'";

$res = mysqli_query($db,$sql);
if (!$res)
{
	echoError("Database error", mysqli_error($db), $sql);
	header('Content-type: text/html');
	die("");
}
$row = $res->fetch_assoc();
echo '{';
	
	if (($key = array_search($row['pid'], $unexisting)) !== false)
	{
		unset($unexisting[$key]);
	}
	
	$nameparts = explode(" ", $userdata['name']);
	
	echo '"id":' . $row['pid'] . ',';
	echo '"name":"' . preg_replace("/\[name\]/", $row['name'], $row['title']) . '",';
	echo '"username":"' . $row['username'] . '",';
	echo '"uid":' . $row['id'] . ',';
	echo '"text":"' . preg_replace(array("/\[first name\]/", "/\[last name\]/", "/\[name\]/"), array($nameparts[0], end($nameparts), $userdata['name']), preg_replace("/\"/", "\\\"", preg_replace("/\n/", "\\n", preg_replace("/\r/", "", $row['text'])))) . '",';
	echo '"liked":' . ($row['liked'] ? "false" : "true") . ',';
	echo '"likes":' . $row['likes'] . ',';
	echo '"comments":' . $row['comments'] . ',';
	echo '"edits":' . $row['edits'] . ',';
	echo '"shares":0,';
	if (isset($row['latitude']) && isset($row['longitude']))
		echo '"geolocation":"' . $row['latitude'] . ',' . $row['longitude'] . '",';
	echo '"time":' . strtotime($row['date']);
	echo '}';
}
if ($stmt = $db->prepare("SELECT * FROM `posts` WHERE `posts`.`deleted`='0' AND `posts`.`pid` IN (?)"))
{
	$bindparam = implode(",", $unexisting);
	$stmt->bind_param("s", $bindparam);
	$stmt->execute();
	$result = $stmt->get_result();
	while ($rw = $result->fetch_assoc())
	{
		if (($key = array_search($rw['pid'], $unexisting)) !== false)
		{
			unset($unexisting[$key]);
		}
	}
	foreach ($unexisting as &$nonexist)
	{
		if ($nonexist !== "")
		{
			if (!$done)
			{
				echo '{';
				$done = true;
			} else
			{
				echo ', {';
			}
			echo '"id":' . $nonexist . ', "removed": true';
			echo '}';
		}
	}
	$stmt->close();
}
echo ']}';
header('Content-type: application/json');
?>