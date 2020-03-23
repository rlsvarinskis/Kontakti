var notificationsclass = function(options)
{
	this.options = {
		limit: (!options || typeof options.limit !== "number") ? 15 : options.limit
	};
	
	this.notifications = [];
	this.uncheckedDubs = 0;
	
	var dis = this;
	
	this.more = ElementUtils.createMoreButton().click(function(){
		dis.retrieveNotifications(dis.notifications.length == 0 ? Infinity : dis.notifications[dis.notifications.length - 1].id, 0);
	}).hide();
	this.empty = ElementUtils.createEmptyContainer("No more notifications").attr("size", "small");
	
	this.element = $("<div>").addClass("notifsbar").append(this.more).append(this.empty);
	
	
	this.cont = null;
	this.num = null;
	
	
	this.clean = function()
	{
		this.element.remove();
	}
}

notificationsclass.prototype.attachCounter = function(container, number)
{
	this.cont = container;
	this.num = number;
	
	this.checkDubs();
}

notificationsclass.prototype.retrieveNotifications = function(from, to)
{
	if (typeof from != 'number')
		from = Infinity;
	if (typeof to != 'number')
		to = this.notifications.length > 0 ? this.notifications[0].id : 0;
	
	this.more.attr("disabled", "yes");
	
	var dis = this;
	$.ajax(
	{
		xhr: getXMLHttpRequest(),
		type: "GET",
		cache: false,
		url: "/api/getnotifications.php?from=" + from + "&to=" + to + "&limit=" + dis.options.limit,
		success: function(e)
		{
			if (typeof e === "object")
			{
				dis.more.removeAttr("disabled");
				if (e.notifications.length == dis.options.limit)
				{
					if (to == 0)
					{
						dis.empty.hide();
						dis.more.show();
					}
					to = e.notifications[dis.options.limit - 1].id;
				} else if (to == 0)
				{
					dis.more.hide();
					dis.empty.show();
				}
				dis.displayNotifications(e.notifications, from, to);
				displayMessages(e.messages);
			}
			else
				alertError("Unknown error", "An unknown error has occured: " + e, 5000);
		},
		error: showConnectionError
	});
}

notificationsclass.prototype.tick = notificationsclass.prototype.retrieveNotifications;

notificationsclass.prototype.displayNotifications = function(newnotifs, from, to)
{
	this.updateNotifications(newnotifs, from, to);
	sortById(this.notifications);
	this.checkDubs();
}

//Update the list of notifications
notificationsclass.prototype.updateNotifications = function(newnotifs, from, to)
{
	var filter = withinId(from, to, this.notifications);
	
	this.removeDeletedNotifications(newnotifs, filter.relevant);
	this.addNewNotifications(newnotifs, filter.relevant);
}

//Remove any notifications that are deleted
notificationsclass.prototype.removeDeletedNotifications = function(newnotifs, oldnotifs)
{
	a: for (var i = 0; i < oldnotifs.length; i++)
	{
		for (var j = 0; j < newnotifs.length; j++)
			if (oldnotifs[i].id == newnotifs[j].id)
				continue a;
		
		if (oldnotifs[i].element)
			oldnotifs[i].remove(); //TODO
		this.notifications.splice(this.notifications.indexOf(oldnotifs[i]), 1);
		oldnotifs.splice(i--, 1);
	}
}

//Add any new notifications
notificationsclass.prototype.addNewNotifications = function(newnotifs, oldnotifs)
{
	a: for (var i = 0; i < newnotifs.length; i++)
	{
		for (var j = 0; j < oldnotifs.length; j++)
		{
			if (newnotifs[i].id == oldnotifs[j].id)
			{
				updateNotification(newnotifs[i], oldnotifs[j]);
				continue a;
			}
		}
		
		this.findClosestNotification(newnotifs[i]);
		this.notifications.push(newnotifs[i]);
	}
}

