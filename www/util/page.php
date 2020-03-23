<?php
require_once "session.php";

class Page
{
	private $wallmargins = "none";
	private $wall = "";
	private $prewall = "";
	private $postwall = "";
	private $setupScript = "";
	private $header = "";
	private $scripts = "";
	private $hasNavBar = true;
	
	private $state = "posts";
	private $title = "Kontakti";
	
	function __construct()
	{
		$this->setDefaultHeader();
		$this->setDefaultPreWallHTML();
		$this->setDefaultScripts();
	}
	
	function setWallMargins($margins)
	{
		$this->wallmargins = $margins;
	}
	
	function setWallHTML($wallhtml)
	{
		$this->wall = $wallhtml;
	}
	
	function setPreWallHTML($prewallhtml)
	{
		$this->prewall = $prewallhtml;
	}
	
	function setHasNavBar($hasNavBar)
	{
		$this->hasNavBar = $hasNavBar;
	}
	
	function setDefaultPreWallHTML()
	{
		global $db;
		global $userdata;
		$this->prewall = "					<aside class='side'>
						<div class='post' style='margin-top:0;'>
							<div class='profilegeneral'>
								<div class='userimages'>
									<div class='userbackground' style='display:table;background:url(/profilemedia/sidebar/);background-size:cover;'>
										<center style='height:138px;display:table;width:100%;'>
											<div style='display:table-cell;vertical-align:middle;height:inherit;'>
												<div class='profilepic'>
													<a onclick='return pg(this);' href='/profile/" . $userdata['username'] . "/'>
														<center>
															<div class='ppicd'>
																	<div class='ppic' style='background-image:url(/profilemedia/avatar/)'>
																		<span class='after'></span>
																	</div>
															</div>
														</center>
													</a>
												</div>
											</div>
										</center>
										<center>
											<div class='welcome'>
												<a onclick='return pg(this);' href='/profile/" . $userdata['username'] . "/' class='usernamel'>" . $userdata['name'] . "</a><br />
												<a class='useredit' onclick='return pg(this);' href='/account/'>Edit profile</a>
											</div>
										</center>
									</div>
								</div>
							</div>
						</div>
						<div class='post'>
							<div class='postdivtitle'><a onclick='return pg(this);' href='/profile/" . $userdata['username'] . "/photos/'>Photos</a></div>
							<div class='subpost'>
								<table class='imagelist' cellspacing='2px'>
									<tbody>
										<tr class='imagelist'>";
												if ($stmt = $db->prepare("SELECT `mediaid` FROM `media` WHERE `uid`=? AND `deleted`=0 ORDER BY `date` DESC LIMIT 8"))
												{
													$stmt->bind_param("i", $userdata['id']);
													$stmt->execute();
													$result = $stmt->get_result();
													for ($i = 0; $i < mysqli_num_rows($result); $i++)
													{
														if ($i % 4 == 0 && $i != 0)
														{
															$this->prewall .= "</tr><tr class='imagelist'>";
														}
														$img = $result->fetch_assoc();
														$this->prewall .= "<td class='imagelist'><div class='imagelist' style='background-image:url(/files/" . $img['mediaid'] . ");' ></div></td>";
													}
													$stmt->close();
												}
$this->prewall .= "</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div style='float:right;'>
							<button class='btc' onclick='window.location.href = \"bitcoin:1LgDqZKecg2yCgQzAJH68H6P7cAu5pCffA?amount=0.00206096&label=Kontakti&message=Donate to Kontakti\"'><span></span>Donate</button>
						</div>
					</aside>";
	}
	
	function setDefaultScripts()
	{
		$this->scripts = "
		<script type='text/javascript' src='/js/main.js'></script>
		<script type='text/javascript' src='/js/util.js'></script>
		<script type='text/javascript' src='/js/imageclipboard.js' async></script>
		<script type='text/javascript' src='/js/search.js'></script>
		<script type='text/javascript' src='/js/notifications.js'></script>
		<script type='text/javascript' src='/js/kontakts.js'></script>
		<script type='text/javascript' src='/js/comments.js'></script>
		<script type='text/javascript' src='/js/DynamicListElement.js'></script>
		<script type='text/javascript' src='/js/Posts.js'></script>
		<script type='text/javascript' src='/js/PostsUtil.js'></script>
		<script type='text/javascript' src='/js/postbox.js'></script>
		<script type='text/javascript' src='/js/photos.js'></script>
		<script type='text/javascript' src='/js/alerts.js'></script>
		";
	}
	
	function setScripts($scripts)
	{
		$this->scripts = $scripts;
	}
	
