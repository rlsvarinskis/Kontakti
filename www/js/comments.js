var CommentsClass = function(parentUpdate, postid, options)
{
	var self = this;
	
	this.options = {
		limit: (!options || (typeof options.limit !== 'number')) ? 30 : options.limit,
		user: (!options || (typeof options.user !== 'number')) ? "NaN" : options.user
	}
	
	this.parentID = postid;
	this.parentUpdate = parentUpdate;
	
	this.isRetrieving = false;
	
	this.images = $("<div>");
	this.imagearray = [];
	
	this.textinput = $("<input>").addClass("input").attr("type", "text").attr("placeholder", "Write your comment! :O").on('paste', function(e)
	{
		pasteHandler(e, self); //TODO
	}).keydown(function(e)
	{
		if (e.keyCode == 13)
			submitComment(self); //TODO
	});
	this.internalcontainer = $("<div>").addClass("commentlvl").append(
		$("<div>").addClass("comment").css("min-height", "30px").append(
			$("<img>").css("float", "left").attr("width", "30").attr("height", "30").attr("src", "/profilemedia/avatar/").attr("alt", "//TODO insert alt text here (sry m8s)")
		).append(
			$("<div>").addClass("ctext").append(
				this.textinput
			).append(this.images)
		)
	);
	
	this.element = $("<div>").addClass("comments").append(this.internalcontainer);
	
	var more = ElementUtils.createMoreButton().click(function(){
		self.retrieveComments(self.posts.list.length > 0 ? self.posts.list[self.posts.list.length - 1] : Infinity, 0);
	}).hide();
	this.internalcontainer.append(more);
	
	this.posts = new DynamicElementList(this.internalcontainer, function(){
		more.hide();
	}, function(){
		more.show();
	}, function(el){
		more.before(el);
	}, PostsUtilFunctions.isEqual, PostsUtilFunctions.distance, PostsUtilFunctions.postsWithinTime, function (com){
		return new CommentClass(com, self.retrieveComments);
	}, PostsUtilFunctions.show, PostsUtilFunctions.showQuick, PostsUtilFunctions.remove, function(a, b){
		b.update(a);
	});
	
	this.deleteThis = function()
	{
		this.posts.deleteThis();
		
		this.textinput.remove();
		this.images.remove();
		more.remove();
		this.internalcontainer.remove();
		this.element.remove();
		this.imagearray = [];
		
		for (var name in this.options)
			delete this.options[name];
		
		for (var name in this)
			delete this[name];
	}
}

//Retrieve /api/getposts.php and update the comments if successful
CommentsClass.prototype.retrieveComments = function(from, to)
{
	if (this.isRetrieving)
		return;
	
	this.isRetrieving = true;
	
	var dis = this;
	
	if (typeof from != "number")
		from = this.getVisiblePosts().newest; //TODO should it really be updating the scrolled-into view instead of the top?
	if (this.posts.list.length == 0 || this.posts.list[0].time == from)
		from = Infinity;
	
	if (typeof to != "number")
		to = 0;
	
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getposts.php?from=" + from + "&to=" + to + "&limit=" + this.options.limit + "&pid=" + this.parentID + "&user=" + this.options.user,
		success: function(res)
		{
			if (typeof res === "object")
			{
				dis.posts.retrieved(from, to, res.post, dis.options.limit, "time");
				displayMessages(res.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + res, 5000);
			dis.isRetrieving = false;
		},
		error: showConnectionError
	});
}

CommentsClass.prototype.tick = CommentsClass.prototype.retrieveComments;

CommentsClass.prototype.getVisiblePosts = function()
{
	var oldestpost = Infinity;
	var newestpost = 0;
	
	for (var i = 0; i < this.posts.list.length; i++)
	{
		if (this.posts.list[i].time < oldestpost && isScrolledIntoView(this.posts.list[i].element))
			oldestpost = this.posts.list[i].time;
		if (this.posts.list[i].time > newestpost && isScrolledIntoView(this.posts.list[i].element))
			newestpost = this.posts.list[i].time;
	}
	
	return {oldest: oldestpost == Infinity ? 0 : oldestpost, newest: newestpost == 0 ? Infinity : newestpost};
}


var CommentClass = function(dataobject, parentUpdate)
{
	this.id = dataobject.id;
	this.name = dataobject.name;
	this.username = dataobject.username; //TODO: use?
	this.uid = dataobject.uid; //TODO: update
	this.text = dataobject.text;
	this.liked = dataobject.liked;
	this.likes = dataobject.likes;
	this.comments = dataobject.comments;
	this.media = dataobject.media; //TODO: update
	this.edits = dataobject.edits;
	this.shares = dataobject.shares; //TODO: update
	this.time = dataobject.time;
	if (typeof dataobject.geolocation !== "undefined")
		this.geolocation = dataobject.geolocation; //TODO: update
	
	this.element = this.create(parentUpdate);
}

