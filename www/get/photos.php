<?php
require "../util/page.php";
$p = new Page();
$p->setTitle("Profile not found");
$p->setState("error");

$viewdata = null;
$kontakt = null;

if (isset($_GET['user']))
{
	if ($stmt = $db->prepare("SELECT * FROM `accounts` WHERE `username`=?"))
	{
		$stmt->bind_param("s", $_GET['user']);
		$stmt->execute();
		$result = $stmt->get_result();
		if (mysqli_num_rows($result) > 0)
		{
			$viewdata = $result->fetch_array();
			if ($stmt = $db->prepare("SELECT * FROM `friends` WHERE (`rid`=? AND `fid`=?) OR (`rid`=? AND `fid`=?)"))
			{
				$stmt->bind_param("iiii", $userdata['id'], $viewdata['id'], $viewdata['id'], $userdata['id']);
				$stmt->execute();
				$result = $stmt->get_result();
				$kontakt = $result->fetch_array();
			}
			$p->setTitle($viewdata['name']);
			ob_start();
			include "../util/usersideline.php";
			$p->setPreWallHTML(ob_get_contents());
			ob_end_clean();
			
			$p->setSetupScript("profileid = " . $viewdata['id'] . ";\$('#wall').append(albuminfoelement);\$('#wall').append(albumelementcontainer);cleanup = function(){albuminfoelement.detach();albumelementcontainer.detach();}");
			$p->setSetupScript("window.albummodule = new albumclass();registerModule(albummodule);$('#wall').append(albummodule.element);
			window.photosmodule = new photosclass();registerModule(photosmodule);\$('#wall').append(photosmodule.element);albummodule.attachPhotos(photosmodule);
cleanup = function(){\$('#wall').get(0).removeChild(albummodule.element.get(0));unregisterModule(albummodule);albummodule.clean();
\$('#wall').get(0).removeChild(photosmodule.element.get(0));unregisterModule(photosmodule);}");
			$p->setWallMargins("right");
			$p->finish();
		} else
		{
			$fields = array("SCRIPT_FILENAME", "GATEWAY_INTERFACE", "SERVER_PROTOCOL", "REQUEST_METHOD", "QUERY_STRING", "REQUEST_URI", "SCRIPT_NAME", "PHP_SELF", "REQUEST_TIME_FLOAT", "REQUEST_TIME");
			ob_start();
			echo "_GET: ";
			print_r($_GET);
			echo "\n_POST: ";
			print_r($_POST);
			echo "\napache_request_headers(): ";
			print_r(apache_request_headers());
			echo "\n_SERVER: ";
			echo "Array\n(\n";
			foreach ($fields as $fieldname)
			{
				echo "\t[" . $fieldname . "] => " . $_SERVER[$fieldname] . "\n";
			}
			echo ")";
			$data = base64_encode(ob_get_contents());
			ob_end_clean();
			header("HTTP/1.0 404 Not Found");
			$p->setPreWallHTML("");
			$p->setWallHTML("<style>
						h2
						{
							font-size: 26px;
							color: #888;
							font-weight: normal;
							font-family: 'Open Sans Condensed', sans-serif;
						}
						span.smalltext
						{
							font-size:12px;
							color: #888;
							font-weight: normal;
							font-family: 'Open Sans Condensed', sans-serif;
						}
					</style>
					<div class='post' status='default'>
						<div class='postdivtitle'>
							<center>
								<h1>
									This profile wasn't found
								</h1>
							</center>
						</div>
						<div class='subpost' style='word-wrap: break-word;'>
							<center>
								<h2>
									This user was not found on our servers. The user id was probably entered incorrectly, so please try entering it again.
								</h2>
							</center>
							<span class='smalltext'>Data to include in error reports:<br />" . $data . "</span>
						</div>
					</div>");
			$p->finish();
		}
	}
} else
{
	$fields = array("SCRIPT_FILENAME", "GATEWAY_INTERFACE", "SERVER_PROTOCOL", "REQUEST_METHOD", "QUERY_STRING", "REQUEST_URI", "SCRIPT_NAME", "PHP_SELF", "REQUEST_TIME_FLOAT", "REQUEST_TIME");
	ob_start();
	echo "_GET: ";
	print_r($_GET);
	echo "\n_POST: ";
	print_r($_POST);
	echo "\napache_request_headers(): ";
	print_r(apache_request_headers());
	echo "\n_SERVER: ";
	echo "Array\n(\n";
	foreach ($fields as $fieldname)
	{
		echo "\t[" . $fieldname . "] => " . $_SERVER[$fieldname] . "\n";
	}
	echo ")";
	$data = base64_encode(ob_get_contents());
	ob_end_clean();
	header("HTTP/1.0 404 Not Found");
	$p->setPreWallHTML("");
	$p->setWallHTML("<style>
				h2
				{
					font-size: 26px;
					color: #888;
					font-weight: normal;
					font-family: 'Open Sans Condensed', sans-serif;
				}
				span.smalltext
				{
					font-size:12px;
					color: #888;
					font-weight: normal;
					font-family: 'Open Sans Condensed', sans-serif;
				}
			</style>
			<div class='post' status='default'>
				<div class='postdivtitle'>
					<center>
						<h1>
							This profile wasn't found
						</h1>
					</center>
				</div>
				<div class='subpost' style='word-wrap: break-word;'>
					<center>
						<h2>
							This user was not found on our servers. The user id was probably entered incorrectly, so please try entering it again.
						</h2>
					</center>
					<span class='smalltext'>Data to include in error reports:<br />" . $data . "</span>
				</div>
			</div>");
	$p->finish();
}
?>