	function setDefaultHeader()
	{
		global $db;
		global $userdata;
		global $title;
		global $state;
		
		$notifications = 0;

		if ($stmt = $db->prepare("SELECT `notifications` FROM `profiledata` WHERE uid=?"))
		{
			$stmt->bind_param("i", $userdata['id']);
			$stmt->execute();
			$stmt->bind_result($notifications);
			$stmt->fetch();
			$stmt->close();
		}

		$hasNotifications = "false";
		
		if ($notifications == 1)
			$hasNotifications = "true";
			
		$this->header = "
		<meta http-equiv='content-type' content='text/html; charset=utf-8' />
		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700|Gafata|Open+Sans+Condensed:300&subset=latin-ext' rel='stylesheet' type='text/css'>
		<link rel='stylesheet' type='text/css' href='/css/font-awesome.css'/>
		<link rel='stylesheet' type='text/css' href='/css/css.css' />
		<link rel='stylesheet' type='text/css' href='/css/sidebar.css'/>
		<link rel='stylesheet' type='text/css' href='/css/nav.css' />
		<link rel='stylesheet' type='text/css' href='/css/alerts.css'/>
		<link rel='stylesheet' type='text/css' href='/css/bounce.css'/>
		<link rel='stylesheet' type='text/css' href='/css/posts.css' />
		<link rel='stylesheet' type='text/css' href='/css/postbox.css' />
		<link rel='stylesheet' type='text/css' href='/css/flickity/flickity.css' />
		
		
		<link rel='apple-touch-icon' sizes='57x57' href='/apple-touch-icon-57x57.png'>
		<link rel='apple-touch-icon' sizes='114x114' href='/apple-touch-icon-114x114.png'>
		<link rel='apple-touch-icon' sizes='72x72' href='/apple-touch-icon-72x72.png'>
		<link rel='apple-touch-icon' sizes='144x144' href='/apple-touch-icon-144x144.png'>
		<link rel='apple-touch-icon' sizes='60x60' href='/apple-touch-icon-60x60.png'>
		<link rel='apple-touch-icon' sizes='120x120' href='/apple-touch-icon-120x120.png'>
		<link rel='apple-touch-icon' sizes='76x76' href='/apple-touch-icon-76x76.png'>
		<link rel='apple-touch-icon' sizes='152x152' href='/apple-touch-icon-152x152.png'>
		<link rel='icon' type='image/png' href='/favicon-196x196.png' sizes='196x196'>
		<link rel='icon' type='image/png' href='/favicon-160x160.png' sizes='160x160'>
		<link rel='icon' type='image/png' href='/favicon-96x96.png' sizes='96x96'>
		<link rel='icon' type='image/png' href='/favicon-16x16.png' sizes='16x16'>
		<link rel='icon' type='image/png' href='/favicon-32x32.png' sizes='32x32'>
		<meta name='msapplication-config' content='/browserconfig.xml' />
		<meta name='msapplication-TileColor' content='#2b5797'>
		<meta name='msapplication-TileImage' content='/mstile-144x144.png'>
		
		<script type='text/javascript' src='http://code.jquery.com/jquery-2.1.3.min.js'></script>
		<script type='text/javascript' src='/js/flickity.js'></script>
		<script type='text/javascript'>
			var userdata = {
				id: " . $userdata['id'] . ",
				name: '" . $userdata['name'] . "',
				username: '" . $userdata['username'] . "'
			};
			var hasNotifications = $hasNotifications;
			var state = '$state';
			var stateTitle = '$title';
			var stateUpdate = function()
			{
				stateTitle = '$title';
				state = '$state';
			}
		</script>";
	}
	
	function addToHeader($header)
	{
		$this->header .= $header;
	}
	
	function setPostWallHTML($postwallhtml)
	{
		$this->postwall = $postwallhtml;
	}
	
	function setTitle($titletext)
	{
		$this->title = $titletext;
	}
	
	function setState($type)
	{
		$this->state = $type;
	}
	
	function setSetupScript($script)
	{
		$this->setupScript = $script;
	}

