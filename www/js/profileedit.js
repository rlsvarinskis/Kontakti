function resetAll()
{
	resetImg(1);
	resetImg(2);
	$(".colors li").each(function()
	{
		$(this).get(0).onclick = function()
		{
			$("#bgcol").val($(this).html());
			document.body.style.backgroundColor = $(this).html()
		}
	})
}
var mouseUpColor = 0;
var ar = ["/profilemedia/avatar/", "/profilemedia/sidebar/"];
var ar2 = ["/profilemedia/avatar-1/", "/profilemedia/sidebar-1/"];
createImage = function(e, t)
{
	var n = t.id;
	var r = new Image;
	r.onload = function()
	{
		$("#img" + n).val("");
		var e = document.createElement("canvas");
		var t = e.getContext("2d");
		e.width = this.width;
		e.height = this.height;
		this.style.width = "100%";
		this.style.height = "100%";
		t.drawImage(this, 0, 0);
		$("#" + n).html("");
		$("#" + n).get(0).appendChild(this);
		$("#imgdataurl" + n).val(e.toDataURL())
	};
	r.src = e
};
var clearImg = function(e)
{
	$("#" + e).html("");
	$("#imgdataurl" + e).val("");
	$("#img" + e).val("");
	createImage(ar2[e - 1], document.getElementById(e))
};
var resetImg = function(e)
{
	createImage(ar[e - 1], document.getElementById(e))
};
readImage = function(e, t)
{
	if (e.files && e.files[0])
	{
		var n = new FileReader;
		n.onload = function(e)
		{
			var n = new Image;
			n.onload = function()
			{
				var e = document.createElement("canvas");
				var n = e.getContext("2d");
				e.width = this.width;
				e.height = this.height;
				this.style.width = "100%";
				this.style.height = "100%";
				n.drawImage(this, 0, 0);
				$("#" + t).html("");
				$("#" + t).get(0).appendChild(this);
				$("#imgdataurl" + t).val(e.toDataURL())
			};
			n.src = e.target.result
		};
		n.readAsDataURL(e.files[0])
	}
};
var submitIt = function(e)
{
	if ($("#imgdataurl" + e).val().length < 23 && $("#img" + e).val() == "")
	{
		$("#errors").prepend("<div class='popupcontainer' id='imgerr' onclick='removeDiv(\"imgerr\")'><div class='popupcell'><div class='popup'><div class='ipopup'><div class='title'>Picture</div><div class='message'>You didn't seem to select any picture...</div></div></div></div></div>");
		return false
	}
	$("#submit").prop("disabled", true);
	$.ajax(
	{
		type: "POST",
		url: "/account/picture" + e + ".php",
		data:
		{
			imgdataurl: $("#imgdataurl" + e).val()
		},
		success: function(t)
		{
			$("#submit" + e).prop("disabled", false);
			$("#errors").prepend(t)
		},
		error: function(t, n, r)
		{
			$("#errors").prepend("<div class='popupcontainer' id='posterr' onclick='removeDiv(\"posterr\")'><div class='popupcell'><div class='popup'><div class='ipopup'><div class='title'>" + n + "</div><div class='message'>" + r + "</div></div></div></div></div>");
			$("#submit" + e).prop("disabled", false)
		}
	})
};
var nt = window.webkitNotifications && navigator.userAgent.indexOf("Chrome") > -1 ? "webkit" : window.Notification ? "w3c" : "null";
var desktop = function()
{
	if (nt == "webkit")
	{
		if (webkitNotifications.checkPermission() == 1)
		{
			$.get("togglenotifications.php", function(e)
			{
				$("#desktop").html(e)
			});
			webkitNotifications.requestPermission()
		} else if (webkitNotifications.checkPermission() == 0)
		{
			$.get("togglenotifications.php", function(e)
			{
				$("#desktop").html(e)
			})
		} else
		{
			alertInfo("Notifications", "You have blocked all notifications from this site.", 10000)
		}
	} else if (nt == "w3c")
	{
		if (Notification.permission === "default")
		{
			Notification.requestPermission();
			$.get("togglenotifications.php", function(e)
			{
				$("#desktop").html(e)
			})
		}
		else if (Notification.permission === "granted")
		{
			$.get("togglenotifications.php", function(e)
			{
				$("#desktop").html(e)
			})
		}
		else
		{
			alertInfo("Notifications", "You have blocked all notifications from this site.", 10000)
		}
	} else
	{
		alertInfo("Notifications", "Your browser doesn't support notifications. To see notifications, either upgrade your browser or install a more modern browser.", 10000)
	}
};
cleanup = function()
{
	delete desktop;
	delete nt;
	delete submitIt;
	delete resetImg;
	delete clearImg;
	delete ar;
	delete ar2;
	mouseUp.splice(mouseUpColor, 1);
	delete mouseUpColor;
};
$("#img1").change(function()
{
	readImage(this, 1);
});
$("#img2").change(function()
{
	readImage(this, 2);
});
mouseUpColor = mouseUp.length;
mouseUp[mouseUpColor] = function(e)
{
	var t = $("#bgcol");
	var n = $(".colors");
	if (!t.is(e.target) && t.has(e.target).length === 0 && !n.is(e.target) && n.has(e.target).length === 0)
		$(".colors").hide();
}