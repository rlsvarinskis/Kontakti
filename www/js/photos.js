var albums = [];

var albumclass = function(options)
{
	this.options = {
		limit: (!options || typeof options.limit !== "number") ? 4 : options.limit,
		per_row: (!options || typeof options.per_row !== "number") ? 4 : options.per_row,
		profileid: (!options || typeof options.profileid !== "number") ? profileid : options.profileid
	};
	
	this.albums = [];
	this.photos = null;
	this.viewingAlbum = null;
	this.isDraggingAlbums = false;
	
	var dis = this;
	
	albums.push(this);
	
	this.empty = ElementUtils.createEmptyContainer("No albums");
	this.more = $("<div>").addClass("showmore").append(
		$("<div>").addClass("showmoredots").append($("<div>")).append($("<div>")).append($("<div>"))
	).click(function(){
		dis.retrieveAlbums(dis.albums.length == 0 ? Infinity : dis.albums[dis.albums.length - 1].id, 0);
	}).hide();
	
	this.element = $("<div>").addClass("post").append(
		$("<div>").addClass("postdivtitle").html("Albums").append(
			$("<div>").addClass("titletools").append(
				$("<div>").addClass("titletool").append(
					$("<i>").addClass("fa").addClass("fa-plus")
				).append(" (new)").click(function()
				{
					createNewAlbum(dis);
				})
			)
		)
	).append(this.empty).append(this.more);
	
	this.clean = function()
	{
		this.detachPhotos();
		this.element.remove();
		albums.splice(albums.indexOf(this), 1);
	}
	
	this.deleteThis = function()
	{
		this.empty.remove();
		this.more.remove();
		this.element.remove();
		
		for (var name in this.options)
			delete this.options[name];
		
		for (var name in this)
			delete this[name];
	}
}

albumclass.prototype.attachPhotos = function(photosobject)
{
	this.photos = photosobject;
	
	this.photos.element.append(this.loading)
	if (this.viewingAlbum)
	{
		for (var i = 0; i < this.viewingAlbum.photos.length; i++)
			delete this.viewingAlbum.photos[i].album;
		this.viewingAlbum.photos = [];
		this.photos.viewAlbum(this.viewingAlbum);
	}
	
}

albumclass.prototype.detachPhotos = function()
{
	if (this.viewingAlbum)
	{
		for (var i = 0; i < this.viewingAlbum.photos.length; i++)
			delete this.viewingAlbum.photos[i].album;
		this.viewingAlbum.photos = [];
		this.photos.viewAlbum(null);
	}
	this.photos = null;
}

//Retrieve /api/getalbums.php and update the albums if successful
albumclass.prototype.retrieveAlbums = function(from, to)
{
	if (typeof from != "number")
		from = getVisibleAlbums(this.albums).newest;
	if (albums.length == 0 || albums[0].id == from)
		from = Infinity;
	if (typeof to != "number")
		to = 0;
	showProgress();
	var dis = this;
	dis.more.attr("disabled", "yes");
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getalbums.php?from=" + from + "&to=" + to + "&limit=" + this.options.limit + "&user=" + this.options.profileid,
		success: function(e)
		{
			if (typeof e === "object")
			{
				dis.more.removeAttr("disabled");
				if (e.album.length == dis.options.limit)
				{
					to = e.album[dis.options.limit - 1].id;
					if (dis.albums.length == 0 || dis.albums[dis.albums.length - 1].id > to)
						dis.more.show();
				} else if (to == 0)
					dis.more.hide();
				
				if (e.album.length == 0 && dis.albums.length == 0)
					dis.empty.show();
				else
					dis.empty.hide();
				dis.displayAlbums(e.album, from, to);
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: showConnectionError
	});
}

albumclass.prototype.tick = albumclass.prototype.retrieveAlbums;

albumclass.prototype.displayAlbums = function(newalbums, from, to)
{
	this.updateAlbums(newalbums, from, to);
	sortById(this.albums);
	this.displayNewAlbums();
}

//Remove any albums that are deleted
albumclass.prototype.removeDeletedAlbums = function(newalbums, oldalbums)
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
			if (this.viewingAlbum == oldalbums[i])
				this.viewingAlbum = null;
			this.albums.splice(this.albums.indexOf(oldalbums[i]), 1);
			oldalbums.splice(i--, 1);
		}
	}
}

