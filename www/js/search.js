function search()
{
	var e = $("#search").val();
	$.ajax(
	{
		type: "POST",
		url: "/api/getsearchresults.php",
		data:
		{
			search: e
		},
		success: function(e)
		{
			$("#searchresults").html(e);
			srshow()
		},
		error: function(e, t, n)
		{
			$("#errors").prepend("<div class='popupcontainer' id='posterr' onclick='removeDiv(\"posterr\")'><div class='popupcell'><div class='popup'><div class='ipopup'><div class='title'>" + t + "</div><div class='message'>" + n + "</div></div></div></div></div>")
		}
	});
	lastvl = e
}

function loadSearch()
{
	$("#search").keyup(function()
	{
		clearTimeout(searchTimer);
		var e = $("#search").val();
		if (e.length > 0 && lastvl != e) searchTimer = setTimeout(search, 500);
		else if (e.length == 0) $("#searchresults").html('<a class="sresult" href="/search.php" onclick="return pg(this);"><div style="float:left;margin-right:5px;background-image:url(/favicon-160x160.png);background-size:cover;width:50px;height:50px;"></div>Search for more results</a>')
	});
	$("#searchcontainer").width($(".l").width());
	$("#search").focus(srshow);
}

function srhide()
{
	if ($("#searchcontainer").attr("search") != "yes")
		return;
	if ($("#search").val().length == 0) $("#searchresults").html('<a class="sresult" href="/search.php" onclick="return pg(this);"><div style="float:left;margin-right:20px;background-image:url(/favicon-160x160.png);background-size:cover;width:50px;height:50px;"></div>Search for more results</a>');
	$("#searchcontainer").attr("search", "temp");
	$("#searchresults").animate({height: "hide"}, 100, "swing", function(){
		$("#searchcontainer").attr("search", "no");
		$("#searchcontainer").css("width", "");
	});
}

function srshow()
{
	if ($("#searchcontainer").attr("search") == "yes")
		return;
	$(".openableMenu").each(function()
	{
		$(this).attr("opened",  "no");
	});
	$(".arrows").each(function()
	{
		$(this).attr("opened",  "no");
	});
	$("#searchcontainer").width($(".l").width());
	if ($("#search").val().length == 0) $("#searchresults").html('<a class="sresult" href="/search.php" onclick="return pg(this);"><div style="float:left;margin-right:20px;background-image:url(/favicon-160x160.png);background-size:cover;width:50px;height:50px;"></div>Search for more results</a>');
	$("#searchcontainer").attr("search", "yes");
	$("#searchresults").animate({height: "show"}, 100);
}

var lastvl = "";
var searchTimer;