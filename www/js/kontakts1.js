var kontakts = function(options)
{
	this.options = {
		limit: (!options || typeof options.limit !== "number") ? 30 : options.limit
	}
	
	this.kontakts = []; //The list of all kontakts
	this.kontaktrequests = []; //Kontakt requests
	this.userkontaktrequests = []; //The user's kontakt requests
	
	this.allkontakts = [];
	
	kontakts_createArrayElement(this.kontakts, "Kontakts");
	kontakts_createArrayElement(this.kontaktrequests, "Kontakt requests");
	kontakts_createArrayElement(this.userkontaktrequests, "Your sent requests");
	
	this.kontaktrequests.element.hide();
	this.userkontaktrequests.element.hide();

	var emptyKontakt = kontakts_createEmptyKontakt();
	this.kontakts.element.append(emptyKontakt);

	this.kontakts.hidediv = function(callback)
	{
		$(this.element.children()[0]).after(emptyKontakt.hide().css("padding", "0 5px"));
		emptyKontakt.animate({
			height: "show",
			padding: "5px"
		}, 500, "swing", callback);
	}
	
	this.hideEmpty = function()
	{
		emptyKontakt.animate({
			height: "hide",
			padding: "0 5px"
		}, 500, "swing", emptyKontakt.detach);
	}
	this.detachEmpty = function()
	{
		emptyKontakt.detach();
	}
	
	kontakts_createHideDivFunction(this.kontaktrequests);
	kontakts_createHideDivFunction(this.userkontaktrequests);
	
	var retrievingKontakts = false;
	
	this.isRetrievingKontakts = function()
	{
		return retrievingKontakts;
	}
	
	this.startedRetrievingKontakts = function()
	{
		retrievingKontakts = true;
	}
	
	this.finishedRetrievingKontakts = function()
	{
		retrievingKontakts = false;
	}
}

kontakts.prototype.retrieveKontakts = function()
{
	if (this.isRetrievingKontakts())
		return;
	this.startedRetrievingKontakts();
	
	var dis = this;
	
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getkontakts.php?from=" + 0/*kontaktamount*/ + "&limit=" + this.options.limit,
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
				dis.displayKontakts(e.kontakt);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: showConnectionError
	});
}

kontakts.prototype.tick = kontakts.prototype.retrieveKontakts;

kontakts.prototype.displayKontakts = function(newkontakts)
{
	this.updateKontakts(newkontakts);
	sortKontakts(this.kontakts, this.kontaktrequests, this.userkontaktrequests);
	this.displayNewKontakts(this.kontakts);
	this.displayNewKontakts(this.kontaktrequests);
	this.displayNewKontakts(this.userkontaktrequests);
	this.finishedRetrievingKontakts();
}

//Update the kontakts list to include the new kontakts
kontakts.prototype.updateKontakts = function(newkontakts)
{
	//kontaktamount += newkontakts.length;
	var dis = this;
	for (var i = 0; i < newkontakts.length; i++)
	{
		var exists = false;
		for (var j = 0; j < this.allkontakts.length; j++)
		{
			if (this.allkontakts[j].id == newkontakts[i].id)
			{
				exists = true;
				if (this.allkontakts[j].theirtype == 0 && this.allkontakts[i].yourtype == 0)
				{
					if (newkontakts[i].theirtype != 0 && newkontakts[i].yourtype != 0)
					{
						this.allkontakts[j].theirtype = newkontakts[i].theirtype
						this.allkontakts[j].yourtype = newkontakts[i].yourtype
						addKontaktAnimation(this.allkontakts[j]); //TODO this?
					}
				}
				break;
			}
		}
		if (!exists)
		{
			if (newkontakts[i].theirtype == 0)
			{
				this.userkontaktrequests.push(newkontakts[i]);
				newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					reskontakt(this.kontakt.id, e.parent);
				}).html("Resend request");
				newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					canckontakt(this.kontakt, e.parent, dis.allkontakts);
				}).html("Cancel request");
			} else if (newkontakts[i].yourtype == 0)
			{
				this.kontaktrequests.push(newkontakts[i]);
				newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					confkontakt(this.kontakt, e.parent, dis, dis.kontakts);
					if (dis.kontakts.length == 1)
						dis.hideEmpty();
				}).html("Accept request");
				newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					canckontakt(this.kontakt, e.parent, dis.allkontakts);
				}).html("Deny request");
			} else
			{
				this.kontakts.push(newkontakts[i]);
				newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					changekontakt(this.kontakt, e.parent, 1);
				}).html("Change type");
				newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					canckontakt(this.kontakt, e.parent, dis.allkontakts);
				}).html("Remove kontakt");
			}
			newkontakts[i].b1.get(0).kontakt = newkontakts[i];
			newkontakts[i].b2.get(0).kontakt = newkontakts[i];
			this.allkontakts.push(newkontakts[i]);
		}
	}
}

