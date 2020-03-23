<?php
require_once "../util/session.php";
require "../util/page.php";
$p = new Page();
$p->setWallMargins("right");
$p->setWallHTML("");

$p->setTitle("Kontakti");
$p->setState("lolnah");
$p->setSetupScript("getSinglePost(" . $_GET['post'] . ", function(obj){window.singlepost = new PostClass(obj, function(){}); \$('#wall').append(singlepost.element);singlepost.element.fadeIn();});
cleanup = function(){singlepost.deleteThis();delete window.singlepost;}");
$p->finish();
?>