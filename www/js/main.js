var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; //Months of the year (sorry if this line was too complicated to understand)
	
var memoryUnits = [" bytes", " KiB", " MiB", " GiB", " TiB", " PiB", " EiB", " ZiB", " YiB"];

var profileid = "all";

var lun = 0;
var hun = 0;

var winfocus = true;

var cleanup = function() {};
var notify = function(e, t, n) {};
var mouseUp = [];
var ಠ_ಠ = [];

var modules = [];

var intoViewElements = [];
var intoViewActions = [];
var intoViewBoolean = [];

var images = [];

var applicationpath = window.location.pathname;


var navbar = {}


$(window).load(function()
{
	if (hasNotifications)
	{
		if (window.webkitNotifications)
		{
			console.log("Notifications are supported: using window.webkitNotifications");
			notify = function(e, t, n)
			{
				if (webkitNotifications.checkPermission() == 0)
				{
					var r = webkitNotifications.createNotification(e, t, n);
					r.show();
					setTimeout(function(){r.close()}, 10000)
				}
				else if (webkitNotifications.checkPermission() == 1) webkitNotifications.requestPermission();
				else alertInfo("Notifications are blocked!")
			}
		} else if (window.Notification)
		{
			console.log("Notifications are supported: using window.Notification");
			notify = function(e, t, n)
			{
				if (Notification.permission === "granted")
				{
					var r = new Notification(t,
					{
						icon: e,
						body: n
					});
					setTimeout(function(){r.close()}, 10000)
				}
				else if (Notification.permission === "default") Notification.requestPermission();
				else alertInfo("Notifications are blocked!")
			}
		} else
		{
			console.log("The browser doesn't support notifications");
			notify = function(e, t, n) {}
		}
	} else
	{
		console.log("Notifications are disabled");
		notify = function(e, t, n) {}
	}
	navbar.notifications = new notificationsclass();
	registerModule(navbar.notifications);
	navbar.notifications.attachCounter($("#notifnum"), $("#subnotifnum"));
	$("#notificationspopup").append(navbar.notifications.element);
	//alertInfo("Info", "This is an info alert!");
	//alertSuccess("Success", "This is a success alert!");
	//alertError("Error", "This is an error alert!");
	stateUpdate();
	loadSearch();
	tick();
	setInterval(tick, 60000);
});

window.onpopstate = function(e)
{
	if (e.state) pg2(e.href)
};

$(window).focus(function()
{
	document.title = stateTitle;
	lun = 0;
	winfocus = true;
	stateTick()
});

$(window).blur(function()
{
	winfocus = false
});

$(document).click(function(e)
{
	for (var t = 0; t < mouseUp.length; t++) mouseUp[t](e)
});



mouseUp[0] = function(e)
{
	var t = $(".l");
	if (!t.is(e.target) && t.has(e.target).length === 0) srhide();
	else srshow();
};

mouseUp[1] = function(e)
{
	$(".openableMenu").each(function()
	{
		var t = $(this);
		if (!t.is(e.target) && t.has(e.target).length === 0)
			t.attr(
			{
				opened: "no"
			});
		else
			t.attr(
			{
				opened: "yes"
			});
	})
};

mouseUp[2] = function(e)
{
	$(".arrows").each(function()
	{
		var t = $(this);
		if (!t.is(e.target) && t.has(e.target).length === 0)
			t.attr(
			{
				opened: "no"
			});
		else
			t.attr(
			{
				opened: "yes"
			});
	})
};


function registerModule(obj)
{
	modules.push(obj);
}

function unregisterModule(obj)
{
	modules.splice(modules.indexOf(obj), 1);
}

function onScrollIntoView(elem, action)
{
	intoViewElements.push(elem);
	intoViewActions.push(action);
	intoViewBoolean.push(0);
}

function removeIntoView(elem)
{
	var index = intoViewElements.indexOf(elem);
	intoViewElements.splice(elem, 1);
	intoViewActions.splice(elem, 1);
	intoViewBoolean.splice(elem, 1);
}


function tick()
{
	//notifications.loadNotifs();
	stateTick();
	postTick()
}