CommentClass.prototype.deleteThis = function()
{
	var self = this;
	
	this.element.animate(
	{
		height: "0",
		padding: "0",
		opacity: "0",
		minHeight: "0"
	}, 750, function()
	{
		self.commentManager.deleteThis();
		self.element.remove();
		
		for (var name in self)
			delete self[name];
	});
}

CommentClass.prototype.create = function(parentUpdate)
{
	var self = this;
	
	this.commentManager = new CommentsClass(function(){parentUpdate()}, this.id, {});
	this.commentSection = this.commentManager.element.hide();
	
	this.nameelement = $("<a>").addClass("username").attr("href", "/profile/" + this.username + "/").click(function(){return pg(this)}).html(this.name);
	this.timeelement = $("<span>").addClass("postdate").html(toLocalTime(new Date(this.time * 1000)));
	this.textelement = $("<span>").addClass("postbody").html(workPostText(this.text));
	this.likeelement = $("<span>").addClass("likenum").html(this.likes);
	this.likebutton  = $("<a>").addClass("likebutton").click( function(){ like(self); } ).html(this.liked ? "Unlike" : "Like");
	this.commentamt  = $("<span>").addClass("comnum").html(this.comments);
	this.editamount  = $("<span>").addClass("editnum").html(this.edits);
	this.editdisplay = $("<span>").addClass("editdisplay").append("&nbsp;&#8226;&nbsp;").append($("<a>").addClass("edithist").click(function(){}).html("Edits")).append(" (").append(this.editamount).append(")").hide();
	this.geoaddress  = $("<span>").addClass("geoaddress");
	
	this.postactions = $("<div>").addClass("postac").append(
		this.likebutton
	).append(
		" ("
	).append(
		this.likeelement
	).append(
		")&nbsp;&#8226;&nbsp;"
	).append(
		$("<a>").addClass("reply").click(function()
		{
			if (!self.commentSection.is(":visible")) //Open comment section
				self.commentManager.retrieveComments();
			self.commentSection.toggle();
		}).html("Reply")
	).append(
		" ("
	).append(
		this.commentamt
	)/*.append(
		$("<a>").addClass("share").click(function(){}).html("Share")
	).append(
		" ("
	).append(
		$("<span>").addClass("sharenum").html(this.shares)
	).append(
		")"
	)*/.append(
		this.editdisplay
	).append(
		")&nbsp;&#8226;&nbsp;"
	);
	if (this.uid == userdata.id)
		this.postactions.append(
			$("<a>").click(function(e)
			{
				deletePost(self, function(){parentUpdate();});
			}).append("Delete")
		).append("&nbsp;&#8226;&nbsp;");
	this.postactions.append(
		this.timeelement
	).append(
		this.geoaddress
	);
	
	if (this.geolocation)
	{
		formatAddress(this.geolocation, function(formattedaddress)
		{
			self.geoaddress.html("&nbsp;&#8226;&nbsp;" + "Near " + formattedaddress);
		});
	}
	
	var element = $("<div>").addClass("comment").append(
		$("<img>").css("float", "left").attr("width", "30").attr("height", "30").attr("src", "/profilemedia/avatar" + this.uid + "/").attr("alt", "//TODO insert alt text here (sry m8s)")
	).append(
		$("<div>").addClass("ctitle").append(this.name)
	).append(
		$("<div>").addClass("ctext").append(this.text)
	).append(
		this.postactions
	).append(
		this.commentSection
	);
	
	if (this.edits > 0)
		this.editdisplay.show();
	
	return element;
}

CommentClass.prototype.update = function(newdata)
{
	if (this.name != newdata.name)
		this.nameelement.get(0).innerHTML = (this.name = newdata.name);
	if (this.time != newdata.time)
		this.timeelement.get(0).innerHTML = (toLocalTime(new Date((this.time = newdata.time) * 1000)));
	if (this.text != newdata.text)
		this.textelement.get(0).innerHTML = (/*workPostText*/(this.text = newdata.text));
	if (this.likes != newdata.likes)
		this.likeelement.get(0).innerHTML = (this.likes = newdata.likes);
	if (this.liked != newdata.liked)
		this.likebutton .get(0).innerHTML = ((this.liked = newdata.liked) ? "Unlike" : "Like");
	if (this.comments != newdata.comments)
		this.commentamt .get(0).innerHTML = (this.comments = newdata.comments);
	if (this.edits != newdata.edits)
	{
		this.editamount .get(0).innerHTML = (this.edits = newdata.edits);
		this.editdisplay.show();
	}
}