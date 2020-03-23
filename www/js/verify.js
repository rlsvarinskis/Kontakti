var check = function()
{
	$("#errs").empty();
	var e = ($("#v1").val() + $("#v2").val() + $("#v3").val() + $("#v4").val()).toUpperCase();
	$.ajax(
	{
		url: "/account/verify.php",
		type: "POST",
		data:
		{
			key: e
		},
		success: function(e)
		{
			if (e == "true")
			{
				$(".newpostdiv").attr("status", "success");
				setTimeout(function()
				{
					$(".newpostdiv").attr("status", "default")
				}, 100);
				setTimeout(function()
				{
					document.location.href = ""
				}, 1e3)
			}
			else
			{
				$(".newpostdiv").attr("status", "error");
				setTimeout(function()
				{
					$(".newpostdiv").attr("status", "default")
				}, 100);
				$("#errs").html(e)
			}
		},
		error: showConnectionError
	})
};
var pasteKey = function(e)
{
	var t = e.clipboardData.getData("text/plain");
	var n = /([0-9A-Za-z]){5}\-([0-9A-Za-z]){5}\-([0-9A-Za-z]){5}\-([0-9A-Za-z]){5}/;
	var r = n.exec(t)[0];
	var i = n.test(t);
	if (i)
	{
		t = r;
		setTimeout(function()
		{
			var e = t.split("-");
			for (var n = 1; n < 5; n++)
			{
				var r = e[n - 1];
				$("#v" + n).val(r)
			}
		}, 10)
	}
	return false
};
var nextkey = function(e, t)
{
	var n = e.keyCode;
	var r = e.target;
	var i = e.target.selectionStart;
	if ((n > 64 && n < 91 || n > 47 && n < 58) && $("#v4").get(0).value.length < 5)
	{
		r.value = r.value.substr(0, i) + String.fromCharCode(n) + r.value.substr(i);
		i++;
		var s = "";
		for (var o = 1; o < 5; o++) s += $("#v" + o).get(0).value;
		s = s.substr(0, 20);
		for (var o = 1; o < 5; o++)
		{
			$("#v" + o).get(0).value = s.substr(0, 5);
			s = s.substr(5)
		}
		if (t != 4 && i == 5)
		{
			r = $("#v" + (t + 1)).get(0);
			i = 0
		}
	}
	else if (n == 8)
	{
		if (i != 0)
		{
			r.value = r.value.substr(0, i - 1) + r.value.substr(i);
			i--
		}
		else if (i == 0 && t != 1)
		{
			r = $("#v" + (t - 1)).get(0);
			r.value = r.value.substr(0, 4) + r.value.substr(5);
			i = 4
		}
		var s = "";
		for (var o = 1; o < 5; o++) s += $("#v" + o).get(0).value;
		s = s.substr(0, 20);
		for (var o = 1; o < 5; o++)
		{
			$("#v" + o).get(0).value = s.substr(0, 5);
			s = s.substr(5)
		}
	} else if (n == 46)
	{
		if (i != 5)
		{
			r.value = r.value.substr(0, i) + r.value.substr(i + 1);
		} else if (i == 5 && t != 4)
		{
			r = $("#v" + (t + 1)).get(0);
			r.value = r.value.substr(1)
		}
		var s = "";
		for (var o = 1; o < 5; o++) s += $("#v" + o).get(0).value;
		s = s.substr(0, 20);
		for (var o = 1; o < 5; o++)
		{
			$("#v" + o).get(0).value = s.substr(0, 5);
			s = s.substr(5);
		}
	} else if (n == 35)
	{
		for (var o = 4; o > 0; o--)
		{
			var u = $("#v" + o).get(0);
			if (u.value.length > 0)
			{
				r = u;
				i = 5;
				break
			}
		}
	} else if (n == 36)
	{
		r = $("#v1").get(0);
		i = 0;
	} else if (n == 37)
	{
		if (i < 1)
		{
			if (t != 1)
			{
				r = $("#v" + (t - 1)).get(0);
				i = 4;
			}
		}
		else i--;
	} else if (n == 39)
	{
		if (i > 3)
		{
			if (t != 4)
			{
				r = $("#v" + (t + 1)).get(0);
				i = 0;
			}
			else i = 5;
		}
		else i++;
	}
	r.focus();
	r.selectionStart = i;
	r.selectionEnd = i;
	return false;
};
var reskey = function()
{
	$("#errs").empty();
	$.ajax(
	{
		url: "/tools/sendkey.php",
		type: "GET",
		success: function(e)
		{
			$("#errs").html(e)
		},
		error: showConnectionError
	});
	return false
}