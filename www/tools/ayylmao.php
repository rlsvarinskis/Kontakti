<?php
$reqs = true;
include_once "../util/session.php";
require "../util/page.php";

$shitposts = ["EO7ADy08mmE", "FrZRIW87eWI", "5c44lB1nYjI", "OZ1-yNTWXj4", "SMBlWE3m0rM", "kiEqGhgWf5Y"/*, "yFUqmX4o-X0"*/, "nqgY2ZZa1Kk", "PumOis7Ssak", "03NVOwAypO0", "-sxU6Z1wcQA"];

$p = new Page();
$p->setTitle("Ayy lmao");
$p->setState("ayyliens");
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
										AYY LMAO
									</h1>
								</center>
							</div>
							<div class='subpost' style='word-wrap: break-word;padding:0;'>
								<iframe width='100%' height='562px' src='https://www.youtube.com/embed/" . $shitposts[array_rand($shitposts)] . "' frameborder='0' allowfullscreen></iframe><!--width='560' height='315' -->
							</div>
						</div>");
$p->finish();
?>