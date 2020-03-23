<?php
$verifyaccount = true;
require '../util/mailer/PHPMailerAutoload.php';
include "../util/session.php";

$key = "";
if ($stmt = $db->prepare("SELECT `key` FROM `profiledata` WHERE `uid`=?"))
{
	$stmt->bind_param("i", $userdata['id']);
	$stmt->execute();
	$stmt->bind_result($key);
	$stmt->fetch();
	$stmt->close();
}

if ($key === "")
{
	die("Failed to retireve key");
}

$mail = new PHPMailer;
$mail->SMTPDebug = 0;

$mail->isSMTP();// Set mailer to use SMTP
$mail->Host = 'localhost';// Specify main and backup server

$mail->SMTPAuth = true;
$mail->Port = 25;
$mail->Username = "kontakti@kontakti.no-ip.biz";
$mail->Password = "kontakti";
$mail->From = 'kontakti@kontakti.no-ip.biz';
$mail->FromName = 'Kontakti';
$mail->addAddress($userdata['email'], $userdata['name']);
$mail->AddEmbeddedImage('../images/logo_t.png', 'kt', 'kontakti.png');

$mail->WordWrap = 100;
$mail->isHTML(true);

$mail->Subject = 'Kontakti Registration';
$key = substr($key,0,5) . "-" . substr($key,5,5) . '-' . substr($key,10,5) . '-' . substr($key,15,5);
$mail->Body    = str_replace("%key%", $key, str_replace("%name%", $userdata['name'], file_get_contents("../email.html")));
$mail->AltBody = str_replace("%key%", $key, str_replace("%name%", $userdata['name'], "Hello %name%! You are almost done creating your new account!\All you need to do know is paste this registration key into your accounts verification page.\n%key%\nTo access the verification page, you have to log onto http:/.no-ip.biz/.\nThank you for registering at Kontakti! We hope you enjoy your experience!\n If you have any problems or suggestions, contact us @ kontakti@kontakti.no-ip.biz."));

if(!$mail->send())
{
	echo 'Email could not be sent, ' . $mail->ErrorInfo;
} else
{
	echo "An email containing your registration key has been sent to " . $userdata['email'];
}
?>