<?php
date_default_timezone_set('UTC');
require "json.php";
if (isset($_SERVER['HTTP_USER_AGENT']))
{
	$useragent=$_SERVER['HTTP_USER_AGENT'];
	//if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4)))
	//	header('Location: http://kontakti.no-ip.biz/m' . $_SERVER["REQUEST_URI"]);
}

$POST_TIMEOUT = 5; //Timeout between posting two posts


ob_start();

$ip = ip2long($_SERVER['REMOTE_ADDR']);

$userdata = null;
$profile = array();

$db = null;

mainSession();

$loggedIn = isset($userdata);

ob_end_flush();

//if ($userdata['banned'] == 1)
//{
//	removeAllSessions($userdata['id']);
//	addCookie('kontaktisession', 'deleted', date("D, d M Y H:i:s e", 0));
//}

//https://www.google.com/recaptcha/admin/site?siteid=317422338

function encrypt($password)
{
	$salt = substr(hash('whirlpool', uniqid(rand(), true)), 0, 12);
	$hash = hash('whirlpool', $salt . $password . $salt);
	$saltPos = (strlen($password) >= strlen($hash) ? strlen($hash) : strlen($password));
	return substr($hash, 0, $saltPos) . $salt . substr($hash, $saltPos);
}

function userkey($data)
{
	$salt = substr(hash('whirlpool', uniqid(rand(), true)), 0, 12);
	$data = hash('whirlpool', $salt . $data . $salt);
	return strtoupper(substr(uniqid() . $data . uniqid(),0,20));
}

function encryptSalt($password, $saltpassword)
{
	$saltPos = (strlen($password) >= strlen($saltpassword) ? strlen($saltpassword) : strlen($password));
	$salt = substr($saltpassword, $saltPos, 12);
	$hash = hash('whirlpool', $salt . $password . $salt);
	return $saltpassword == substr($hash, 0, $saltPos) . $salt . substr($hash, $saltPos);
}

if ($loggedIn && $userdata['verified'] == 0 && !isset($verifyaccount))
{
	die('<meta http-equiv="refresh" content="0;url=/verify.php" />');
}

function mainSession()
{
	global $db;
	global $reqs;
	$db = connectDB();
	if (isset($_POST['lusername']) && isset($_POST['password']))
	{
		checklogin(isset($_POST['longsession']));
	} else if (isset($_GET['logout']) && isset($_COOKIE['kontaktisession']))
	{
		logout($_COOKIE['kontaktisession']);
	} else if (isset($_GET['stronglogout']))
	{
		if (isset($_COOKIE['kontaktisession']))
		{
			removeAllSessions($_COOKIE['kontaktisession']);
			logout($_COOKIE['kontaktisession']);
		}
	} else if (isset($_COOKIE['kontaktisession']))
	{
		checkSession($_COOKIE['kontaktisession']);
	} else if (isset($_GET['session']))
	{
		checkSession($_GET['session']);
	}
	global $userdata;
	if ($userdata == null)
		if (!isset($reqs))
			die('<meta http-equiv="refresh" content="0;url=/" />');
		else
			foreach($_COOKIE as $key => $value)
				addCookie($key, 'deleted', date("D, d M Y H:i:s e", 0));
}

function addCookie($key, $value, $expire)
{
	header("Set-Cookie: $key=$value; expires=$expire; path=/;", false);
}

function getData($session)
{
	global $db;
	global $userdata;
	if ($stmt = $db->prepare("SELECT * FROM `sessions` JOIN `accounts` ON `accounts`.`id`=`sessions`.`uid` WHERE `sessionid`=? AND `sessions`.`expired`=0"))
	{
		$stmt->bind_param("s", $session);
		$stmt->execute();
		$result = $stmt->get_result();
		if (mysqli_num_rows($result) > 0)
			$userdata = $result->fetch_array();
		else
			foreach($_COOKIE as $key => $value)
				addCookie($key, 'deleted', date("D, d M Y H:i:s e", 0));
		$stmt->close();
	} else
	{
		echoDBError(mysqli_error($db), "/util/session.php:104");
	}
}

function connectDB()
{
	try
	{
		$db = new mysqli("p:kontakti_database", "Website", "qaSLMHwN2xDXXMCH", "kontakti");
	} catch (DbException $e)
	{
		if (strstr($e->getMessage(), 'MySQL server has gone away') != FALSE)
			$db = new mysqli("p:kontakti_database", "Website", "qaSLMHwN2xDXXMCH", "kontakti");
		else
			throw $e;
	}
	
	return $db;
}