//Add any new albums
albumclass.prototype.addNewAlbums = function(newalbums, oldalbums)
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
			this.albums.push(newalbums[i]);
	}
}

//Update the list of albums
albumclass.prototype.updateAlbums = function(newalbums, from, to)
{
	var filter = withinId(from, to, this.albums);
	
	this.removeDeletedAlbums(newalbums, filter.relevant);
	this.addNewAlbums(newalbums, filter.relevant);
}

//Display any new albums that have appeared in the albums array but aren't in the DOM yet
albumclass.prototype.displayNewAlbums = function()
{
	for (var i = 0; i < this.albums.length; i++)
	{
		var album = this.albums[i];
		if (!album.info)
		{
			album.photos = [];
			album.selectedPhotos = [];
			var closestAlbum = this.more;
			var closestDistance = Infinity;
			for (var x = 0; x < this.albums.length; x++)
			{
				if (this.albums[x].info)
				{
					var otherid = this.albums[x].id;
					var dist = album.id - otherid;
					if (otherid == album.id)
					{
						continue;
					} else if (Math.abs(dist) < Math.abs(closestDistance))
					{
						closestAlbum = this.albums[x].info;
						closestDistance = dist;
					}
				}
			}
			album.info = createAlbumInfo(album, closestDistance, closestAlbum, this);
			//createAlbumDetails();
		}
	}
}

