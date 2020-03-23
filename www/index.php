<?php
$reqs = true;
require_once "./util/session.php";

if (isset($userdata))
{
	require "./util/page.php";
	$p = new Page();
	$p->setWallMargins("right");
	/*$p->setWallHTML("<div class='post'>
		<textarea maxlength='65535' class='newpost' id='commentbox0' onkeydown='newpostfn(event)' onpaste='pasteHandler(event, globalpost0)' placeholder='What&lsquo;s on your mind?'></textarea>
		<div class='newpostimages' id='commentbox0images'></div>
		<div class='newpostbottom'>
			<input accept='image/*' style='float:left;' type='file' id='commentbox0file' onchange='readImage(this)' multiple='multiple' />
			<button class='button' id='newpostbutton' onclick='submit();'>Post</button>
		</div>
	</div>");*/

	$p->setTitle("Kontakti");
	$p->setState("posts");
	$p->setSetupScript("window.postbox = new PostboxClass();\$('#wall').append(postbox.element);
	window.mainposts = new PostsClass({limit: 30});
	registerModule(mainposts);
	\$('#wall').append(mainposts.element);
	cleanup = function(){
		mainposts.deleteThis();
		unregisterModule(mainposts);
		postbox.deleteThis();
		
		delete postbox;
		delete mainposts;
	}");
	$p->finish();
} else
{
	include "./util/reg.php";
}
?>
