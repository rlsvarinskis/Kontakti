
function getSinglePost(pid, retrieved)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR, //TODO Make this update the loading bar instead
		type: "GET",
		url: "/api/get/post.php?pid=" + pid,
		success: function(e)
		{
			if (typeof e === "object")
			{
				if (e.status == "SUCCESS")
					retrieved(e.post);
				displayMessages(e.messages);
			} else
			{
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
				//Show error
			}
		},
		error: showConnectionError
	});
}


//Like a post
function like(post)
{
	$.ajax(
	{
		type: "POST",
		url: "/api/post/like.php",
		data:
		{
			post: post.id
		},
		success: function(obj)
		{
			if (typeof obj == "object")
			{
				post.element.find(".likebutton").html(obj.liked ? "Unlike" : "Like");
				post.element.find(".likenum").html(obj.likes); //TODO store a variable that points to the likes element
				displayMessages(obj.messages);
			}
			else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: showConnectionError
	})
}

//Delete a post
function deletePost(post, parentUpdate) //TODO
{
	showProgress();
	$.ajax(
	{
		xhr: getXHR,
		type: "POST",
		url: "/api/post/delete.php",
		data:
		{
			pid: post.id
		},
		success: function(e)
		{
			if (typeof e === "object")
				displayMessages(e.messages);
			else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			
			if (typeof parentUpdate !== "function")
				tick();
			else
				parentUpdate();
		},
		error: showConnectionError
	})
}

//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------

function submitComment(post, longitude, latitude)
{
	showProgress(); //TODO
	post.textinput.prop("disabled", true);
	var text = post.textinput.val();
	if (text.length == 0 && post.imagearray.length == 0)
	{
		//TODO
		$("#errors").prepend("<div class='popupcontainer' id='imgerr' onclick='removeDiv(\"imgerr\")'><div class='popupcell'><div class='popup'><div class='ipopup'><div class='title'>Message is empty</div><div class='message'>The message you wanted to post seems to be empty...<br />Write something or post a picture.</div></div></div></div></div>");
		post.textinput.prop("disabled", false);
		return
	}
	var data = {pid: post.parentID, text: text, album: "Comments", longitude: longitude, latitude: latitude, images: post.imagearray.length};
	for (var x = 0; x < post.imagearray.length; x++)
		data["image" + x] = post.imagearray[x].associatedData;
	$.ajax(
	{
		xhr: getXHR,
		type: "POST",
		url: "/api/postpost.php",
		data: data,
		success: function(t) //TODO messages?
		{
			post.textinput.val("");
			post.textinput.prop("disabled", false);
			post.images.html("");
			post.parentUpdate();
			post.retrieveComments();
		},
		error: showConnectionError //TODO enable post.textinput
	})
}

//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------

function submitEdit(post)
{
	showProgress();
	getLocation(function(e){
		continueEdit(post, e.coords.longitude, e.coords.latitude);
	}, function(e){
		continueEdit(post);
	});
}

function continueEdit(post, longitude, latitude)
{
	var buttons = post.editable.find(".button");
	buttons.prop("disabled", true);
	
	var newtext = post.editable.find("textarea").val();
	
	if (newtext == post.text || newtext == "")
		cancelEdit(post);
	else
	{
		$.ajax(
		{
			xhr: getXHR,
			type: "POST",
			url: "/api/post/edit.php",
			data:
			{
				text: newtext,
				pid: post.id,
				longitude: longitude,
				latitude: latitude
			},
			success: function(e) //TODO
			{
				cancelEdit(post);
				tick()
			},
			error: function(e, n, r)
			{
				buttons.prop("disabled", false);
				showConnectionError(e, n, r);
			}
		});
	}
}

function cancelEdit(post)
{
	post.editable.after(post.element);
	post.editable.remove();
	post.editable = undefined;
}

//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------

function toLocalTime(utc)
{
	var date = new Date(Date.UTC(utc.getFullYear(), utc.getMonth(), utc.getDate(), utc.getHours(), utc.getMinutes(), utc.getSeconds(), utc.getMilliseconds()));
	
	var day = date.getDate();
	var digit = day % 10;
	
	if (digit == 1 && day != 11) day += "st";
	else if (digit == 2 && day != 12) day += "nd";
	else if (digit == 3 && day != 13) day += "rd";
	else day += "th";
	
	var hours = date.getHours() + "";
	if (hours.length < 2) hours = "0" + hours;
	
	var mins = date.getMinutes() + "";
	if (mins.length < 2) mins = "0" + mins;
	
	return hours + ":" + mins + " " + month[date.getMonth()] + " " + day + ", " + date.getFullYear()
}

/*function timeSince(e)
{
	var t = Math.round((Date.UTC(year, month, day, hour, minute, second) - e) / 1e3);
	var n = Math.round(t / 31536e3);
	if (n >= 1)
	{
		return n + " year" + (n == 1 ? "" : "s") 
	}
	n = Math.round(t / 2592e3);
	if (n >= 1)
	{
		return n + " month" + (n == 1 ? "" : "s") 
	}
	n = Math.round(t / 86400);
	if (n >= 1)
	{
		return n + " day" + (n == 1 ? "" : "s") 
	}
	n = Math.round(t / 3600);
	if (n >= 1)
	{
		return n + " hour" + (n == 1 ? "" : "s") 
	}
	n = Math.round(t / 60);
	if (n >= 1)
	{
		return n + " minute" + (n == 1 ? "" : "s") 
	}
	return Math.round(t) + " second" + (n == 1 ? "" : "s") 
}*/

function postTools(e)
{
	var tools = $(e.parentNode);
	var n = tools.attr("opened");
	$(".arrows").each(function()
	{
		$(this).attr("opened", "no")
	});
	if (n == "no")
	{
		tools.attr("opened", "yes")
	}
}

/*<!--<div class="popupbackground imagepopup">
	<div class="popupcell">
		<div class="popupcontainer">
			<div class="popupcontent">
			</div>
		</div>
	</div>
</div>
<div class='popuparrowtable'>
	<div class="verticallycentered">
		<div class="popuparrow fa fa-angle-left"></div>
		<div class="popuparrow fa fa-angle-right"></div>
	</div>
</div>-->*/

function getPostMedia(images)
{
	var cont = $("<div>").addClass("postmedia");
	
	var photos = $("<div>").addClass("postMediaAlbum");
	
	if (images.length == 0)
	{
		return cont;
	} else if (images.length == 1)
	{
		cont.append($("<img>").addClass("postimage").attr("src", "/files/" + images[0])).click(function(e)
		{
			var popup = $("<div>").css("z-index", "900").css("position", "fixed").append(
				$("<div>").addClass("imagepopupbackground").append(
					$("<img>").addClass("popupimagefit").attr("src", "/files/" + images[0]).keydown(function(e){console.log(e);})
				).click(function(e)
				{
					if ($(e.target).hasClass("imagepopupbackground"))
					{
						popup.fadeOut(400, function(){
							popup.remove();
						});
					}
				}).keydown(function(e)
				{
					console.log(e);
					if (e.keyCode == 27)
					{
						popup.fadeOut(400, function(){
							popup.remove();
						});
					}
				})
			);
			popup.focus();
			$(document.body).append(popup);
		});
	} else
	{
		for (var i = Math.min(images.length, 3); i > 0; i--)
		{
			photos.append(
				$("<div>").addClass("postImagePaper").append(
					$("<div>").addClass("postImageInternal").css("background-image", "url(/files/" + images[i - 1] + ")")
				).attr("rot", i)
			);
		}//$("<img>").addClass("postAlbumImage").attr("src", "/files/" + images[i - 1])
		cont.append(photos.click(function(e)
		{
			var imageelements = [];
			
			var currentViewing = 0;
			
			var imagecont = $("<div>").css("width", "100%").css("height", "100%");
			
			for (var i = 0; i < images.length; i++)
				imagecont.append(imageelements[i] = $("<div>").css("width", "100%").css("height", "100%").css("position", "relative").append($("<img>").addClass("popupimagefit").attr("src", "/files/" + images[i])));
			
			var popup = $("<div>").css("z-index", "900").css("position", "fixed").append(
				$("<div>").addClass("imagepopupbackground").append(
					imagecont
				).click(function(e)
				{
					if ($(e.target).hasClass("imagepopupbackground"))
					{
						popup.fadeOut(400, function(){
							imagecont.flickity("destroy");
							popup.remove();
						});
					}
				})
			).keydown(function(e){
				if (e.keyCode == 27)
				{
					popup.fadeOut(400, function(){
						imagecont.flickity("destroy");
						popup.remove();
					});
				}
			})
			/*.append(
				$("<div>").addClass("popuparrow").addClass("fa").addClass("fa-angle-left").click(function(){
					var prev = imageelements[currentViewing];
					currentViewing = (((currentViewing - 1) % imageelements.length) + imageelements.length) % imageelements.length;
					prev.after(imageelements[currentViewing]);
					prev.remove();
				})
			).append(
				$("<div>").addClass("popuparrow").addClass("fa").addClass("fa-angle-right").click(function(){
					var prev = imageelements[currentViewing];
					currentViewing = (currentViewing + 1) % imageelements.length;
					prev.after(imageelements[currentViewing]);
					prev.remove();
				})
			)*/;
			$(document.body).append(popup);
			imagecont.flickity({
					cellAlign: 'center',
					contain: false,
					setGallerySize: false,
					percentPosition: true
				});
			
			imagecont.focus();
		}));
	}
	
	return cont;
}

function loadPhoto(album, id, fin)
{
	if (id < album.photos.length)
		album.photos[id].img.on('load', function(){
			loadPhoto(album, id + 1, fin);
		}).attr("src", "/files/" + album.photos[id].id);
	else
		fin();
}

function workPostText(txt)
{
	return emoticons(tags(escapeHtmlEntities(txt)));
}

function tags(txt)
{
	for (var i = 0; i < tagsrx.length; i++)
		txt = txt.replace(tagsrx[i], tagsrp[i]);
	return txt;
}

function emoticons(txt)
{
	for (var i = 0; i < emoticonregex.length; i++)
		txt = txt.replace(emoticonregex[i], emoticonrep[i]);
	return txt;
}

function escapeHtmlEntities(txt)
{
	return txt.replace(/[\u00A0-\u2666<>\&]/g, function(txt)
	{
		return "&#" + txt.charCodeAt(0) + ";"
	});
};

var tagsrx = [/\[monospace\]((?:\r|\n|.)*)\[\/monospace\]/g, /\[code\]((?:\r|\n|.)*)\[\/code\]/g, /\[bold\]((?:\r|\n|.)*)\[\/bold\]/g, /\[italic\]((?:\r|\n|.)*)\[\/italic\]/g, /\[center\]((?:\r|\n|.)*)\[\/center\]/g, /\n/g];
var tagsrp = ["<code>$1</code>", "<pre>$1</pre>", "<b>$1</b>", "<i>$1</i>", "<center>$1</center>", "<br />"];
var emoticonregex = [
	/\(happy\)/g,
	/&#62;:\(/g,
	/&#62;:\)/g,
	/:\)/g,
	/\(smile\)/g,
	/\(laugh\)/g,
	/:D/g,
	/\(heart\)/g,
	/&#60;3/g,
	/\(inlove\)/g,
	/\(angry\)/g,
	/\(sad\)/g,
	/:\(/g,
	/\(angry\)/g,
	/\(evil\)/g,
	/:&#62;/g,
	/:\/\)/g,
	/mlg/gi,
	/doritos/gi,
	/optic/gi,
	/(faze)|(feiz)|(faiz)/gi,
	/((mtn)|(mountain))?dew/gi,
	/(x{3})(.*)(x{3})/gi
];
var emoticonrep = [
	"<span class='emoticon' style='background-position:-0px -0px;' title='(happy)'></span>",
	"<span class='emoticon' style='background-position:-80px -0px;' title='&gt;:&#40;'></span>",
	"<span class='emoticon' style='background-position:-20px -20px;' title='&gt;:&#41'></span>",
	"<span class='emoticon' style='background-position:-20px -0px;' title=':&#41;'></span>",
	"<span class='emoticon' style='background-position:-20px -0px;' title='(smile)'></span>",
	"<span class='emoticon' style='background-position:-40px -0px;' title='(laugh)'></span>",
	"<span class='emoticon' style='background-position:-40px -0px;' title=':D'></span>",
	"<span class='emoticon' style='background-position:-60px -0px;' title='(heart)'></span>",
	"<span class='emoticon' style='background-position:-60px -0px;' title='&lt;3'></span>",
	"<span class='emoticon' style='background-position:-60px -0px;' title='(inlove)'></span>",
	"<span class='emoticon' style='background-position:-80px -0px;' title='(angry)'></span>",
	"<span class='emoticon' style='background-position:-0px -20px;' title='(sad)'></span>",
	"<span class='emoticon' style='background-position:-0px -20px;' title=':&#40;'></span>",
	"<span class='emoticon' style='background-position:-80px -0px;' title='(angry)'></span>",
	"<span class='emoticon' style='background-position:-20px -20px;' title='(evil)'></span>",
	"<span class='emoticon' style='background-position:-40px -20px;' title=':&gt;'></span>",
	"<span class='emoticon' style='background-position:-40px -20px;' title=':/)'></span>",
	"<img style='margin-top:-1px;position:absolute;margin-left:3px;' src='/images/icons/mlg.png'></img><div style='width:65px;display:inline-block;'></div>",
	"<img style='margin-top:-23px;position:absolute;margin-left:3px;' src='/images/icons/doritos.png'></img><div style='width:75px;display:inline-block;'></div>",
	"<img style='margin-top:-2px;position:absolute;margin-left:2px;' src='/images/icons/optic.png'></img><div style='width:35px;display:inline-block;'></div>",
	"<img style='margin-top:-2px;position:absolute;' src='/images/icons/faze.png'></img><div style='width:27px;display:inline-block;'></div>",
	"<img style='margin-top:-3px;position:absolute;' src='/images/icons/dew.png'></img><div style='width:42px;display:inline-block;'></div>",
	"<span style='color:#F33;font-weight:bold;text-shadow:0 1px 1px black,0 0 5px blue;'>$1$2$3</span>"
];