$(document).ready(function()
{
    $(window).scroll(function()
	{
		for (var i = 0; i < intoViewElements.length; i++)
		{
			if (isScrolledIntoView(intoViewElements[i]))
			{
				if (intoViewBoolean[i] == 0)
				{
					intoViewBoolean[i] = 1;
					intoViewActions[i]();
				}
			} else
			{
				intoViewBoolean[i] = 0;
			}
		}
    });
});

function isScrolledIntoView(elem)
{
	var e = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + window.innerHeight;

    var elemTop = e.offset().top;
    var elemBottom = elemTop + e.height();

    return ((elemBottom <= docViewBottom && elemBottom > docViewTop) || (elemTop >= docViewTop && elemTop < docViewBottom));
}


function stateTick()
{
	switch (state)
	{
		//case "posts":
		//	retrievePosts();
		//	break;
		//case "kontakts":
		//	retrieveKontakts();
		//	break;
		case "editprofile":
			break;
		case "verify":
			break;
		case "newobject":
			break;
		default:
			break
	}
	for (var i = 0; i < modules.length; i++)
		if (typeof modules[i].tick == 'function')
			modules[i].tick();
}

function postTick()
{
	return;
	/*if (lun > 0 && !winfocus)
	{
		document.title = "";
		document.title = "(" + lun + ")" + " " + stateTitle
	}
	if (hun > 0) $("#navbarhome").html("Home (" + hun + ")");
	else $("#navbarhome").html("Home")*/
}




function removeDiv(e)
{
	$("#" + e).fadeOut(400, "swing", function()
	{
		$("#" + e).remove()
	})
}

function page(e)
{
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: "/help/" + e,
		success: function(e)
		{
			$(document.body).append(e)
		},
		error: showConnectionError
	});
	return false
}

function progress(e)
{
	if (e == "Infinity%" || e == "NaN%") return false;
	$(".pageTopProgressBar").width(e);
	if (e == "100%")
	{
		setTimeout(function()
		{
			$(".pageTopProgressBar").get(0).style.opacity = 0;
			setTimeout(function()
			{
				$(".pageTopProgressBar").hide();
				$(".pageTopProgressBar").width("0%")
			}, 400)
		}, 1e3)
	}
}

function showProgress()
{
	$(".pageTopProgressBar").show();
	$(".pageTopProgressBar").get(0).style.opacity = "1"
}

function pg(e)
{
	showProgress();
	$.ajax(
	{
		cache: false,
		xhr: getXHR,
		type: "GET",
		url: e.href,
		success: function(t)
		{
			cleanup();
			cleanup = function() {};
			$("#content").html(t);
			stateUpdate();
			document.title = stateTitle;
			var n = document.location.href;
			window.history.pushState(
			{
				url: n
			}, "", e.href);
			tick()
		},
		error: showConnectionError
	});
	return false;
}

function pg2(e)
{
	$.ajax(
	{
		cache: false,
		type: "GET",
		url: e,
		success: function(e)
		{
			cleanup();
			cleanup = function() {};
			$("#content").html(e);
			stateUpdate();
			document.title = stateTitle;
			tick()
		},
		error: showConnectionError
	});
	return false;
}

function getXHR()
{
	var xhr = new window.XMLHttpRequest;
	xhr.addEventListener("progress", function(xhr)
	{
		var loaded = xhr.loaded || xhr.position;
		var total = xhr.total || xhr.totalSize;
		progress(Math.floor(loaded * 100 / total) + "%");
	}, false);
	if (xhr.upload)
		xhr.upload.onprogress = function(xhr)
		{
			var loaded = xhr.loaded || xhr.position;
			var total = xhr.total || xhr.totalSize;
			progress(Math.floor(loaded * 100 / total) + "%");
		}
	return xhr;
}

function formatAddress(geolocation, callback)
{
	console.log("GEE OH WIZ");
	$.ajax(
	{
		async: true,
		type: "GET",
		url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + geolocation + "&sensor=false",
		success: function(e)
		{
			if (typeof e === "object")
				for (var t = 0; t < e.results.length; t++)
				{
					var n = e.results[t];
					for (var i = 0; i < n.types.length; i++)
						if (n.types[i] == "street_address")
						{
							callback(n.formatted_address);
							return;
						}
					console.log("OH GOLLY GEE");
				}
			else
				alertError("Server error", "An unknown server-side error has occurred: " + e, 5000);
		},
		error: showConnectionError
	});
}