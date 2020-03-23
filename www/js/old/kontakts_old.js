var kontakt = function()
{
	this.kontakts = []; //The list of all kontakts
	this.kontaktrequests = []; //Kontakt requests
	this.userkontaktrequests = []; //The user's kontakt requests
	
	this.allkontakts = [];

	this.kontakts.element = $("<div>").addClass("post").append($("<div>").addClass("postdivtitle").html("Kontakts"));
	this.kontaktrequests.element = $("<div>").addClass("post").append($("<div>").addClass("postdivtitle").html("Kontakt requests")).hide();
	this.userkontaktrequests.element = $("<div>").addClass("post").append($("<div>").addClass("postdivtitle").html("Your sent requests")).hide();

	this.kontakts.hidediv = function(callback)
	{
		$(this.element.children()[0]).after(emptyKontakt.hide().css("padding", "0 5px"));
		emptyKontakt.animate({height: "show", padding: "5px"}, 500);
		if (callback)
			callback();
	}
	this.kontaktrequests.hidediv = function(callback)
	{
		this.element.animate({
			height: "hide",
			margin: "0"
		}, 500, "swing", callback);
	}
	this.userkontaktrequests.hidediv = function(callback)
	{
		this.element.animate({
			height: "hide",
			margin: "0"
		}, 500, "swing", callback);
	}

	var emptyKontakt = $("<div>").addClass("subpost").append(
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

	this.kontakts.element.append(emptyKontakt);
}

var kontaktlimit = 30;
var kontaktamount = 0;

var retrievingKontakts = false;

//Retrieve /api/getkontakts.php and update the kontakts
function retrieveKontakts()
{
	if (retrievingKontakts)
		return;
	retrievingKontakts = true;
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/api/getkontakts.php?from=" + 0/*kontaktamount*/ + "&limit=" + kontaktlimit,
		success: function(e)
		{
			if (typeof e === "object")
			{
				displayMessages(e.messages);
				displayKontakts(e.kontakt);
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: function(e, t, n)
		{
			alertError("Connection error", "Unable to connect to server", 5000);
		}
	});
}

function displayKontakts(newkontakts)
{
	updateKontakts(newkontakts);
	sortKontakts();
	displayNewKontakts(kontakts);
	displayNewKontakts(kontaktrequests);
	displayNewKontakts(userkontaktrequests);
	retrievingKontakts = false;
}

//Update the kontakts list to include the new kontakts
function updateKontakts(newkontakts)
{
	kontaktamount += newkontakts.length;
	for (var i = 0; i < newkontakts.length; i++)
	{
		var exists = false;
		for (var j = 0; j < allkontakts.length; j++)
		{
			if (allkontakts[j].id == newkontakts[i].id)
			{
				exists = true;
				if (allkontakts[j].theirtype == 0 && allkontakts[i].yourtype == 0)
				{
					if (newkontakts[i].theirtype != 0 && newkontakts[i].yourtype != 0)
					{
						allkontakts[j].theirtype = newkontakts[i].theirtype
						allkontakts[j].yourtype = newkontakts[i].yourtype
						addKontaktAnimation(allkontakts[j]);
					}
				}
				break;
			}
		}
		if (!exists)
		{
			if (newkontakts[i].theirtype == 0 && newkontakts[i].yourtype == 0)
			{
				if (newkontakts[i].you)
				{
					userkontaktrequests.push(newkontakts[i]);
					newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
						reskontakt(this.kontakt, e.parent);
					}).html("Resend request");
					newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
						canckontakt(this.kontakt, e.parent);
					}).html("Cancel request");
				} else
				{
					kontaktrequests.push(newkontakts[i]);
					newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
						confkontakt(this.kontakt, e.parent);
					}).html("Accept request");
					newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
						canckontakt(this.kontakt, e.parent);
					}).html("Deny request");
				}
			} else
			{
				kontakts.push(newkontakts[i]);
				newkontakts[i].b1 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					changekontakt(this.kontakt, e.parent, 1);
				}).html("Change type");
				newkontakts[i].b2 = $("<button>").addClass("button").css("width", "150px").click(function(e) {
					canckontakt(this.kontakt, e.parent);
				}).html("Remove kontakt");
			}
			newkontakts[i].b1.get(0).kontakt = newkontakts[i];
			newkontakts[i].b2.get(0).kontakt = newkontakts[i];
			allkontakts.push(newkontakts[i]);
		}
	}
}