function checklogin($long)
{
	global $db;
	$usernamet = $_POST['lusername'];
	$password = $_POST['password'];
	$realPass = "";
	$id = -1;
	if ($stmt = $db->prepare("SELECT `id`, `password` FROM `accounts` WHERE `username`=?"))
	{
		$stmt->bind_param("s", $usernamet);
		$stmt->execute();
		$stmt->bind_result($id, $realPass);
		$stmt->fetch();
		$stmt->close();
		if (encryptSalt($password, $realPass))
		{
			$sessionid = time() . md5(uniqid($usernamet . $password . time(), true));
			
			$einc = 0;
			$timeunit = "+24 hours";
			if ($long)
			{
				$timeunit="+1 year";
				$einc = 1;
			}
			
			$mysqldate = date("Y-m-d H:i:s", strtotime($timeunit));
			$nowtime = date("Y-m-d H:i:s");
			$expired = 0;
			$country = geoip_country_code3_by_name($_SERVER['REMOTE_ADDR']);
			
			if ($state = $db->prepare("INSERT INTO `sessions` (`uid`, `sessionid`, `ip`, `created`, `expire`, `einc`, `expired`, `country`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"))
			{
				$state->bind_param("isissiis", $id, $sessionid, $GLOBALS['ip'], $nowtime, $mysqldate, $einc, $expired, $country);
				$state->execute();
				$state->close();
				getData($sessionid);
				if ($stmt = $db->prepare("UPDATE `accounts` SET `lastip`=?, `lastdate`=? WHERE `id`=?;"))
				{
					$curdate = date("Y-m-d H:i:s");
					$stmt->bind_param("isi", $GLOBALS['ip'], $curdate, $id);
					$stmt->execute();
					$stmt->close();
					addCookie("kontaktisession", $sessionid, $mysqldate);
					if (!isset($_POST['canceldie']))
						die('<meta http-equiv="refresh" content="0;url=/" />');
				} else
					echoDBError(mysqli_error($db), "/util/session.php:174");
			} else
				echoDBError(mysqli_error($db), "/util/session.php:168");
		}
	} else
		echoDBError(mysqli_error($db), "/util/session.php:144");
}

function removeSession($cookie)
{
	global $db;
	if ($stmt = $db->prepare("UPDATE `sessions` SET `expired`=1 WHERE `sessionid`=?"))
	{
		$stmt->bind_param("s", $cookie);
		$stmt->execute();
		$stmt->close();
	} else
		echoDBError(mysqli_error($db), "/util/session.php:195");
}

function removeAllSessions($id)
{
	global $db;
	if ($stmt = $db->prepare("UPDATE `sessions` SET `expired`=1 WHERE `uid`=?"))
	{
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$stmt->close();
	} else
		echoDBError(mysqli_error($db), "/util/session.php:206");
}

function logout($id)
{
	foreach($_COOKIE as $key => $value)
		addCookie($key, 'deleted', date("D, d M Y H:i:s e", 0));
	removeSession($id);
}

function checkSession($session)
{
	global $db;
	if ($stmt = $db->prepare("SELECT `expired`, `expire`, `einc` FROM `sessions` WHERE `sessionid`=? AND `expired`=0"))
	{
		$sep = "";
		$sei = 0;
		$exp = 0;
		$stmt->bind_param("s", $session);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($exp, $sep, $sei);
		$stmt->fetch();
		$stmt->close();
		
		if ($exp === 1)
		{
			logout($session);
			return false;
		}
		
		if ($sei === 0 && strtotime($sep) <= time())
		{
			logout($session);
			return false;
		}
		
		$time = strtotime("+24 hours");
		if ($sei === 1)
			$time = strtotime("+1 year");
		addCookie("kontaktisession", $session, date("D, d M Y H:i:s e", $time));
		
		if ($stmt = $db->prepare("UPDATE `sessions` SET `expire`=? WHERE `sessionid`=?"))
		{
			$date = date("Y-m-d H:i:s", $time);
			$stmt->bind_param("ss", $date, $session);
			$stmt->execute();
			$stmt->close();
			getData($session);
			return true;
		}
	} else
		echoDBError(mysqli_error($db), "/util/session.php:226");
	return false;
}

function notify($userid, $text, $image, $url)
{
	global $db;
	$mysqldate = date("Y-m-d H:i:s");
	if ($stmt = $db->prepare("INSERT INTO `notifications`(`uid`, `time`, `text`, `image`, `url`) VALUES (?, ?, ?, ?, ?)"))
	{
		$stmt->bind_param("issss", $userid, $mysqldate, $text, $image, $url);
		$stmt->execute();
		$stmt->close();
	} else
	{
		echoDBError(mysqli_error($db), "/util/session.php:269");
		return false;
	}
}
?>
