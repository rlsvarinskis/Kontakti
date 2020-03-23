<?php
$verifyaccount = true;
require_once "/util/session.php";
if ($userdata['verified'] != 0)
{
	include "index.php";
	exit;
}
require "/util/page.php";

$p = new Page();
$p->setTitle("Email verification");
$p->setState("verify");
$p->setWallMargins("none");
$p->setPreWallHTML("");
$p->setHasNavBar(false);
$p->setScripts("
		<script type='text/javascript' src='/js/verify.js'></script>");
$p->addToHeader("
		<style>
			.container
			{
				padding-top: 0px;
			}
			h2
			{
				font-size: 26px;
				color: #888;
				font-weight: normal;
				font-family: 'Open Sans Condensed', sans-serif;
			}
			h3
			{
				font-size: 22px;
				color: #555;
				font-weight: normal;
				font-family: 'Open Sans Condensed', sans-serif;
			}
			p
			{
				color: #444;
				font-weight: normal;
				font-family: 'Open Sans Condensed', sans-serif;
				font-size:14px;
			}
			.verifycode
			{
				font-family: 'Open Sans Condensed', sans-serif;
				padding:5px;
				width:45px;
				border:none;
				font-size: 15px;
				margin:0;
			}
			.verifycode:focus
			{
				outline:none;
			}
			.verifycodediv
			{
				font-family: 'Open Sans Condensed', sans-serif;
				border:solid 1px lightgray;
				border-radius:5px;
				font-size: 15px;
				display:inline-block;
				overflow:hidden;
			}
			.verifycodediv:focus
			{
				outline-color: rgb(77, 144, 254);
				outline-offset: -2px;
				outline-style: auto;
				outline-width: 5px;
			}
			.errs
			{
				color: red;
			}
			.newpostdiv[status=default]
			{
				background-color: white;
				-webkit-transition: background-color 0.5s linear;
				-moz-transition: background-color 0.5s linear;
				-o-transition: background-color 0.5s linear;
				-ms-transition: background-color 0.5s linear;
				transition: background-color 0.5s linear;
			}
			.newpostdiv[status=success]
			{
				background-color: chartreuse;
				-webkit-transition: none;
				-moz-transition: none;
				-o-transition: none;
				-ms-transition: none;
				transition: none;
			}
			.newpostdiv[status=error]
			{
				background-color: indianred;
				-webkit-transition: none;
				-moz-transition: none;
				-o-transition: none;
				-ms-transition: none;
				transition: none;
			}
		</style>");
$p->setWallHTML("
						<div class='newpostdiv' status='default'>
							<div class='postdivtitle'>
								<center>
									<h1>
										Email Verification
									</h1>
								</center>
							</div>
							<div class='subpost'>
								<center>
									<h2>
										You are almost done creating your new account!
									</h2>
									<h2>
										An email containing your registration key has been sent to
									</h2>
									<br />
									<h2>
										" . $userdata['email'] . "
									</h2>
									<br />
									<h3>
										Once you have recieved your email, paste the registration key you recieved in the area below:
									</h3>
									<div class='verifycodediv'>
										<input id='v1' type='text' onkeydown='return nextkey(event, 1)' class='verifycode' placeholder='XXXXX' maxlength='6' style='border-right:solid 1px lightgray;' />
										-
										<input id='v2' type='text' onkeydown='return nextkey(event, 2)' class='verifycode' placeholder='XXXXX' maxlength='6' style='border-right:solid 1px lightgray;border-left:solid 1px lightgray;' />
										-
										<input id='v3' type='text' onkeydown='return nextkey(event, 3)' class='verifycode' placeholder='XXXXX' maxlength='6' style='border-right:solid 1px lightgray;border-left:solid 1px lightgray;' />
										-
										<input id='v4' type='text' onkeydown='return nextkey(event, 4)' class='verifycode' placeholder='XXXXX' maxlength='5' style='border-left:solid 1px lightgray;' />
									</div>
									<br />
									<button style='width:212px;' class='button' onclick='check()'>
										Check
									</button><br />
									<span class='errs' id='errs'></span>
									<script type='text/javascript'>
										$('#v1').get(0).onpaste = pasteKey;
										$('#v2').get(0).onpaste = pasteKey;
										$('#v3').get(0).onpaste = pasteKey;
										$('#v4').get(0).onpaste = pasteKey;
									</script>
									<br />
									<h3>
										Once you enter the correct registration key, you will have access to all of Kontakti.
									</h3>
									<p>
										Didn't recieve registration key? <a href='/tools/sendkey.php' onclick='return reskey()'>Resend registration key</a> or <a>contact us for help</a>.
									</p>
								</center>
							</div>
						</div>");
$p->finish();
?>