//Adds the album to the DOM and returns the newly created element
function createAlbumInfo(album, distance, closestElement, albumobject)
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
			error: showConnectionError
		});
	
	var element = $("<div>").css("background-image", "url(/files/" + album.cover + ")").addClass("albuminfocover").append(
		$("<div>").addClass("albumtools").append(
			$("<div>").addClass("albumtool").html("<i class='fa <!--fa-2x--> fa-pencil'></i>").click(
				function() {
					renameAlbum(album, albumobject);
				}
			)
		).append(
			$("<div>").addClass("albumtool").html("<i class='fa <!--fa-2x--> fa-times'></i>").click(
				function() {
					deleteAlbum(album, albumobject);
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
		if (e.target != this || !albumobject.photos || (albumobject.photos.isRetrievingPhotos))
			return;
		if (albumobject.viewingAlbum)
		{
			for (var i = 0; i < albumobject.viewingAlbum.photos.length; i++)
				delete albumobject.viewingAlbum.photos[i].album;
			albumobject.viewingAlbum.photos = [];
			albumobject.viewingAlbum.info.removeAttr("selected");
		}
		album.info.attr("selected", "y");
		albumobject.viewingAlbum = album;
		albumobject.photos.viewAlbum(album);
	});
	
	album.remove = function()
	{
		element.remove();
	};
	
	if (distance < 0)
		closestElement.after(element);
	else
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

var photosbeingdragged = null;

var photosclass = function(options)
{
	this.options = {
		limit: (!options || typeof options.limit !== "number") ? 30 : options.limit,
		max_height: (!options || typeof options.max_height !== "number") ? 3 : options.max_height,
		min_height: (!options || typeof options.min_height !== "number") ? 6 : options.min_height
	};

	this.isRetrievingPhotos = false;
	this.viewingAlbum = null;
	
	this.progress = new ElementUtils.RadialProgressBar();
	this.loading = this.progress.element.hide();
	this.empty = ElementUtils.createEmptyContainer("No album selected");
	this.photosdiv = $("<div>").css("padding", "4px");
	
	var dis = this;

	this.more = $("<div>").addClass("showmore").append(
		$("<div>").addClass("showmoredots").append($("<div>")).append($("<div>")).append($("<div>"))
	).click(function(){
		dis.retrievePhotos(dis.viewingAlbum ? (dis.viewingAlbum.photos.length == 0 ? Infinity : dis.viewingAlbum.photos[dis.viewingAlbum.photos.length - 1].id) : Infinity);
	}).hide();
	
	this.element = $("<div>").addClass("post").append(
		$("<div>").addClass("postdivtitle").html("Photos")
	).append(this.photosdiv).append(this.empty).append(this.loading).append(this.more);
}

photosclass.prototype.viewAlbum = function(album)
{
	this.viewingAlbum = album;
	this.photosdiv.children().detach();
	if (!album || typeof album.id != "number" || !album.photos)
	{
		this.empty.find(".emptyText").html("No album selected");
		this.empty.show();
	} else
	{
		this.retrievePhotos();
	}
	
}

//Retrieve /api/getmedia.php and update the posts if successful
photosclass.prototype.retrievePhotos = function(from, to)
{
	if (this.isRetrievingPhotos)
		return;
	this.isRetrievingPhotos = true;
	
	var album = this.viewingAlbum;
	
	if (!this.viewingAlbum)
	{
		this.empty.find(".emptyText").html("No album selected");
		this.empty.show();
		this.isRetrievingPhotos = false;
		return;
	} else if (album.photos.length == 0)
		this.empty.find(".emptyText").html("No photos");
	this.empty.hide();
	
	if (typeof from != "number")
		from = getVisiblePhotos(album).newest;
	if (album.photos.length == 0 || album.photos[0].id == from)
		from = Infinity;
	if (typeof to != "number")
		to = 0;
	
	this.loading.show();
	var dis = this;
	this.more.attr("disabled", "yes");
	$.ajax(
	{
		cache: false,
		xhr: getXMLHttpRequest(function(p){
			dis.progress.setPercent(p / (Math.min(album.amount, dis.options.limit) + 1))
		}),
		type: "POST",
		url: "/api/getmedia.php?from=" + from + "&to=" + to + "&limit=" + this.options.limit + "&album=" + this.viewingAlbum.id,
		success: function(e)
		{
			if (typeof e === "object")
			{
				dis.more.removeAttr("disabled");
				if (e.media.length == dis.options.limit)
				{
					to = e.media[dis.options.limit - 1].id;
					if (album.photos.length == 0 || album.photos[album.photos.length - 1].id > to)
						dis.more.show();
				} else if (to == 0)
					dis.more.hide();
				if (album.photos.length == 0 && e.media.length == 0)
					dis.empty.show();
				else
					dis.empty.hide();
				dis.displayPhotos(e.media, from, to);
				displayMessages(e.messages);
			} else
			{
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
				dis.isRetrievingPhotos = false;
			}
		},
		error: function(e, t, n)
		{
			showConnectionError(e, t, n);
			dis.isRetrievingPhotos = false;
		}
	});
}

photosclass.prototype.tick = photosclass.prototype.retrievePhotos;

photosclass.prototype.displayPhotos = function(newphotos, from, to)
{
	var min = updatePhotos(this.viewingAlbum, newphotos, from, to) * 0;
	sortById(this.viewingAlbum.photos);
	this.displayNewPhotoDetails(min);
}

//Remove any photos that seem to be deleted
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

//Add any new photos
function addNewPhotos(album, newphotos, oldphotos)
{
	var min = Infinity;
	a: for (var i = 0; i < newphotos.length; i++)
	{
		for (var j = 0; j < oldphotos.length; j++)
		{
			if (newphotos[i].id == oldphotos[j].id)
			{
				/*if (oldphotos[j].element)
					updatePhoto(newphotos[i], oldphotos[j]);*/
				continue a;
			}
		}
		
		album.photos.push(newphotos[i]);
		min = Math.min(min, i);
	}
	return min;
}

//Update the list of photos
function updatePhotos(album, newphotos, from, to)
{
	var filter = withinId(from, to, album.photos);
	return Math.min(removeDeletedPhotos(album, newphotos, filter.relevant), addNewPhotos(album, newphotos, filter.relevant));
}

//Display any new photos that have appeared in the photos array but aren't in the DOM yet
photosclass.prototype.displayNewPhotoDetails = function(min)
{
	var album = this.viewingAlbum;
	a: for (var i = 0; i < album.photos.length; i++)
	{
		var photo = album.photos[i];
		photo.album = album;
		if (!photo.img)
		{
			var previousphoto = this.photosdiv;
			var previousdistance = Infinity;
			for (var x = 0; x < album.photos.length; x++)
			{
				if (!!album.photos[x].img)
				{
					var dist = photo.id - album.photos[x].id;
					if (album.photos[x].id == photo.id)
					{
						console.log("wut?");
						continue a;
					} else if (Math.abs(dist) < Math.abs(previousdistance))
					{
						previousphoto = album.photos[x].img;
						previousdistance = dist;
					}
				}
			}
			photo.img = this.createThumbnail(photo, previousdistance, previousphoto);
		}
	}
	var dis = this;
	if (album.photos.length == 0)
	{
		this.photosdiv.append(this.empty);
		dis.isRetrievingPhotos = false;
		dis.loading.hide();
		dis.progress.setPercent(0);
	} else
	{
		loadPhoto(album, 0, function(){
			createThumbnails(album, min, dis.photosdiv.width(), dis.options.max_height);
			dis.isRetrievingPhotos = false;
			dis.loading.hide();
			dis.progress.setPercent(0);
		}, this.progress, Math.min(album.amount, dis.options.limit) + 1);
	}
}

function loadPhoto(album, id, fin, pbar, estim)
{
	if (id < album.photos.length)
	{
		if (album.photos[id].img.complete)
		{
			pbar.setPercent(1 / estim + ((estim - 1) * (id + 1)) / (estim * album.photos.length));
			loadPhoto(album, id + 1, fin, pbar, estim);
		} else
		{
			var f = function()
			{
				album.photos[id].img.unbind('load', f).unbind('error', f);
				loadPhoto(album, id + 1, fin, pbar, estim);
			};
			pbar.setPercent(1 / estim + ((estim - 1) * (id + 1)) / (estim * album.photos.length));
			album.photos[id].img.on('load', f).on('error', f).attr("src", "/files/" + album.photos[id].id);
		}
	} else
	{
		fin();
	}
}

function createThumbnails(album, min, width, maxheight, minheight)
{
	var cury = 0;
	for (var i = min; i < album.photos.length; )
	{
		var photos = [];
		
		var divisor = 0;
		var h;
		
		//maxheight
		//minheight

		//h = w / (r1' + r2' + ... + rn')
		//w = container width
		//rn' = wn / hn
		//wn = image width
		//hn = image height
		for (; i < album.photos.length; i++)
		{
			photos.push(album.photos[i]);
			
			var wid = album.photos[i].img.get(0).naturalWidth;
			var hei = album.photos[i].img.get(0).naturalHeight;
			
			if (hei == 0 || typeof wid !== "number" || typeof hei !== "number")
			{
				wid = 1;
				hei = 1;
			}
			
			divisor += wid / hei;
			
			h = width / divisor;
			
			if (/*h >= width / minheight && */h <= width / maxheight)
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
			
			if (nh == 0 || typeof nw !== "number" || typeof nh !== "number")
			{
				nw = 1;
				nh = 1;
			}
			
			var newwidth = nw / nh * h - 8;
			
			photos[x].row = photos; //TODO memory leak!!!
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
			error: showConnectionError
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
photosclass.prototype.createThumbnail = function(photo, distance, closestElement)
{
	var dis = this;
	var element = $("<img>").addClass("imagePreview").click(function(e){
		if (photosbeingdragged != null)
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
		if (photosbeingdragged == null && !element.animating)
		{
			if (photo.album.selectedPhotos.indexOf(photo) == -1)
			{
				for (var i = 0; i < photo.album.selectedPhotos.length; i++)
					photo.album.selectedPhotos[i].img.removeAttr("selected");
				photo.album.selectedPhotos = [photo];
				element.attr("selected", "yes");
			}
			for (var i = 0; i < dis.viewingAlbum.selectedPhotos.length; i++)
			{
				var img = dis.viewingAlbum.selectedPhotos[i].img;
				var elp = img.offset();
				
				photosbeingdragged = dis;
				
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
	else
		closestElement.before(element);
	
	return element;
}

$(document).mousemove(function(e)
{
	if (photosbeingdragged != null)
	{
		for (var i = 0; i < photosbeingdragged.viewingAlbum.selectedPhotos.length; i++)
		{
			var img = photosbeingdragged.viewingAlbum.selectedPhotos[i].img;
			if (img.animating)
				return;
			img.offset({left: e.pageX - img.dragOffset.x * img.width(), top: e.pageY - img.dragOffset.y * img.height()});
		}
	}
}).mouseup(function(e)
{
	if (e.which == 1 && photosbeingdragged != null)
	{
		var albumDroppedOn = null
		for (var i = 0; i < albums.length; i++)
		{
			for (var j = 0; j < albums[i].albums.length; j++)
			{
				var of = albums[i].albums[j].info.offset();
				if (e.pageX >= of.left && e.pageX <= of.left + albums[i].albums[j].info.outerWidth() && e.pageY >= of.top && e.pageY <= of.top + albums[i].albums[j].info.outerHeight())
					albumDroppedOn = albums[i].albums[j];
			}
		}
		if (albumDroppedOn != null && albumDroppedOn.id != photosbeingdragged.viewingAlbum.id)
		{
			var imagesToMove = [];
			for (var i = 0; i < photosbeingdragged.viewingAlbum.selectedPhotos.length; i++)
			{
				if (photosbeingdragged.viewingAlbum.selectedPhotos[i].img.animating)
					return;
				imagesToMove[i] = photosbeingdragged.viewingAlbum.selectedPhotos[i].id;
			}
			imagesToMove = imagesToMove.join(',');
			moveImagesTo(albumDroppedOn, imagesToMove, photosbeingdragged);
			for (var i = 0; i < photosbeingdragged.viewingAlbum.selectedPhotos.length; i++)
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
						
						photosbeingdragged = null;
					});
				})(photosbeingdragged.viewingAlbum.selectedPhotos[i].img);
			}
		} else
		{
			for (var i = 0; i < photosbeingdragged.viewingAlbum.selectedPhotos.length; i++)
			{
				if (photosbeingdragged.viewingAlbum.selectedPhotos[i].img.animating)
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
						photosbeingdragged = null;
					});
				})(photosbeingdragged.viewingAlbum.selectedPhotos[i].img);
			}
		}
	}
});