//Sort all the kontakts by their time
function sortKontakts(a1, a2, a3)
{
	a1.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
	a2.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
	a3.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
}

//Display any new kontakts that aren't in the DOM yet
kontakts.prototype.displayNewKontakts = function(thelist)
{
	for (var i = 0; i < thelist.length; i++)
	{
		var kontakt = thelist[i];
		kontakt.list = thelist;
		if (!kontakt.element)
		{
			var previouskontakt = null;
			var previousdistance = Infinity;
			for (var x = 0; x < thelist.length; x++)
			{
				if (!!thelist[x].element)
				{
					var dist = kontakt.time - thelist[x].time;
					if (thelist[x].time == kontakt.id);
					else if (Math.abs(dist) < Math.abs(previousdistance))
					{
						previouskontakt = thelist[x].element;
						previousdistance = dist;
					}
				}
			}
			if (state == "kontakts")
				kontakt.element = this.addKontakt(kontakt, previousdistance, previouskontakt);
		}
	}
}

//Adds the kontakt to the DOM and returns the newly created element
kontakts.prototype.addKontakt = function(kontakt, distance, closestElement)
{
	var element = $("<div>").addClass("subpost").hide().append(
		$("<a>").addClass("mediumimage").attr("href", "/profile/" + kontakt.url + "/").click(function(){return pg(this)}).append(
			$("<img>").attr("width", "80px").attr("height", "80px").attr("src", "/profilemedia/avatar" + kontakt.id + "/").attr("title", kontakt.name).attr("alt", kontakt.name)
		)
	).append(
		$("<div>").addClass("kontaktdescription").append(
			$("<div>").append(
				$("<a>").addClass("username").attr("href", "/profile/" + kontakt.url + "/").click(function(){return pg(this)}).html(kontakt.name)
			).append($("<br>")).append(kontakt.b1).append($("<br>")).append(kontakt.b2)
		)
	);
	
	if (distance == Infinity)
	{
		if (this.kontakts.length > 0)
			this.detachEmpty();
		element.css("padding", "0 5px");
		kontakt.list.element.append(element);
		kontakt.list.element.show();
		element.animate({height: "show", padding: "5"}, 500); //TODO
		//kontakt.list.element.animate({height: "show", margin: "0 0 15px 0"}, 500);
	} else
	{
		element.css("padding", "0 5px");
		if (distance < 0)
			closestElement.after(element);
		else
			closestElement.before(element);
		element.animate({height: "show", padding: "5"}, 500);
	}
	
	element.kontakt = kontakt;
	
	return element;
}