	function finish()
	{
		$title = $this->title;
		$state = $this->state;
		global $userdata;
		global $db;
		$body = $this->prewall . "<div id='wall' class='wall' margins='" . $this->wallmargins . "'>" . $this->wall . "</div>" . $this->postwall . "<script type='text/javascript'>stateUpdate=function(){stateTitle='" . $this->title . "';state='" . $this->state . "';" . $this->setupScript . "}</script>
					<!--<script>
						(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
						(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
						m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
						})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

						ga('create', 'UA-54289846-1', 'auto');
						ga('send', 'pageview');
					</script>-->";
		if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')
		{
			echo $body;
		} else
		{
			echo "
<html>
	<head>
		<title>$title</title>
		" . $this->header . $this->scripts . "
	</head>
	<body>
		<div class='body'>
			<div class='pageTopProgressBar' style='display:none;'></div>
"; if ($this->hasNavBar) echo "
			<div class='navbar'>
				<nav class='navcenter'>
					<div class='rnav'>
						<ul class='r'>
							<li id='notifbutton'><!--onclick='navbar.notifications.tick()'--> 
								<div opened='no' class='openableMenu' id='notif'>
								!
									<ul class='navbarpopup' id='notificationspopup'>
										<!--<div class='scrollbardiv' for='notifsbar'>
											<div class='scrollbar'>
												
											</div>
										</div>-->
									</ul>
									<div class='notificationc' id='notifnum'>
										<div class='subnotificationc' id='subnotifnum'>
											0
										</div>
									</div>
								</div>
							</li>
							<li><a onclick='return pg(this);' href='/' id='navbarhome'>Home</a></li>
							<li>
								<a onclick='return pg(this);' style='display:block;position:relative;' href='/kontakts.php'>
									Kontakts
									<div class='notificationc' id='kontaktnum'>
										<div class='subnotificationc' id='subkontaktnum'>
											0
										</div>
									</div>
								</a>
							</li>
							<li>
								<a onclick='return pg(this);' href='/profile/" . $userdata['username'] . "/'>
									" . explode(" ", $userdata['name'])[0] . "
								</a>
							</li>
							<li style='padding-left:5px;'>
								<div onclick='' opened='no' class='openableMenu' id='settings'>
									<ul class='navbarpopup' id='settingsbar'>
										<li class='menuseper'><span>Objects&trade;</span></li>
										<li><a href='/newobject.php' onclick='return pg(this);'>Create Object&trade;</a></li>
										<li class='menuseper'><span>Account</span></li>
										<li><a href='/account/' onclick='return pg(this);'>Settings</a></li>
										<li><a href='?logout'>Log out</a></li>
										<li><a href='?stronglogout'>Log out of all devices</a></li>
									</ul>
								</div>
							</li>
						</ul>
					</div>
					<div class='lnav'>
						<a href='/' onclick='return pg(this);'><div class='logo'></div></a>
						<div class='l' search='no'>
							<div id='searchcontainer' search='no'>
								<div id='searchcolor'>
									<div id='extrapadding'>
										<input id='search' type='text' name='search' placeholder='Search for anything here' />
									</div>
								</div>
								<div id='searchresults'></div>
							</div>
						</div>
					</div>
				</nav>
			</div>
"; echo "			<div id='errors'></div>
			<div class='container'>
				<div class='content' id='content'>
					$body
				</div>
			</div>
		</div>
		<div>
			<div>
				<div>
					<div>
						<div>
						
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class='footer' id='footer'>
			<div class='innerfooter'>
				<footer>
					<div class='foot'>
						<div class='post' style='display:inline-block;width:468px;'><div class='postdivtitle'>Sponsored ads</div>
							<div class='subpost' style='margin:0;padding:0;height:60px;background-image:url(/images/block_b.png);'>
								<!--<script type='text/javascript' src='http://bdv.bidvertiser.com/BidVertiser.dbm?pid=592691&bid=1480008'></script>
								<noscript><a href='http://www.bidvertiser.com'>Sponsored ads</a></noscript>-->
							</div>
						</div>
						<br />
						<a target='_blank' href='https://www.facebook.com/pages/Bobshizzler-Inc/580512575368007'>
							<img style='border-radius:10px;' src='/images/bob_b.png' alt='BobShizzler Inc. logo' />
						</a>
						<br />
						<a class='footl' href='/help/about.php' onclick='return page(\"about.php\")'>About</a>
						<a class='footl' href='/advertising/'>Ads</a>
						<a class='footl' href='/developers/'>Developers</a>
						<a class='footl' href='/help/privacy.php' onclick='return page(\"privacy.php\")'>Privacy</a>
						<a class='footl' href='/help/cookies.php' onclick='return page(\"cookies.php\")'>Cookies</a>
						<a class='footl' href='/help/tos.php' onclick='return page(\"tos.php\")'>Terms</a>
						<br />
						&copy; 2013 - " . date("Y") . " Robert L. Svarinskis
					</div>
				</footer>
			</div>
		</div>
	</body>
</html>";
		header("Content-type: text/html");
		}
	}
}
?>