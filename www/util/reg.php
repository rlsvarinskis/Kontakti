<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta property="og:image" content="favicon-196x196.png" />	
		<meta charset="UTF-8" />
		<meta name="description" content="Kontakti is a social network that lets you communicate between friends, as well as share life's greatest moments with your family wherever you are, whenever you want." />
		<meta name="keywords" content="Social,Kontakti,kontakts,post,posts,network,friends,family" />
		<meta name="author" content="Robert L. Svarinskis" />
		<link rel="stylesheet" type="text/css" href="/css/css.css" />
		<link rel="stylesheet" type="text/css" href="/css/nav.css" />
		<link rel="stylesheet" type="text/css" href="/css/alerts.css" async/>
		<link rel="stylesheet" type="text/css" href="/css/reg.css" />
		
		<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
		<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
		<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
		<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
		<link rel="icon" type="image/png" href="/favicon-196x196.png" sizes="196x196">
		<link rel="icon" type="image/png" href="/favicon-160x160.png" sizes="160x160">
		<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
		<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
		<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
		<meta name='msapplication-config' content='/browserconfig.xml' />
		<meta name="msapplication-TileColor" content="#2b5797">
		<meta name="msapplication-TileImage" content="/mstile-144x144.png">
		
		<script type='text/javascript' src='http://code.jquery.com/jquery-2.1.3.min.js' async></script>
		<script type='text/javascript' async>
			function page(link)
			{
				$.ajax({
					async: false,
					type: "GET",
					url: "/help/" + link,
					success: function(response)
					{
						$(".body").append(response);
					},
					error: function(request, error, httpstatus)
					{
					}
				});
				return false;
			}
			
			function removeDiv(id)
			{
				$("#" + id).fadeOut(400, "swing", function(){ $("#" + id).remove(); });
			}
		</script>
		<title>Welcome to Kontakti</title>
	</head>
	<body>
		<div class="body">
			<div class='top'>
				<div class='innertop'>
					<a href='/' style='float:left;'><div style='background-image:url(/images/logo_t.png);width:170px;height:36px;margin:17px 0 0 0;' title='Go to kontakti'></div></a>
					
					<div style='float:right;margin:0;padding:0;'>
						<form style='margin:0;padding:0;' method='post' action='.'>
							<table class='logintable' cellspacing='0'>
								<tbody>
									<tr>
										<td class='tdtitle'><label for='lusername'>Username</label></td>
										<td class='tdtitle'><label for='password'>Password</label></td>
									</tr>
									<tr>
										<td><input class='s' type='text' name='lusername' id='lusername' /></td>
										<td><input class='s' type='password' name='password' id='password' /></td>
										<td><input class='button' type='submit' value='Log in' /></td>
									</tr>
									<tr>
										<td class='tdtitle'><input type='checkbox' id='longsession' name='longsession' /><label for='longsession'>Keep me logged in</label></td>
										<td class='tdtitle'><a href='/reset_pass.php' style='text-decoration:none;color:#eee;'>Forgot your password?</a></td>
									</tr>
								</tbody>
							</table>
						</form>
					</div>
				</div>
			</div>
			
			<div class='regcont'>
				<div class='fancy'>
					<center>
						<img src='https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQITZ-HvQStS-M-Uv5CALovSnSdCdLhdtntkMO9-BpndBSXMKAImw'></img>
					</center>
				</div>
			
				<div class='regbg'>
					<div class='innerregbg'>
						<div class='fill'>
							<div class='b'>
								<h1 class='largeh1' style='padding:0;margin:0;height:auto;'>Register on Kontakti</h1>
								<h2 class='payh2'>It's free and it always shall be.</h2><br /><div id='err' style='color:red;'><?php if (isset($_GET['captcha'])){ echo "*Invalid reCAPTCHA";} ?></div>
								<form action="/account/r.php" method='post' id='registerform'>
									<input class='reg' type='text' id='fullname' name='fullname' placeholder='Name' /><br />
									<input class='reg' type='text' id='userid' name='userid' placeholder='Username' /><br />
									<input class='reg' type='text' id='email' name='email' placeholder='Email' /><br />
									<input class='reg' type='password' id='pass' name='pass' placeholder='Password' /><br />
									<input class='reg' type='password' id='passcheck' name='passcheck' placeholder='Reenter password' /><br />
									Birthday:
									<div>
									<table style='width:100%;'><tr><td style='width:40%;'><select class='reg' id='month' name='month' style='width:100%;'>
										<option value='0' selected='1'>Month</option>
										<option value='1'>January</option>
										<option value='2'>February</option>
										<option value='3'>March</option>
										<option value='4'>April</option>
										<option value='5'>May</option>
										<option value='6'>June</option>
										<option value='7'>July</option>
										<option value='8'>August</option>
										<option value='9'>September</option>
										<option value='10'>October</option>
										<option value='11'>November</option>
										<option value='12'>December</option>
									</select></td><td style='width:30%;'>
									<select class='reg' id='day' name='day' style='width:100%;'>
										<option value='0' selected='1'>Day</option>
										<?php
										for ($i = 1; $i < 32; $i++)
										{
											echo "<option value='$i'>$i</option>";
										}
										?>
									</select></td><td style='width:30%;'>
									<select class='reg' id='year' name='year' style='width:100%;'>
										<option value='0' selected='1'>Year</option>
										<?php
										for ($i = date("Y") - 1; $i > 1900; $i--)
										{
											echo "<option value='$i'>$i</option>";
										}
										?>
									</select></td></tr></table><br />
									<span style='font-size:17px;'><input type='radio' name='gender' id='male' value='1' checked='1' /><label for='male'>Male</label>
									<input type='radio' name='gender' id='female' value='0' /><label for='female'>Female</label></span><br />
									<?php
										require_once('recaptchalib.php');
										$publickey = "6LcCe-sSAAAAANta50941tyNF3UafIx0WPzvf2MF"; // you got this from the signup page
										echo recaptcha_get_html($publickey); ?><br />
									<span style='font-size:8px;color:#555;'>*By clicking Register you agree to Kontakti's Terms of Service, Data Use Policy and Cookie Policy.</span><br />
									<input type='submit' class='button large' value='Register'/>
									</div>
								</form>
								<script type='text/javascript'>
									function dim(e,t)
									{
										switch(e)
										{
											case 1:
												return t % 4 == 0 && t % 100 || t % 400 == 0 ? 29 : 28;
											case 8:
											case 3:
											case 5:
											case 10:
												return 30;
											default:
												return 31;
										}
									}
									function validD(e, t, n)
									{
										return t >= 0 && t < 12 && e > 0 && e <= dim(t, n);
									}
									
									$("#registerform").submit(function()
									{
										var e = "";
										var t = $("#fname").val();
										var n = $("#lname").val();
										var r = $("#email").val();
										var i = $("#pass").val();
										var s = $("#passcheck").val();
										var o = $("#month").val();
										var u = $("#day").val();
										var a = $("#year").val();
										t = t.toLowerCase().replace(/\b[a-z]/g,function(e){return e.toUpperCase()});
										$("#fname").val(t);
										n = n.toLowerCase().replace(/\b[a-z]/g,function(e){return e.toUpperCase()});
										$("#lname").val(n);
										if(n.length < 1 || t.length < 1)
										{
											e = e + "*You have a name...<br />"
										}
										if(r.indexOf("@") == -1)
										{
											e = e + "*Email must be valid!<br />"
										}
										if(i.length < 6)
										{
											e = e + "*Need to have at least 6 symbols!<br />"
										} else if(i != s)
										{
										e = e + "*Passwords must match!<br />"
										}
										if(u == "0" || o == "0" || a == "0")
										{
											e = e + "*You were born someday...<br />"
										} else if(!validD(parseInt(u), parseInt(o) - 1, parseInt(a)))
										{
											var f = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
											e = e + "*There are only " + dim(parseInt(o) - 1, parseInt(a)) + " days in " + f[o - 1] + "<br />"
										}
										
										$("#err").html(e);
										if(e.length == 0)
										{
											$("#err").html("Registering...");
											$.ajax({
												data: $(this).serialize(),
												type: "POST",
												url: $(this).attr("action"),
												success: function(e)
												{
													$("#err").html(e);
												}
											});
										}
										
										return false;
									});
								</script>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="footer" id="footer">
				<div class="innerfooter">
					<footer>
						<div class='foot' style='padding-bottom:5px;'>
							<!--<div class='newpostdiv' style='display:inline-block;width:468px;'><div class='postdivtitle'>Advertisements</div>
								<div class='subpost' style='margin:0;padding:0;height:60px;'>
									<script type='text/javascript' src='http://bdv.bidvertiser.com/BidVertiser.dbm?pid=592691&bid=1480008'></script>
									<noscript><a href='http://www.bidvertiser.com'>pay per click</a></noscript>
								</div>
							</div>
							<br />-->
							<script>
								(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
								m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
								ga('create', 'UA-54289846-1', 'auto');ga('send', 'pageview');
							</script>
							<a target='_blank' href='https://www.facebook.com/pages/Bobshizzler-Inc/580512575368007'>
								<img style='border-radius:10px;' src='/images/bob_b.png' alt='This is a subsidiary of BobShizzler inc.' />
							</a>
							<br />
							<a class='footl' href='/help/about.php' onclick="return page('about.php')">About</a>
							<a class='footl' href='/advertising/'>Ads</a>
							<a class='footl' href='/developers/'>Developers</a>
							<a class='footl' href='/help/privacy.php' onclick="return page('privacy.php')">Privacy</a>
							<a class='footl' href='/help/cookies.php' onclick="return page('cookies.php')">Cookies</a>
							<a class='footl' href='/help/tos.php' onclick="return page('tos.php')">Terms</a>
							<br />
							<?php echo "&copy; 2013 - " . date("Y") . " BobShizzler Inc.";?>
						</div>
					</footer>
				</div>
			</div>
		</div>
		<script type='text/javascript' src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
		<script type='text/javascript' src='/js/mousewheel.js'></script>
	</body>
</html>