//kontakts.utils = {
	function reskontakt(user, elem)
	{
		console.log(user);
		$(elem).prop("disabled", true);
		$.ajax({
			url: "/api/kontakt.php?newid=1&user=" + user,
			success: function(obj, status, smth)
			{
				if (obj.messages)
					displayMessages(obj.messages);
				$(elem).prop("disabled", false);
			},
			error: showConnectionError
		});
	}

	function canckontakt(user, elem, allkont)
	{
		console.log(user);
		$(elem).prop("disabled", true);
		$.ajax({
			url: "/api/kontakt.php?newid=-1&user=" + user.id,
			success: function(obj, status, smth)
			{
				if (obj.messages)
					displayMessages(obj.messages);
				removeKontaktAnimation(user, allkont);
			},
			error: showConnectionError
		});
	}

	function changekontakt(user, elem, n)
	{
		console.log(user);
		$(elem).prop("disabled", true);
		$.ajax({
			url: "/api/kontakt.php?newid=" + n + "&user=" + user.id,
			success: function(obj, status, smth)
			{
				if (obj.messages)
					displayMessages(obj.messages);
				$(elem).prop("disabled", false);
			},
			error: showConnectionError
		});
	}

	function confkontakt(user, elem, k, newlist)
	{
		console.log(user);
		$(elem).prop("disabled", true);
		$.ajax({
			url: "/api/kontakt.php?newid=1&user=" + user.id,
			success: function(obj, status, smth)
			{
				if (obj.messages)
				{
					console.log("CALLEd");
					displayMessages(obj.messages);
				}
				console.log(obj.messages);
				addKontaktAnimation(user, k, newlist);
			},
			error: showConnectionError
		});
	}

	function removeKontaktAnimation(user, allkontakts)
	{
		user.list.splice(user.list.indexOf(user), 1);
		allkontakts.splice(allkontakts.indexOf(user), 1);
		if (user.list.length == 0)
			user.list.hidediv();
		user.element.animate({
			height: "hide",
			padding: "0 5px"
		}, 500, "swing", function(){
			user.element.remove();
			user.element = null;
		});
	}

	function addKontaktAnimation(user, k, newlist)
	{
		k.startedRetrievingKontakts();
		
		var list = user.list;
		
		list.splice(list.indexOf(user), 1)
		newlist.splice(0, 0, user);
		
		var height = user.element.height() + 10;
		var height2 = list.element.height() + 15;
		
		var fake = $("<div>").addClass("subpost").css("height", user.element.height() + "px").css("background", "#ccc");
		var fake2 = $("<div>").addClass("subpost").css("padding", "0").css("height", user.element.height() + "px").css("background", "#ccc");
		
		user.element.before(fake);
		$(newlist.element.children()[0]).after(fake2);
		user.element.detach();
		
		var pos = fake.offset();
		var pos2 = fake2.offset();
		
		fake2.hide();
		
		$("#wall").append(user.element);
		user.element.css("position", "absolute");
		user.element.css("top", pos.top);
		user.element.css("left", pos.left);
		user.element.css("width", fake.width());
		user.element.attr("lifted", "yes");
		
		user.b1.animate({opacity: "0"}, 500);
		user.b2.animate({opacity: "0"}, 500);
		
		setTimeout(function(){
			user.b1.unbind("click").click(function(e) {
				changekontakt(this.kontakt, e.parent, 1);
			}).html("Change type");
			user.b2.unbind("click").click(function(e) {
				canckontakt(this.kontakt, e.parent);
			}).html("Remove kontakt");
			
			if (list.length == 0)
			{
				height = height2;
				list.hidediv();
			} else
				fake.animate({
					height: "hide",
					padding: "0 5px"
				}, 500);
			
			fake2.animate({
				height: "show",
				padding: "5"
			}, 500);
			
			user.element.animate({
				top: "+=" + (pos2.top - pos.top - height)
			}, 500, "swing", function(){
				user.b1.animate({opacity: "1"}, 500);
				user.b2.animate({opacity: "1"}, 500);
				fake.remove();
				fake2.css("background", "");
				user.element.removeAttr("lifted");
				setTimeout(function(){
					fake2.after(user.element.detach());
					fake2.remove();
					user.element.removeAttr("style");
					user.list = newlist;
					k.finishedRetrievingKontakts();
				}, 500);
			});
		}, 500);
	}


	/*UTILITY FUNCTIONS*/

	function kontakts_createArrayElement(ar, title)
	{
		ar.element = $("<div>").addClass("post").append($("<div>").addClass("postdivtitle").html(title))
	}

	function kontakts_createHideDivFunction(ar)
	{
		ar.hidediv = function(callback)
		{
			this.element.animate({
				height: "hide",
				margin: "0"
			}, 500, "swing", callback);
		}
	}

	function kontakts_createEmptyKontakt()
	{
		return $("<div>").addClass("subpost").append(
			$("<div>").addClass("mediumimage").append(
				$("<a>").append(
					$("<img>").attr("width", "80px").attr("height", "80px").attr("src", "/images/computer.png").attr("title", "Your computer").attr("alt", "Your computer")
				)
			)
		).append(
			$("<div>").addClass("kontaktdescription").append(
				$("<div>").append(
					$("<a>").addClass("username").html("Your computer...<img style='float:right;' src='http://i.imgur.com/VQLGJOL.gif' height='50px' /><span style='float:right;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PSYCH!</span>")
				).append($("<br>")).append(
					$("<button>").addClass("button").css("width", "150px").css("margin-top", "8px").html("Change type").prop("disabled", true)
				).append($("<br>")).append(
					$("<button>").addClass("button").css("width", "150px").html("Remove kontakt").prop("disabled", true)
				)
			)
		);
	}
//}