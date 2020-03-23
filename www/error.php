<?php
$reqs = true;
include_once "/util/session.php";
require "/util/page.php";
$arr = array(
	200 => "Everything's ok!",
	400 => "Browser was too slow!",
	401 => "You are unauthorized!",
	402 => "You must have paid to access this page!",
	403 => "You are unauthorized!",
	404 => "This page doesn't exist!",
	405 => "Browser was too slow!",
	500 => "The server messed up!"
);
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
ob_get_clean();
$desc = array(
	200 => "There is nothing to worry about, everything is working fine.<br />Oh you! Trying to access the error page!",
	400 => "Your browser requested something from us, but we couldn't understand what it wanted (slow internet connection, maybe?). Try refreshing the page.",
	401 => "You require authorization to access this page, but you seem to not have entered the correct username/password to do so.<br />If this is a page you shouldn't be accessing, then you shouldn't be trying to gain access to it, because that is illegal.",
	402 => "You are required to pay to access this page. (This error should never appear on any of our pages by the way)",
	403 => "You require authorization to access this page, but you seem to not have entered the correct username/password to do so.<br />If this is a page you shouldn't be accessing, then you shouldn't be trying to gain access to it, because that is illegal.",
	404 => "The server couldn't locate this page. Maybe the URL is misspelled?",
	405 => "Your browser sent a request that we do not accept. Are you even using a normal browser?",
	500 => "Some error happened while we were experimenting with different features, and consequently this page cannot load. We are most likely already working on fixing this issue, so try again in a minute."
);
$err = http_response_code();

$p = new Page();
$p->setTitle("Error " . http_response_code());
$p->setState("error");
$p->setWallMargins("none");
$p->setPreWallHTML("");
$p->addToHeader("
		<style>
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
		</style>");
$p->setWallHTML("
						<div class='post' status='default'>
							<div class='postdivtitle'>
								<center>
									<h1>
										" . $arr[$err] . "
									</h1>
								</center>
							</div>
							<div class='subpost' style='word-wrap: break-word;'>
								<center>
									<h2>
										" . $desc[$err] . "
										<br />
										<br />
										If you believe this is an error, " . ($err == 200 ? "do not " : "") . "email us at <a href='mailto:kontakti@kontakti.no-ip.biz'>kontakti@kontakti.no-ip.biz</a>. Please " . ($err == 200 ? "don't " : "") . "be detailed and " . ($err == 200 ? "don't " : "") . "tell us if this error occurs on any other pages.
									</h2>
								</center>
								<span class='smalltext'>Data to " . ($err == 200 ? "not " : "") . "include in error reports:<br />" . $data . "</span>
							</div>
						</div>");
$p->finish();
?>