notificationsclass.prototype.findClosestNotification = function(notif)
{
	var previousnotif = this.more;
	var previousdistance = Infinity;
	for (var x = 0; x < this.notifications.length; x++)
	{
		if (!!this.notifications[x].element)
		{
			var dist = notif.id - this.notifications[x].id;
			if (this.notifications[x].id == notif.id)
			{
				console.log("WARNING: Two different elements turned out equal!"); //TODO
				return;
			} else if (Math.abs(dist) < Math.abs(previousdistance))
			{
				previousnotif = this.notifications[x].element;
				previousdistance = dist;
			}
		}
	}
	notif.element = this.createNotification(notif, previousdistance, previousnotif);
	notif.remove = function(){this.element.remove();}; //TODO
	if (!notif.read)
		this.uncheckedDubs++;
}

notificationsclass.prototype.checkDubs = function()
{
	var dis = this;
	if (this.uncheckedDubs > 0)
	{
		if (!this.cont.is(":visible") || this.num.html() != this.uncheckedDubs)
		{
			this.cont.show();
			this.cont.css("transform", "scale(0)");
			this.cont.attr("animate", "yes");
			setTimeout(function()
			{
				dis.cont.removeAttr("animate");
				dis.cont.css("transform", "scale(1)");
			}, 1000);
		}
		this.num.html(this.uncheckedDubs);
	} else
	{
		if (this.cont.is(":visible"))
		{
			this.cont.attr("animate", "out");
			setTimeout(function()
			{
				dis.cont.hide();
				dis.cont.removeAttr("animate");
			}, 1000);
		}
	}
}

notificationsclass.prototype.createNotification = function(notif, distance, closestElement)
{
	var read = "no";
	if (notif.read)
		read = "yes";
	var dis1 = this;
	var element = $("<div>").append(
		$("<a>").addClass("notifan").attr("href", notif.url).click(function(e) //TODO
		{
			var dis = this;
			if (notif.read)
				pg(this);
			else
			{
				showProgress(); //TODO
				$.ajax(
				{
					xhr: getXHR,
					type: "POST",
					data: {
						id: notif.id
					},
					url: "/post/marknotificationasread.php",
					success: function(e)
					{
						$("#errors").append(e); //TODO
						notif.read = true;
						notif.element.find(".notiftext").attr("read", "yes");
						dis1.uncheckedDubs--;
						dis1.checkDubs();
						pg(dis);
					},
					error: showConnectionError
				});
			}
			return false;
		}).append(
			$("<div>").addClass("notificon").css("background-image", "url(" + notif.icon + ")")
		).append(
			$("<div>").addClass("notiftext").attr("read", read).html(notif.text)
		)
	);
	
	if (distance < 0)
		closestElement.after(element);
	else if (distance > 0)
		closestElement.before(element);
	
	if (!winfocus)
		element.show();
	else
		element.fadeIn();
	return element;
}

function updateNotification(old, n)
{
	var read = "no";
	if (n.read)
		read = "yes";
	
	if (old.text != n.text)
		old.element.find(".notiftext").html(old.text = n.text);
	if (old.icon != n.icon)
		old.element.find(".notificon").css("background-image", "url(" + (old.icon = n.icon) + ")");
	if (old.url != n.url)
		old.element.find(".notifan").attr("href", old.url = n.url);
	if (old.read != n.read)
	{
		old.element.find(".notiftext").attr("read", read);
		old.read = n.read;
	}
}


/*
$.ajax(
{
	xhr: getXHR,
	cache: false,
	type: "GET",
	url: "/api/getrequests.php",
	success: function(e)
	{ //TODO remove this
		var t = e.requests;
		if (t > 0)
		{
			$("#subkontaktnum").html(t);
			$("#kontaktnum").attr("display", "");
		}
		else
		{
			$("#kontaktnum").removeAttr("display");
		}
	},
	error: showConnectionError
});
*/