var ElementUtils = {
	createIndeterminateRadialLoadingBar: function()
	{
		return $("<div>").addClass("innerposttext").append(
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
		);
	},
	RadialProgressBar: function()
	{
		var svgnamespace = "http://www.w3.org/2000/svg";
		var circle = $(document.createElementNS(svgnamespace, "circle")).attr("stroke-dashoffset", (110 * Math.PI)).attr("stroke-dasharray", (110 * Math.PI)).attr("fill", "transparent").attr("r", "55").attr("cx", "75").attr("cy", "75").css("stroke", "#4D60A5").attr("stroke-width", "10").css("transform", "rotate(-90deg)").css("transform-origin", "center")/*.css("transition", "stroke-dashoffset 50ms ease-in-out")*/;
		this.element = $("<div>").addClass("radialbar").append(
			$(document.createElementNS(svgnamespace, "svg")).addClass("innerposttext").attr("height", "150px").attr("width", "150px").attr("viewport", "0 0 150 150").attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg").append(circle)
		);
		
		this.setPercent = function(p)
		{
			circle.attr("stroke-dashoffset", (1 - p) * 110 * Math.PI);
		}
	},
	LoadingBar: function()
	{
		var internal = $("<div>");
		this.element = $("<div>").addClass("loadingbar").append(internal);
		
		this.setPercent = function(p)
		{
			internal.css("width", (p * 100) + "%");
		}
	},
	createEmptyContainer: function(text)
	{
		return $("<div>").addClass("emptyContainer").append(
			$("<div>").addClass("emptyCentered").append(
				$("<div>").addClass("emptyText").html(text)
			)
		);
	},
	createMoreButton: function()
	{
		return $("<div>").addClass("showmore").append(
			$("<div>").addClass("showmoredots").append(
				$("<div>")
			).append(
				$("<div>")
			).append(
				$("<div>")
			)
		);
	}
};

function getXMLHttpRequest(tocall)
{
	return function()
	{
		var xhr = new window.XMLHttpRequest;
		xhr.addEventListener("progress", function(xhr)
		{
			var loaded = xhr.loaded || xhr.position;
			var total = xhr.total || xhr.totalSize;
			if (typeof tocall == 'function')
				tocall(loaded / total);
		}, false);
		if (xhr.upload)
			xhr.upload.onprogress = function(xhr)
			{
				var loaded = xhr.loaded || xhr.position;
				var total = xhr.total || xhr.totalSize;
				if (typeof tocall == 'function')
					tocall(loaded / total);
			}
		return xhr;
	};
}

//Sort all the objects by their time
function sortByTime(objects)
{
	objects.sort(function(a, b)
	{
		if (a.time == b.time)
			return b.id - a.id;
		return b.time - a.time;
	});
}

function sortById(objects)
{
	objects.sort(function(a, b)
	{
		return b.id - a.id;
	});
}


function withinTime(from, to, objects)
{
	var relevant = [];
	var filtered = [];
	for (var i = 0; i < objects.length; i++)
	{
		var object = objects[i];
		if (object.time > from || object.time < to)
			filtered.push(object);
		else
			relevant.push(object);
	}
	return {relevant: relevant, removed: filtered};
}

function withinId(from, to, objects)
{
	var relevant = [];
	var filtered = [];
	for (var i = 0; i < objects.length; i++)
	{
		var object = objects[i];
		if (object.id > from || object.id < to)
			filtered.push(object);
		else
			relevant.push(object);
	}
	return {relevant: relevant, removed: filtered};
}

function insertById(ar, obj)
{
	if (ar.length == 0)
		ar[0] = obj;
	else
		ar.splice(findBestLocation(ar, obj.id), 0, obj);
}

function findBestLocation(ar, obj)
{
	var start = 0;
	var end = ar.length - 1;
	while (start != end)
	{
		var add = start + end;
		if (add % 2 != 0)
		{
			var avg = add / 2;
			var num = (ar[avg + 0.5].id + ar[avg - 0.5].id) / 2;
			
			if (obj < num)
				start += (end - start) / 2 + 0.5;
			else if (obj > num)
				end -= (end - start) / 2 + 0.5;
			else
				return i + 1;
		} else
		{
			var num = ar[add / 2].id;
			
			if (obj < num)
				start += (end - start) / 2 + 1;
			else if (obj > num)
				end -= (end - start) / 2 + 1;
			else
				return i + 1;
		}
	}
	if (ar[start].id < obj)
		return start;
	else
		return start + 1;
}


function getLocation(success, error)
{
	if (navigator.geolocation)
		navigator.geolocation.getCurrentPosition(success, error);
	else
		error({});
}