function moveImagesTo(album, images, viewingPhotos)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php",
		data: {
			action: "move",
			to: album.id,
			media: images
		},
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
				setTimeout(function(){
					for (var i = 0; i < albums.length; i++)
					{
						albums[i].retrieveAlbums();
						if (albums[i].viewingAlbum && albums[i].viewingAlbum.id == album.id)
							albums[i].photos.retrievePhotos();
					}
					viewingPhotos.retrievePhotos();
				}, 500);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 60000);
		},
		error: showConnectionError
	});
}

//------------------ALBUM EDITING------------------

function createNewAlbum(albumob)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php",
		data: {
			action: "make",
			name: "New Album",
			longitude: "",
			latitude: ""
		},
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			albumob.retrieveAlbums();
		},
		error: showConnectionError
	});
}

function renameAlbum(album, albumob)
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
								finishRenameAlbum(album, this.value, a, albumob);
							}
						})
					)
				)
			)
		)
	);
	$(".body").append(a);
}

function finishRenameAlbum(album, name, el, albumob)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php",
		data: {
			action: "rename",
			album: album.id,
			newname: name
		},
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			el.remove();
			albumob.retrieveAlbums();
		},
		error: showConnectionError
	});
}

function deleteAlbum(album, albumob)
{
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "POST",
		url: "/api/editalbum.php",
		data: {
			action: "delete",
			album: album.id
		},
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			albumob.retrieveAlbums();
		},
		error: showConnectionError
	});
}

//------------------ALBUM UTILITIES------------------

/*function getOldestAlbum(albums)
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
}*/

function getVisibleAlbums(albums)
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

//------------------PHOTO UTILITIES------------------

function getVisiblePhotos(album)
{
	var oldestphoto = Infinity;
	var newestphoto = 0;
	
	for (var i = 0; i < album.photos.length; i++)
	{
		if (album.photos[i].id < oldestphoto && isScrolledIntoView(album.photos[i].img))
			oldestphoto = album.photos[i].id;
		if (album.photos[i].id > newestphoto && isScrolledIntoView(album.photos[i].img))
			newestphoto = album.photos[i].id;
	}
	
	return {oldest: oldestphoto == Infinity ? 0 : oldestphoto, newest: newestphoto == 0 ? Infinity : newestphoto};
}