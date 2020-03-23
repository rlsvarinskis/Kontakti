var PostsClass = function(options)
{
	this.options = {
		limit: (!options || (typeof options.limit !== 'number')) ? 30 : options.limit,
		from: (!options || (typeof options.from !== 'number')) ? Infinity : options.from,
		to: (!options || (typeof options.to !== 'number')) ? 0 : options.to,
		user: (!options || (typeof options.user !== 'number')) ? "NaN" : options.user,
		parent: (!options || (typeof options.parent !== 'number')) ? 0 : options.parent
	}
	
	var more = $("<div>").addClass("innerposttext").append($("<div>").addClass("radialloader").append(
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
	));
	
	var empty = ElementUtils.createEmptyContainer("There aren't any posts").hide();
	var status = $("<article>").addClass("post").append(empty).append(more);
	this.element = $("<div>").append(status);
	
	var dis = this;
	
	//TODO these inline functions can cause memory leaks
	this.posts = new DynamicElementList(this.element, function(){
		empty.show();
		more.hide();
	}, function(){
		more.show();
		empty.hide();
		empty.find(".emptyText").html("No more posts");
	}, function(el){
		dis.element.prepend(el);
	}, PostsUtilFunctions.isEqual, PostsUtilFunctions.distance, PostsUtilFunctions.postsWithinTime, function(a){
		return new PostClass(a, dis.retrievePosts);
	}, PostsUtilFunctions.show, PostsUtilFunctions.showQuick, PostsUtilFunctions.remove, function(a, b){
		b.update(a);
	});
	
	this.isRetrieving = false;
	
	onScrollIntoView(more, function(){dis.retrievePosts(dis.posts.list.length > 0 ? dis.posts.list[dis.posts.list.length - 1] : Infinity, 0);});
	
	this.deleteThis = function()
	{
		removeIntoView(more);
		
		this.posts.deleteThis();
		
		more.remove();
		empty.remove();
		status.remove();
		this.element.remove();
		
		for (var name in this.options)
			delete this.options[name];
		
		for (var name in this)
			delete this[name];
	}
}

//Retrieve /api/getposts.php and update the posts if successful
PostsClass.prototype.retrievePosts = function(from, to)
{
	if (this.isRetrieving)
		return;
	
	this.isRetrieving = true;
	
	var dis = this;
	
	console.log(this);
	
	if (typeof from != "number")
		from = this.getVisiblePosts().newest; //TODO should it really be updating the scrolled-into view instead of the top?
	if (this.posts.list.length == 0 || this.posts.list[0].time == from)
		from = Infinity;
	
	if (typeof to != "number")
		to = 0;
	
	from = Math.min(from, this.options.from);
	to = Math.max(to, this.options.to);
	
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR, //TODO Make this update the loading bar instead
		type: "GET",
		url: "/api/getposts.php?from=" + from + "&to=" + to + "&limit=" + this.options.limit + "&pid=" + this.options.parent + "&user=" + this.options.user,
		success: function(e)
		{
			if (typeof e === "object")
			{
				dis.posts.retrieved(from, to, e.post, dis.options.limit, "time");
				displayMessages(e.messages);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
			dis.isRetrieving = false;
		},
		error: function(a, b, c)
		{
			showConnectionError(a, b, c);
			dis.isRetrieving = false;
		}
	});
}

PostsClass.prototype.tick = PostsClass.prototype.retrievePosts;

PostsClass.prototype.getVisiblePosts = function()
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

var PostsUtilFunctions = {
	isEqual: function(post1, post2) { return post1.id == post2.id; },
	distance: function(post1, post2) { if (post2.time == post1.time) return post2.id > post1.id ? 0.5 : -0.5; return post2.time - post1.time; },
	show: function(post) { post.element.fadeIn(); },
	showQuick: function(post) { post.element.show(); },
	remove: function(post) { post.deleteThis(); },
	
	postsWithinTime: function(from, to, posts)
	{
		var relevantPosts = [];
		var filteredPosts = [];
		for (var i = 0; i < posts.length; i++)
		{
			var post = posts[i];
			if (post.time > from || post.time < to)
				filteredPosts.push(post);
			else
				relevantPosts.push(post);
		}
		return {relevant: relevantPosts, removed: filteredPosts};
	}
}


var PostClass = function(dataobject, parentUpdate)
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

PostClass.prototype.deleteThis = function()
{
	var self = this;
	
	this.element.animate(
	{
		margin: "0",
		padding: "0",
		height: "0",
		opacity: "0"
	}, 750, function()
	{
		self.commentManager.deleteThis();
		self.element.remove();
		
		for (var name in self)
			delete self[name];
	});
}

