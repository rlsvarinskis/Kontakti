<?php

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

require '../util/mailer/PHPMailerAutoload.php';

function connectDBA()
{
	$db=mysqli_connect("p:localhost", "Website", "qaSLMHwN2xDXXMCH", "kontakti");
	
	if (!$db)
	{
		die('Could not connect: ' . mysqli_error($db));
	}
	return $db;
}

require_once('../util/recaptchalib.php');
$privatekey = "6LcCe-sSAAAAABiK8kKYwAW6j_U9UREOjT1ZyySG";
$resp = recaptcha_check_answer($privatekey, $_SERVER["REMOTE_ADDR"], $_POST["recaptcha_challenge_field"], $_POST["recaptcha_response_field"]);

if (!$resp->is_valid)
{
	die('<meta http-equiv="refresh" content="0;url=/?captcha" />');
} else
{
if ($_POST['pass'] == $_POST['passcheck'])
{
	register();
} else
{
	die("Passwords don't match");
}
}

$data=array();

function register()
{
	if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/",$_POST['email']))
		die("Your email is not " . $_POST['email'] . '... |-(');
	if (!is_numeric($_POST['year']) || !is_numeric($_POST['month']) || !is_numeric($_POST['day']))
		die("Enter a valid date...");
	$mysqldate = date("Y-m-d H:i:s");
	$dba = connectDBA();
	$userkey = userkey($mysqldate . $_POST['fullname'] . uniqid());
	$name = $_POST['fullname'];
	if ($stmt = $dba->prepare("INSERT INTO `accounts` (`name`, `username`, `email`, `password`, `registerip`, `lastip`, `registerdate`, `lastdate`) VALUES (?, ?, ?, ?, '" . ip2long($_SERVER['REMOTE_ADDR']) . "', '" . ip2long($_SERVER['REMOTE_ADDR']) . "', '$mysqldate', '$mysqldate')"))
	{
		$passwort = encrypt($_POST['pass']);
		$stmt->bind_param("ssss", $name, $_POST['userid'], $_POST['email'], $passwort);
		$stmt->execute();
		echo mysqli_stmt_error($stmt);
		$stmt->close();
	}
	if ($stmt = $dba->prepare("SELECT * FROM `accounts` WHERE `email`=?"))
	{
		$stmt->bind_param("s", $_POST['email']);
		$stmt->execute();
		$result = $stmt->get_result();
		$data = $result->fetch_array();
		echo mysqli_stmt_error($stmt);
		$stmt->close();
	}
	
	$sessionid = md5(uniqid($name . $passwort . time(), true));
	if ($state = $dba->prepare("INSERT INTO `sessions` (`uid`, `sessionid`, `ip`, `expire`, `einc`) VALUES (?, ?, ?, ?, ?)"));
	{
		$einc = 0;
		$exp = date("Y-m-d H:i:s", strtotime("+24 hours"));
		$aipe = ip2long($_SERVER['REMOTE_ADDR']);
		$state->bind_param("isisi", $data['id'], $sessionid, $aipe, $exp, $einc);
		$state->execute();
		echo mysqli_stmt_error($state);
		$state->close();
	}
	
	if ($stmt = $dba->prepare("INSERT INTO `profiledata` (`uid`, `key`, `notifications`, `bgcolor`, `bday`, `gender`) VALUES (?, ?, 0, 'ABCDEF', ?, ?)"))
	{
		$year = $_POST['year'];
		$month = $_POST['month'];
		$day = $_POST['day'];
		$bday = "$year-$month-$day";
		$stmt->bind_param("issi", $data['id'], $userkey, $bday, $_POST['gender']);
		$stmt->execute();
		echo mysqli_stmt_error($stmt);
		$stmt->close();
	}
	
	$mail = new PHPMailer;
	$mail->SMTPDebug = 0;
	$mail->isSMTP();
	$mail->Host = 'localhost';// Specify main and backup server
	$mail->SMTPAuth = true;
	$mail->Port = 25;
	$mail->Username = "kontakti@kontakti.no-ip.biz";
	$mail->Password = "kontakti";
	$mail->From = 'kontakti@kontakti.no-ip.biz';
	$mail->FromName = 'Kontakti';
	$mail->addAddress($data['email'], $data['name']);
	$mail->AddEmbeddedImage('../images/logo_t.png', 'kt', 'kontakti.png');
	$mail->WordWrap = 100;
	$mail->isHTML(true);
	$mail->Subject = 'Kontakti Registration';
	$userkey = substr($userkey,0,5) . "-" . substr($userkey,5,5) . '-' . substr($userkey,10,5) . '-' . substr($userkey,15,5);
	$mail->Body    = str_replace("%key%", $userkey, str_replace("%name%", $data['name'], file_get_contents("../email.html")));
	$mail->AltBody = str_replace("%key%", $userkey, str_replace("%name%", $data['name'], "Hello %name%! You are almost done creating your new account!\nAll you need to do know is paste this registration key into your accounts verification page.\n%key%\nTo access the verification page, you have to log onto http:/.no-ip.biz/.\nThank you for registering at Kontakti! We hope you enjoy your experience!\n If you have any problems or suggestions, contact us @ kontakti@kontakti.no-ip.biz."));
	if(!$mail->send())
	{
		echo 'Email could not be sent, ' . $mail->ErrorInfo;
	} else
	{
		echo "Sent email";
	}
	flush();
	//echo '<meta http-equiv="refresh" content="5;url=/?session=' . $sessionid . '" />';
}
?>