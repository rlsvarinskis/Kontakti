var albumclass = function(options)
{
	this.options = options; //TODO create own object that uses options values
	
	this.albums = [];
	
	var showmoreAlbums = $("<div>").addClass("showmore").append(
		$("<div>").addClass("showmoredots").append($("<div>")).append($("<div>")).append($("<div>"))
	).click(function(){
		retrieveAlbums(profileid, albums.length == 0 ? Infinity : albums[albums.length - 1].time, 0);
	}).hide();
	this.element = $("<div>").addClass("post").append(
		$("<div>").addClass("postdivtitle").html("Albums").append(
			$("<div>").addClass("titletools").append(
				$("<div>").addClass("titletool").append(
					$("<i>").addClass("fa").addClass("fa-plus")
				).append(" (new)").click(function()
				{
					createNewAlbum();
				})
			)
		)
	).append(showmoreAlbums);
}

albumclass.prototype.retrieveAlbums = function(profileid, from, to) //Retrieve /api/getalbums.php and update the albums if successful
{
	if (!from)
		from = getVisibleAlbums().newest;
	if (albums.length == 0 || albums[0].time == from)
		from = Infinity;
	if (!to)
		to = 0;
	showProgress();
	showmoreAlbums.hide();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getalbums.php?from=" + from + "&to=" + to + "&limit=" + limit + "&user=" + profileid,
		success: function(e)
		{
			if (typeof e === "object")
			{
				showmoreAlbums.show();
				if (e.album.length == albumlimit)
					to = e.album[albumlimit - 1].time;
				else if (to == 0)
					showmoreAlbums.hide();
				displayAlbums(e.album, from, to);
				retrievePhotos(viewingAlbum);
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

var album = function(a)
{
	
}

var albums = [];

/*var albuminfo = 
	$("<div>").css("background-image", "url(/images/newalbum.png)").addClass("albuminfocover").addClass("newalbum")/*.append(
		$("<div>").addClass("albuminfo").append(
			$("<div>").addClass("albumname").html("Create a new album")
		)//.append(
			//$("<div>").addClass("albumamount").html(album.amount)
		//)
	)*//*.click(function()
	{
		createNewAlbum();
	});*/


var showmoreAlbums = $("<div>").addClass("showmore").append(
	$("<div>").addClass("showmoredots").append($("<div>")).append($("<div>")).append($("<div>"))
).click(function(){
	retrieveAlbums(profileid, albums.length == 0 ? Infinity : albums[albums.length - 1].time, 0);
}).hide();
var albuminfoelement = $("<div>").addClass("post").append(
	$("<div>").addClass("postdivtitle").html("Albums").append(
		$("<div>").addClass("titletools").append(
			$("<div>").addClass("titletool").append(
				$("<i>").addClass("fa").addClass("fa-plus")
			).append(" (new)").click(function()
			{
				createNewAlbum();
			})
		)
	)
)/*.append(albuminfo)*/.append(showmoreAlbums);

var albumlimit = 30;
var albumsperrow = 4;

var viewingAlbum;

var isDraggingAlbums = false;

//Retrieve /api/getalbums.php and update the albums if successful
function retrieveAlbums(profileid, from, to)
{
	if (!from)
		from = getVisibleAlbums().newest;
	if (albums.length == 0 || albums[0].time == from)
		from = Infinity;
	if (!to)
		to = 0;
	showProgress();
	showmoreAlbums.hide();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getalbums.php?from=" + from + "&to=" + to + "&limit=" + limit + "&user=" + profileid,
		success: function(e)
		{
			if (typeof e === "object")
			{
				showmoreAlbums.show();
				if (e.album.length == albumlimit)
					to = e.album[albumlimit - 1].time;
				else if (to == 0)
					showmoreAlbums.hide();
				displayAlbums(e.album, from, to);
				retrievePhotos(viewingAlbum);
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

function displayAlbums(newalbums, from, to)
{
	updateAlbums(newalbums, from, to);
	sortAlbums();
	displayNewAlbums();
}

//Remove any albums that are deleted
function removeDeletedAlbums(newalbums, oldalbums)
{
	for (var i = 0; i < oldalbums.length; i++)
	{
		var remove = true;
		
		for (var j = 0; j < newalbums.length; j++)
		{
			if (oldalbums[i].id == newalbums[j].id)
			{
				remove = false;
				break;
			}
		}
		
		if (remove)
		{
			if (oldalbums[i].info)
				oldalbums[i].remove();
			if (viewingAlbum == oldalbums[i])
				viewingAlbum = null;
			albums.splice(albums.indexOf(oldalbums[i]), 1);
			oldalbums.splice(i--, 1);
		}
	}
}

//Add any new albums
function addNewAlbums(newalbums, oldalbums)
{
	for (var i = 0; i < newalbums.length; i++)
	{
		var addAlbum = true;
		
		for (var j = 0; j < oldalbums.length; j++)
		{
			if (newalbums[i].id == oldalbums[j].id)
			{
				if (oldalbums[j].info)
					updateAlbum(newalbums[i], oldalbums[j]);
				addAlbum = false;
				break;
			}
		}
		
		if (addAlbum)
			albums.push(newalbums[i]);
	}
}

//Update the list of albums
function updateAlbums(newalbums, from, to)
{
	var filter = albumsWithinTime(from, to);
	
	removeDeletedAlbums(newalbums, filter.relevant);
	addNewAlbums(newalbums, filter.relevant);
}

//Sort all the albums by their creation time
function sortAlbums()
{
	albums.sort(function(a, b)
	{
		return b.time - a.time;
	});
}

//Display any new albums that have appeared in the albums array but aren't in the DOM yet
function displayNewAlbums()
{
	for (var i = 0; i < albums.length; i++)
	{
		var album = albums[i];
		if (!album.info)
		{
			album.photos = [];
			album.selectedPhotos = [];
			//info = album cover & stuff
			//details = where all the photos are displayed
			var closestAlbum = [albuminfoelement, albumelement];
			var closestDistance = -Infinity;
			for (var x = 0; x < albums.length; x++)
			{
				if (!!albums[x].info)
				{
					var otherid = albums[x].id;
					var dist = album.id - otherid;
					if (otherid == album.id)
					{
					} else if (Math.abs(dist) < Math.abs(closestDistance))
					{
						closestAlbum[0] = albums[x].info;
						closestAlbum[1] = albums[x].details;
						closestDistance = dist;
					}
				}
			}
			album.info = createAlbumInfo(album, closestDistance, closestAlbum[0]);
			//createAlbumDetails();
		}
	}
}

//Adds the post to the DOM and returns the newly created element
function createAlbumInfo(album, distance, closestElement)
{
	var location = "";
	if (album.geolocation)
		$.ajax(
		{
			async: false,
			type: "GET",
			url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + album.geolocation + "&sensor=false",
			success: function(e)
			{
				if (typeof e === "object")
					for (var t = 0; t < e.results.length; t++)
					{
						var n = e.results[t];
						for (var i = 0; i < n.types.length; i++)
							if (n.types[i] == "street_address")
							{
								location = "&nbsp;&#8226;&nbsp;Near " + n.formatted_address;
								return;
							}
					}
				else
					alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			},
			error: function(e, t, n)
			{
				alertError("Connection error", "Unable to connect to server", 5000);
			}
		});
	
	var element = $("<div>").css("background-image", "url(/files/" + album.cover + ")").addClass("albuminfocover").append(
		$("<div>").addClass("albumtools").append(
			$("<div>").addClass("albumtool").html("<i class='fa <!--fa-2x--> fa-pencil'></i>").click(
				function() {
					renameAlbum(album);
				}
			)
		).append(
			$("<div>").addClass("albumtool").html("<i class='fa <!--fa-2x--> fa-times'></i>").click(
				function() {
					deleteAlbum(album);
				}
			)
		)
	).append(
		$("<div>").addClass("albuminfo").append(
			$("<div>").addClass("albumname").html(album.name)
		).append(
			$("<div>").addClass("albumamount").html(album.amount)
		)
	).click(function(e)
	{
		if (e.target != this || isRetrievingPhotos)
			return;
		albumelement.children().detach();
		albumelement.append(loadingphotos)
		if (viewingAlbum)
		{
			viewingAlbum.photos = [];
			viewingAlbum.info.removeAttr("selected");
		}
		viewingAlbum = album;
		viewingAlbum.info.attr("selected", "y");
		retrievePhotos(album);
	});
	
	album.remove = function()
	{
		element.remove();
	};
	
	if (Math.abs(distance) == Infinity)
		closestElement.append(element);
	else if (distance < 0)
		closestElement.after(element);
	else if (distance > 0)
		closestElement.before(element);
	
	if (!winfocus)
		element.show();
	else
		element.fadeIn();
	return element;
}

function updateAlbum(data, album)
{
	if (album.name != data.name)
		album.info.find(".albumname").html(album.name = data.name);
	if (album.amount != data.amount)
		album.info.find(".albumamount").html(album.amount = data.amount);
	if (album.cover != data.cover)
		album.info.css("background-image", "url(/files/" + (album.cover = data.cover) + ")");
	//if (album.time != data.time)
	//	album.element.find(".postdate").html(msToTime(new Date((album.time = data.time) * 1e3)));
	//if (album.text != data.text)
	//	album.element.find(".postbody").html(workPostText(album.text = data.text));
	//if (album.likes != data.likes)
	//	album.element.find(".likenum").html(album.likes = data.likes);
	//if (album.liked != data.liked)
	//	album.element.find(".likebutton").html((album.liked = data.liked) ? "Unlike" : "Like");
	//if (album.comments.length != data.comments.length)
	//	album.element.find(".comnum").html(album.comments.length = data.comments.length);
	//if (album.edits != data.edits)
	//{
	//	album.element.find(".editnum").html(data.edits);
	//	album.element.find(".editdisplay").show();
	//}
}

//------------------PHOTOS------------------

var loadingphotos = $("<div>").addClass("innerposttext").append(
	$("<div>").addClass("radialloader").append(
		$("<div>").addClass("radialloaderi")
	).append(
		$("<div>").addClass("radialloaderorb")
	).append(
		$("<div>").addClass("radialloaderorb").css("animation-delay", "0.125s")
	).append(
		$("<div>").addClass("radialloaderorb").css("animation-delay", "0.25s")
	).append(
		$("<div>").addClass("radialloaderorb").css("animation-delay", "0.375s")
	).append(
		$("<div>").addClass("radialloaderorb").css("animation-delay", "0.5s")
	)
);
var nophotos = $("<div>").addClass("emptyContainer").append(
	$("<div>").addClass("emptyCentered").append(
		$("<div>").addClass("emptyText").html("No album selected")
	)
);
var albumelement = $("<div>").css("padding", "4px").append(loadingphotos);

var showmorePhotos = $("<div>").addClass("showmore").append(
	$("<div>").addClass("showmoredots").append($("<div>")).append($("<div>")).append($("<div>"))
).click(function(){
	retrievePhotos(viewingAlbum);
}).hide();
var albumelementcontainer = $("<div>").addClass("post").append(
	$("<div>").addClass("postdivtitle").html("Photos")
).append(albumelement).append(showmorePhotos);

var medialimit = 30;

var maxmediaheight = 3;
var minmediaheight = 6;

var isRetrievingPhotos = false;

//Retrieve /api/getmedia.php and update the posts if successful
function retrievePhotos(album, from, to)
{
	if (isRetrievingPhotos)
		return;
	if (!album)
	{
		loadingphotos.detach();
		nophotos.find(".emptyText").html("No album selected");
		albumelement.append(nophotos);
		return;
	}
	nophotos.find(".emptyText").html("No photos");
	isRetrievingPhotos = true;
	if (!from)
		from = getVisiblePhotos(album).newest;
	if (album.photos.length == 0 || album.photos[0].id == from)
		from = Infinity;
	if (!to)
		to = 0;
	showProgress();
	showmorePhotos.hide();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/getmedia.php?from=" + from + "&to=" + to + "&limit=" + limit + "&album=" + album.id,
		success: function(e)
		{
			if (typeof e === "object")
			{
				showmorePhotos.show();
				if (e.media.length == medialimit)
					to = e.media[medialimit - 1].id;
				else if (to == 0)
					showmorePhotos.hide();
				displayPhotos(album, e.media, from, to);
				displayMessages(e.messages);
			} else
			{
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
				isRetrievingPhotos = false;
			}
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
			isRetrievingPhotos = false;
		}
	});
}

function displayPhotos(album, newphotos, from, to)
{
	var min = updatePhotos(album, newphotos, from, to) * 0;
	sortPhotos(album);
	displayNewPhotoDetails(album, min);
}

//Remove any posts that seem to be deleted
function removeDeletedPhotos(album, newphotos, oldphotos)
{
	var min = Infinity;
	for (var i = 0; i < oldphotos.length; i++)
	{
		var remove = true;
		
		for (var j = 0; j < newphotos.length; j++)
		{
			if (oldphotos[i].id == newphotos[j].id)
			{
				remove = false;
				break;
			}
		}
		
		if (remove)
		{
			if (oldphotos[i].img)
				oldphotos[i].img.remove();
			album.photos.splice(album.photos.indexOf(oldphotos[i]), 1);
			min = Math.min(min, i);
			oldphotos.splice(i--, 1);
		}
	}
	return min;
}

//Add any new posts
function addNewPhotos(album, newphotos, oldphotos)
{
	var min = Infinity;
	for (var i = 0; i < newphotos.length; i++)
	{
		var addPhoto = true;
		
		for (var j = 0; j < oldphotos.length; j++)
		{
			if (newphotos[i].id == oldphotos[j].id)
			{
				if (oldphotos[j].element)
					/*updatePhoto(newphotos[i], oldphotos[j])*/;
				addPhoto = false;
				break;
			}
		}
		
		if (addPhoto)
		{
			album.photos.push(newphotos[i]);
			min = Math.min(min, i);
		}
	}
	return min;
}

//Update the list of posts
function updatePhotos(album, newphotos, from, to)
{
	var filter = photosWithinID(album, from, to);
	return Math.min(removeDeletedPhotos(album, newphotos, filter.relevant), addNewPhotos(album, newphotos, filter.relevant));
}

//Sort all the posts by their posting time
function sortPhotos(album)
{
	album.photos.sort(function(a, b)
	{
		return b.id - a.id;
	});
}

//Display any new posts that have appeared in the posts array but aren't in the DOM yet
function displayNewPhotoDetails(album, min)
{
	for (var i = 0; i < album.photos.length; i++)
	{
		var photo = album.photos[i];
		photo.album = album;
		if (!photo.img)
		{
			var previousphoto = albumelement;
			var previousdistance = Infinity;
			for (var x = 0; x < album.photos.length; x++)
			{
				if (!!album.photos[x].img)
				{
					var otherid = album.photos[x].id;
					var dist = photo.id - otherid;
					if (otherid == photo.id)
					{
					} else if (Math.abs(dist) < Math.abs(previousdistance))
					{
						previousphoto = album.photos[x].img;
						previousdistance = dist;
					}
				}
			}
			if (state == "photos")
			{
				//photo.element = createPhotoDetails(album, photo, previousdistance, previousphoto);
				photo.img = createThumbnail(photo, previousdistance, previousphoto);
			}
		}
	}
	if (album.photos.length == 0)
		albumelement.append(nophotos);
	loadPhoto(album, 0, function(){
		createThumbnails(album, min);
	});
}

function loadPhoto(album, id, fin)
{
	if (id < album.photos.length)
	{
		var f = function()
		{
			loadPhoto(album, id + 1, fin);
			album.photos[id].img.unbind('load', f);
		};
		album.photos[id].img.on('load', f).attr("src", "/files/" + album.photos[id].id);
	} else
	{
		fin();
	}
}

function createThumbnails(album, min)
{
	var cury = 0;
	for (var i = min; i < album.photos.length; )
	{
		var photos = [];
		
		var width = albumelement.width();
		var h;
		
		//maxmediaheight
		//minmediaheight

		//h = w / (w1' + w2' + ... + wn')
		//w = container width
		//wn = image width
		//hn = image height
		//wn' = wn / hn
		for (; i < album.photos.length; i++)
		{
			photos.push(album.photos[i]);
			
			var divisor = 0;
			
			for (var x = 0; x < photos.length; x++)
				divisor += photos[x].img.get(0).naturalWidth / photos[x].img.get(0).naturalHeight;
			
			h = width / divisor;
			
			if (/*h >= width / minmediaheight && */h <= width / maxmediaheight)
			{
				i++;
				break;
			}
		}
		var curx = 0;
		for (var x = 0; x < photos.length; x++)
		{
			var nw = photos[x].img.get(0).naturalWidth;
			var nh = photos[x].img.get(0).naturalHeight;
			var newwidth = nw / nh * h - 8;
			
			photos[x].row = photos;
			/*if (photos[x].img.is(":visible"))
			{
				(function(img, h, newwidth, curx, cury)
				{
					var ofs = img.position();
					console.log(ofs);
					img.css("top", ofs.top + "px").css("left", ofs.left + "px").css("position", "absolute");
					img.animate({
						width: newwidth,
						height: h,
						left: curx,
						top: cury
					}, 500, "swing", function(){
						img.attr("width", newwidth + "px");
						img.attr("height", h + "px");
						img.removeAttr("style");
					});
				})(photos[x].img, h, newwidth, curx, cury);
			} else*/
			{
				photos[x].img.resizedWidth = newwidth;
				photos[x].img.resizedHeight = h;
				photos[x].img.attr("width", newwidth + "px");
				photos[x].img.attr("height", h + "px");
				photos[x].img.show();
			}
			curx += newwidth + 8;
		}
		cury += h + 8;
	}
	loadingphotos.detach();
	isRetrievingPhotos = false;
}

//Adds the post to the DOM and returns the newly created element //TODO not used yet
function createPhotoDetails(album, photo, distance, closestElement)
{
	var location = "";
	if (photo.geolocation)
		$.ajax(
		{
			async: false,
			type: "GET",
			url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + photo.geolocation + "&sensor=false",
			success: function(e)
			{
				if (typeof e === "object")
					for (var t = 0; t < e.results.length; t++)
					{
						var n = e.results[t];
						for (var i = 0; i < n.types.length; i++)
							if (n.types[i] == "street_address")
							{
								location = "&nbsp;&#8226;&nbsp;Near " + n.formatted_address;
								return;
							}
					}
				else
					alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			},
			error: function(e, t, n)
			{
				alertError("Connection error", "Unable to connect to server", 5000);
			}
		});
	
	var element = $("<div>");
	
	if (distance == Infinity)
		closestElement.prepend(element);
	else if (distance < 0)
		closestElement.after(element);
	else if (distance > 0)
		closestElement.before(element);
	
	if (!winfocus)
		element.show();
	else
		element.fadeIn();
	return element;
}

//Adds the photo to the DOM and returns the newly created element
function createThumbnail(photo, distance, closestElement)
{
	var element = $("<img>").addClass("imagePreview").click(function(e){
		if (isDraggingAlbums)
			return;
		if (e.ctrlKey)
		{
			if (photo.album.selectedPhotos.indexOf(photo) == -1)
			{
				photo.album.selectedPhotos.push(photo);
				element.attr("selected", "yes");
			} else
			{
				photo.album.selectedPhotos.splice(photo.album.selectedPhotos.indexOf(photo), 1);
				element.removeAttr("selected");
			}
		} else if (e.shiftKey)
		{
			var lp = photo.album.selectedPhotos[photo.album.selectedPhotos.length - 1]
			var lpos = photo.album.photos.indexOf(lp);
			var cpos = photo.album.photos.indexOf(photo);
			if (cpos < lpos)
			{
				var t = lpos;
				lpos = cpos;
				cpos = t;
			}
			lpos++;
			for (; lpos < cpos; lpos++)
			{
				if (photo.album.selectedPhotos.indexOf(photo.album.photos[lpos]) == -1)
				{
					photo.album.selectedPhotos.push(photo.album.photos[lpos]);
					photo.album.photos[lpos].img.attr("selected", "yes");
				}
			}
			if (photo.album.selectedPhotos.indexOf(photo) == -1)
				photo.album.selectedPhotos.push(photo);
			photo.img.attr("selected", "yes");
		} else
		{
			for (var i = 0; i < photo.album.selectedPhotos.length; i++)
				photo.album.selectedPhotos[i].img.removeAttr("selected");
			photo.album.selectedPhotos = [photo];
			element.attr("selected", "yes");
		}
	}).on('dragstart', function(ev)
	{
		if (!isDraggingAlbums && !element.animating)
		{
			if (photo.album.selectedPhotos.indexOf(photo) == -1)
			{
				for (var i = 0; i < photo.album.selectedPhotos.length; i++)
					photo.album.selectedPhotos[i].img.removeAttr("selected");
				photo.album.selectedPhotos = [photo];
				element.attr("selected", "yes");
			}
			for (var i = 0; i < viewingAlbum.selectedPhotos.length; i++)
			{
				var img = viewingAlbum.selectedPhotos[i].img;
				var elp = img.offset();
				
				isDraggingAlbums = true;
				
				img.placeholder = $("<div>").width(img.resizedWidth + 8).height(img.resizedHeight + 8).css("display", "inline-block");
				img.after(img.placeholder);
				img.attr("dragged", "yes");
				
				img.dragOffset = {x: (ev.originalEvent.pageX - elp.left) / img.width(), y: (ev.originalEvent.pageY - elp.top) / img.height()};
				
				img/*.css("transform-origin", img.dragOffset.x * 100 + "% " + img.dragOffset.y * 100 + "%")*/.css("width", img.width() * 1.25).css("height", img.height() * 1.25);
				//img.offset({left: ev.originalEvent.pageX - img.dragOffset.x * img.width() * 1.5, top: ev.originalEvent.pageY - img.dragOffset.y * img.height() * 1.5});
			}
		}
		ev.preventDefault();
	}).hide();
	
	if (distance == Infinity)
		closestElement.prepend(element);
	else if (distance < 0)
		closestElement.after(element);
	else if (distance > 0)
		closestElement.before(element);
	
	return element;
}

$(document).mousemove(function(e)
{
	if (isDraggingAlbums)
	{
		for (var i = 0; i < viewingAlbum.selectedPhotos.length; i++)
		{
			var img = viewingAlbum.selectedPhotos[i].img;
			if (img.animating)
				return;
			img.offset({left: e.pageX - img.dragOffset.x * img.width(), top: e.pageY - img.dragOffset.y * img.height()});
		}
	}
}).mouseup(function(e)
{
	if (e.which == 1 && isDraggingAlbums)
	{
		var albumDroppedOn = null
		for (var i = 0; i < albums.length; i++)
		{
			var of = albums[i].info.offset();
			if (e.pageX >= of.left && e.pageX <= of.left + albums[i].info.outerWidth() && e.pageY >= of.top && e.pageY <= of.top + albums[i].info.outerHeight())
				albumDroppedOn = albums[i];
		}
		if (albumDroppedOn != null && albumDroppedOn.id != viewingAlbum.id)
		{
			var imagesToMove = [];
			for (var i = 0; i < viewingAlbum.selectedPhotos.length; i++)
			{
				if (viewingAlbum.selectedPhotos[i].img.animating)
					return;
				imagesToMove[i] = viewingAlbum.selectedPhotos[i].id;
			}
			imagesToMove = imagesToMove.join(',');
			moveImagesTo(albumDroppedOn, imagesToMove);
			setTimeout(function(){
				retrieveAlbums(profileid);
			}, 500);
			for (var i = 0; i < viewingAlbum.selectedPhotos.length; i++)
			{
				(function(img)
				{
					var ofs = img.placeholder.offset();
					var pos = img.placeholder.position();
					ofs.left -= pos.left;
					ofs.top -= pos.top;
					img.animating = true;
					img.attr("moved", "y");
					img.width(0);
					img.height(0);
					img.animate({top: albumDroppedOn.info.offset().top - ofs.top + (albumDroppedOn.info.outerHeight()/* - img.height()*/) / 2, left: albumDroppedOn.info.offset().left - ofs.left + (albumDroppedOn.info.outerWidth()/* - img.width()*/) / 2/*, width: 0, height: 0*/}, 500, "swing", function()
					{
						img.placeholder.remove();
						img.dragOffset = null;
						img.animating = false;
						img.remove();
						
						isDraggingAlbums = false;
					});
				})(viewingAlbum.selectedPhotos[i].img);
			}
		} else
		{
			for (var i = 0; i < viewingAlbum.selectedPhotos.length; i++)
			{
				if (viewingAlbum.selectedPhotos[i].img.animating)
					return;
				(function(img)
				{
					img.animating = true;
					img.removeAttr("dragged");
					img.attr("dropped", "y");
					img.css("width", img.attr("width")).css("height", img.attr("height"));
					img.animate({top: img.placeholder.position().top, left: img.placeholder.position().left}, 500, "swing", function()
					{
						img.placeholder.remove();
						img.removeAttr("dropped");
						img.removeAttr("style");
					
						img.dragOffset = null;
						
						img.animating = false;
						isDraggingAlbums = false;
					});
				})(viewingAlbum.selectedPhotos[i].img);
			}
		}
	}
});

function moveImagesTo(album, images)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php?action=move&to=" + album.id + "&media=" + images,
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 60000);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

//------------------ALBUM EDITING------------------

function createNewAlbum()
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php?action=make&name=New Album&longitude=" + "" + "&latitude=" + "",
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			retrieveAlbums(profileid);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

function renameAlbum(album)
{
	var a = $("<div>").addClass("popupcontainer").append(
		$("<div>").addClass("popupcell").append(
			$("<div>").addClass("popup").append(
				$("<div>").addClass("ipopup").append(
					$("<div>").addClass("title").html("Rename")
				).append(
					$("<div>").addClass("message").append(
						$("<input>").attr("type", "text").keyup(function(e)
						{
							if (e.keyCode == 13)
							{
								finishRenameAlbum(album, this.value, a);
							}
						})
					)
				)
			)
		)
	);
	$(".body").append(a);
}

function finishRenameAlbum(album, name, el)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php?action=rename&album=" + album.id + "&newname=" + encodeURIComponent(name),
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			el.remove();
			retrieveAlbums(profileid);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

function deleteAlbum(album)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php?action=delete&album=" + album.id,
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			retrieveAlbums(profileid);
		},
		error: function(e, t, n)
		{
			console.log(e);
			console.log(t);
			console.log(n);
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

//------------------ALBUM UTILITIES------------------

function getOldestAlbum()
{
	var oldestalbum = albums[albums.length - 1];
	var oldest = Infinity;
	for (var i = 0; i < albums.length; i++)
		if (albums[i].time < oldest)
		{
			oldest = albums[i].time;
			oldestalbum = albums[i];
		}
	return oldestalbum;
}

function getVisibleAlbums()
{
	var oldestalbum = Infinity;
	var newestalbum = 0;
	
	for (var i = 0; i < albums.length; i++)
	{
		if (albums[i].time < oldestalbum && isScrolledIntoView(albums[i].info))
			oldestalbum = albums[i].time;
		if (albums[i].time > newestalbum && isScrolledIntoView(albums[i].info))
			newestalbum = albums[i].time;
	}
	
	return {oldest: oldestalbum == Infinity ? 0 : oldestalbum, newest: newestalbum == 0 ? Infinity : newestalbum};
}

function albumsWithinTime(from, to)
{
	var relevantAlbums = [];
	var filteredAlbums = [];
	for (var i = 0; i < albums.length; i++)
	{
		var album = albums[i];
		if (album.time > from || album.time < to)
			filteredAlbums.push(album);
		else
			relevantAlbums.push(album);
	}
	return {relevant: relevantAlbums, removed: filteredAlbums};
}

//------------------PHOTO UTILITIES------------------

function getVisiblePhotos(album)
{
	var oldestphoto = Infinity;
	var newestphoto = 0;
	
	for (var i = 0; i < album.photos.length; i++)
	{
		if (album.photos[i].id < oldestphoto && isScrolledIntoView(album.photos[i].img))
			oldestphoto = album.photos[i].time;
		if (album.photos[i].id > newestphoto && isScrolledIntoView(album.photos[i].img))
			newestphoto = album.photos[i].time;
	}
	
	return {oldest: oldestphoto == Infinity ? 0 : oldestphoto, newest: newestphoto == 0 ? Infinity : newestphoto};
}

function photosWithinID(album, from, to)
{
	var relevantPhotos = [];
	var filteredPhotos = [];
	for (var i = 0; i < album.photos.length; i++)
	{
		var photo = album.photos[i];
		if (photo.id > from || photo.id < to)
			filteredPhotos.push(photo);
		else
			relevantPhotos.push(photo);
	}
	return {relevant: relevantPhotos, removed: filteredPhotos};
}