PostClass.prototype.create = function(parentUpdate)
{
	var self = this;
	
	this.commentManager = new CommentsClass(function(){parentUpdate()}, this.id, {});
	this.commentSection = $("<div>").addClass("commentcontainer").append(this.commentManager.element).hide();
	
	this.nameelement = $("<a>").addClass("username").attr("href", "/profile/" + this.username + "/").click(function(){return pg(this)}).html(this.name);
	this.timeelement = $("<span>").addClass("postdate").html(toLocalTime(new Date(this.time * 1000)));
	this.textelement = $("<span>").addClass("postbody").html(workPostText(this.text));
	this.likeelement = $("<span>").addClass("likenum").html(this.likes);
	this.likebutton  = $("<a>").addClass("likebutton").click( function(){ like(self); } ).html(this.liked ? "Unlike" : "Like");
	this.commentamt  = $("<span>").addClass("comnum").html(this.comments);
	this.editamount  = $("<span>").addClass("editnum").html(this.edits);
	this.editdisplay = $("<span>").addClass("editdisplay").append("&nbsp;&#8226;&nbsp;").append($("<a>").addClass("edithist").click(function(){}).html("Edits")).append(" (").append(this.editamount).append(")").hide();
	this.geoaddress  = $("<span>").addClass("geoaddress");
	
	this.arrows = $("<div>").addClass("arrows").attr("opened", "no").append(
		$("<div>").addClass("pointer").click(function(){postTools(self)}).append(
			$("<div>").addClass("arrowwhite")
		).append(
			$("<div>").addClass("arrowfill")
		)
	).append(
		$("<div>").addClass("posttoolscont").append(
			$("<div>").addClass("posttools").append(
				PostClass.createPostTools(this)
			)
		)
	);
	
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
	).append(
		")&nbsp;&#8226;&nbsp;"
	).append(
		$("<a>").addClass("share").click(function(){}).html("Share")
	).append(
		" ("
	).append(
		$("<span>").addClass("sharenum").html(this.shares)
	).append(
		")"
	).append(
		this.editdisplay
	);
	
	if (this.geolocation)
	{
		console.log(this.geolocation);
		formatAddress(this.geolocation, function(formattedaddress)
		{
			console.log("Success! " + formattedaddress);
			self.geoaddress.html("&nbsp;&#8226;&nbsp;" + "Near " + formattedaddress);
		});
	}
	
	var element = $("<article>").addClass("post").hide().append(
		$("<div>").addClass("innerposttext").append(
			$("<div>").addClass("image").append(
				$("<a>").attr("href", "/profile/" + this.username + "/").click(function(){return pg(this)}).append(
					$("<img>").attr("width", "40px").attr("height", "40px").attr("src", "/profilemedia/avatar" + this.uid + "/").attr("alt", this.name)
				)
			)
		).append(
			$("<div>").addClass("posttext").append(
				$("<div>").addClass("posthead").append(
					this.arrows
				).append(
					this.nameelement
				).append(
					$("<br>")
				).append(
					$("<a>").addClass("postlink").attr("href", "/post/" + this.id + "/").append(
						this.timeelement
					).append(
						this.geoaddress
					)
				)
			).append(
				this.textelement
			).append(
				getPostMedia(this.media)
			).append(
				this.postactions
			)
		)
	).append(this.commentSection);
	
	if (this.edits > 0)
		this.editdisplay.show();
	
	return element;
}

PostClass.prototype.update = function(newdata)
{
	if (this.name != newdata.name)
		this.nameelement.get(0).innerHTML = (this.name = newdata.name);
	if (this.time != newdata.time)
		this.timeelement.get(0).innerHTML = (toLocalTime(new Date((this.time = newdata.time) * 1000)));
	if (this.text != newdata.text)
		this.textelement.get(0).innerHTML = (workPostText(this.text = newdata.text));
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

//--------------------------------------------------------------------------------------------------------
//---------------------------------------------UTIL FUNCTIONS---------------------------------------------
//--------------------------------------------------------------------------------------------------------

PostClass.createPostTools = function(post)
{
	var pt = $("<div>").addClass("posttoolsinner");
	if (post.uid == userdata.id)
		pt.append(
			$("<li>").append(
				$("<a>").click(function(){editPost(post)}).append("Edit")
			)
		).append(
			$("<li>").append(
				$("<a>").click(function(){deletePost(post, null)}).append("Delete")
			)
		);
	else
		pt.append(
			$("<li>").append(
				$("<a>").click(function(){repPost(post.id)}).append("Report")
			)
		);
	
	return pt;
}

//Edit a post
function editPost(post) //TODO
{
	post.arrows.attr("opened", "no");
	
	post.editdata = {
		submitedit: $("<button>").addClass("button").click( function(){ submitEdit(post); } ).html("Confirm edit"),
		canceledit: $("<button>").addClass("button").click( function(){ cancelEdit(post); } ).html("Cancel edit"),
		editactions: $("<div>").addClass("newpostbottom").append(post.editdata.canceledit).append(post.editdata.submitedit),
		textarea: $("<textarea>").addClass("newpost").attr("placeholder", "Edit your post").css("border", "1px solid #4D90FE").val(post.text),
		textareaparent: $("<span>").addClass("postbody").append(post.editdata.textarea),
		images: $("<div>").css("display", "none")
	};
	
	post.editdata.images.images = [];
	
	post.postactions.hide();
	post.arrows.hide();
	post.commentSection.hide();
	post.textelement.hide();
	
	post.textelement.after(post.editdata.textareaparent).after(post.editdata.editactions);
}