//Sort all the kontakts by their time
function sortKontakts()
{
	kontakts.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
	kontaktrequests.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
	userkontaktrequests.sort(function(a, b)
	{
		var n = new Date(a.time * 1e3),
			r = new Date(b.time * 1e3);
		if (n < r) return -1;
		if (n > r) return 1;
		return 0;
	});
}

//Display any new kontakts that aren't in the DOM yet
function displayNewKontakts(thelist)
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
				kontakt.element = addKontakt(kontakt, previousdistance, previouskontakt);
		}
	}
}

//Adds the kontakt to the DOM and returns the newly created element
function addKontakt(kontakt, distance, closestElement)
{
	var element = $("<div>").addClass("subpost").hide().append(
		$("<a>").addClass("mediumimage").attr("href", "/profile/" + kontakt.url + "/").append(
			$("<img>").attr("width", "80px").attr("height", "80px").attr("src", "/profilemedia/avatar" + kontakt.id + "/").attr("title", kontakt.name).attr("alt", kontakt.name)
		)
	).append(
		$("<div>").addClass("kontaktdescription").append(
			$("<div>").append(
				$("<a>").addClass("username").attr("href", "/profile/" + kontakt.url + "/").html(kontakt.name)
			).append($("<br>")).append(kontakt.b1).append($("<br>")).append(kontakt.b2)
		)
	);
	
	if (distance == Infinity)
	{
		if (kontakt.list == kontakts)
			emptyKontakt.detach();
		kontakt.list.element.append(element);
		kontakt.list.element.css("margin", "0");
		element.show();
		kontakt.list.element.animate({height: "show", margin: "0 0 15px 0"}, 500);
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

function reskontakt(user, elem)
{
	$(elem).prop("disabled", true);
	$.ajax({
		url: "/api/kontakt.php?newid=1&user=" + user.id,
		success: function(obj, status, smth)
		{
			if (obj.messages)
				displayMessages(obj.messages);
			$(elem).prop("disabled", false);
		}
	});
}

function canckontakt(user, elem)
{
	$(elem).prop("disabled", true);
	$.ajax({
		url: "/api/kontakt.php?newid=-1&user=" + user.id,
		success: function(obj, status, smth)
		{
			if (obj.messages)
				displayMessages(obj.messages);
			removeKontaktAnimation(user);
		}
	});
}

function changekontakt(user, elem, n)
{
	$(elem).prop("disabled", true);
	$.ajax({
		url: "/api/kontakt.php?newid=" + n + "&user=" + user.id,
		success: function(obj, status, smth)
		{
			if (obj.messages)
				displayMessages(obj.messages);
			$(elem).prop("disabled", false);
		}
	});
}

function confkontakt(user, elem)
{
	$(elem).prop("disabled", true);
	$.ajax({
		url: "/api/kontakt.php?newid=1user=" + user.id,
		success: function(obj, status, smth)
		{
			if (obj.messages)
				displayMessages(obj.messages);
			addKontaktAnimation(user);
		}
	});
}

function removeKontaktAnimation(user)
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

function addKontaktAnimation(user)
{
	retrievingKontakts = true;
	
	var list = user.list;
	
	list.splice(list.indexOf(user), 1)
	kontakts.splice(0, 0, user);
	
	var height = user.element.height() + 10;
	var height2 = list.element.height() + 15;
	
	var fake = $("<div>").addClass("subpost").css("height", user.element.height() + "px").css("background", "#ccc");
	var fake2 = $("<div>").addClass("subpost").css("padding", "0").css("height", user.element.height() + "px").css("background", "#ccc");
	
	user.element.before(fake);
	$(kontakts.element.children()[0]).after(fake2);
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
		
		if (kontakts.length == 1)
		{
			emptyKontakt.animate({
				height: "hide",
				padding: "0 5px"
			}, 500, "swing", emptyKontakt.detach);
		}
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
				user.list = kontakts;
				retrievingKontakts = false;
			}, 500);
		});
	}, 500);
}

var kontaktPlaceholderVisible = false;
var kontaktPlaceholder = $("<article>").addClass("post").append(
	$("<div>").addClass("innerposttext").append(
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
	)
);