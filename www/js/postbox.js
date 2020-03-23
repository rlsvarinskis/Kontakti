var PostboxClass = function(options)
{
	this.options = {
		text: (!options || (typeof options.text !== 'string')) ? "What's on your mind?" : options.text,
		to: (!options || (typeof options.to !== 'number')) ? "NaN" : options.to,
		pid: (!options || (typeof options.pid !== 'number')) ? 0 : options.pid
	}
	
	this.files = [];
	this.filesLoading = 0;
	
	this.textarea = $("<textarea>").addClass("newpost").attr("maxlength", "65535").attr("placeholder", this.options.text).keydown($.proxy(this.isKeyEnter, this)).on("paste", $.proxy(this.pasteHandler, this));
	this.imagedisplay = $("<div>").addClass("newpostimages")
	this.fileinput = $("<input>").addClass("newpostfiles").attr("accept", "image/*").attr("type", "file").attr("multiple", "multiple").change($.proxy(this.fileUploadHandler, this));
	this.submit = $("<button>").addClass("button").click($.proxy(this.submitHandler, this)).html("Post");
	
	this.element = $("<div>").addClass("post").append(this.textarea).append(this.imagedisplay).append(
		$("<div>").addClass("newpostbottom").append(this.fileinput).append(this.submit)
	);
	
	this.deleteThis = function()
	{
		this.textarea.remove();
		this.imagedisplay.remove();
		this.fileinput.remove();
		this.submit.remove();
		this.element.remove();
		
		for (var name in this.options)
			delete this.options[name];
		
		for (var name in this)
			delete this[name];
	}
}

PostboxClass.prototype.isKeyEnter = function(e)
{
	if (false && e.which == 13)
	{
		this.submitHandler();
		e.preventDefault();
		return false;
	}
	return true;
};

PostboxClass.prototype.pasteHandler = function(e)
{
	if (e.originalEvent.clipboardData)
	{
		var url = window.URL || window.webkitURL;
		
		var items = e.originalEvent.clipboardData.items;
		
		if (items)
		{
			for (var i = 0; i < items.length; i++)
			{
				if (items[i].type.indexOf("image") !== -1)
				{
					var asFile = items[i].getAsFile();
					this.uploadImage(asFile, url.createObjectURL(asFile));
				}
			}
		}
	} else
		setTimeout($.proxy(this.delayedPasteHandler, this), 1);
}

PostboxClass.prototype.delayedPasteHandler = function()
{
	var child = this.textarea[0].childNodes[0];
	if (child && child.tagName == "IMG")
		this.uploadImage(child.src);
}

PostboxClass.prototype.fileUploadHandler = function(e)
{
	//var self = this;
	var files = this.fileinput.get(0).files;
	
	var url = window.URL || window.webkitURL;
	
	if (files)
	{
		for (var i = 0; i < files.length; i++)
		{
			this.uploadImage(files[i], url.createObjectURL(files[i]), files[i].name);
		}
		
		this.fileinput.val("");
	}
}

PostboxClass.prototype.uploadImage = function(data, url, name)
{
	var self = this;
	
	var img = $("<img>").addClass("uploadfilepreview").attr("src", url);
	
	var progresstext = $("<div>").addClass("uploadfileprogresstext");
	var progresstext2 = $("<div>").addClass("uploadfileprogresstext").css("color", "white");
	
	var progress = $("<div>").addClass("uploadfileprogress").append(
		progresstext2
	);
	
	var progressbar = $("<div>").addClass("uploadfileprogressbar").append(progresstext).append(progress);
	
	var filename = $("<div>").addClass("uploadfilename").html(name);
	
	if (typeof name === "undefined")
		filename.html(decodeURI(url));
	
	var file = {data: data, progresstext: progresstext2.add(progresstext), progress: progress, image: img, element: null};
	
	{
		var amt = 1;
		var ind = 0;
		
		var total2 = data.size;
		
		while (total2 >= 1024)
		{
			total2 /= 1024;
			amt *= 1024;
			ind++;
		}
	
		file.progresstext.html("0 " + memoryUnits[ind] + " / " + (Math.round(total2 * 100) / 100) + memoryUnits[ind] + " (0 B/s)");
		progresstext2.offset({left: progresstext.offset().left});
	}
	
	var element = $("<div>").addClass("uploadingfile").append(img).append(
		$("<div>").addClass("uploadfileinfo").append(
			$("<div>").addClass("uploadingfiletoprow").append(
				$("<div>").addClass("uploadfileactions").append(
					$("<div>").addClass("uploadfileaction").addClass("fa").addClass("fa-close").click(function()
					{
						element.remove();
						self.files.splice(self.files.indexOf(file), 1);
					})
				)
			).append(
				$("<div>").addClass("uploadfilenamewrapper").append(filename)
			)
		).append(
			progressbar
		)
	);
	
	file.element = element;
	
	this.imagedisplay.append(element);
	this.files.push(file);
	
	this.sendImageToServer(data, function(loaded, total, percent){
		var amt = 1;
		var ind = 0;
		
		var total2 = total;
		
		while (total2 >= 1024)
		{
			total2 /= 1024;
			amt *= 1024;
			ind++;
		}
		
		file.progresstext.html((Math.round(loaded / amt * 100) / 100) + memoryUnits[ind] + " / " + (Math.round(total2 * 100) / 100) + memoryUnits[ind] + " (0 MB/s)");
		file.progress.css("width", Math.round(percent * 100) + "%");
		progresstext2.offset({left: progresstext.offset().left});
	}, function(json){
		;
		if ((--self.filesLoading) == 0)
			self.submit.prop("disabled", false);
		file.data = json.fileid;
		setTimeout(function(){
			progressbar.attr("finished", "begin");
			progress.remove();
			file.progresstext.html("Success");
			setTimeout(function(){
				progressbar.attr("finished", "yes");
			}, 10);
		}, 100);
	}, function(){});
}

PostboxClass.prototype.sendImageToServer = function(blob, progressFunction, success, error)
{
	this.filesLoading++;
	
	this.submit.prop("disabled", true);
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", '/api/post/fileupload.php?type=' + blob.type, true);

	var progress = xhr.upload || xhr;
	progress.addEventListener("progress", function(e)
	{
		var loaded = e.position || e.loaded;
		var total = e.totalSize || e.total;
		progressFunction(loaded, total, loaded / total);
	});

	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == 4)
		{
			if (xhr.status == 200)
			{
				success(JSON.parse(xhr.responseText));
			} else
			{
				error(xhr.responseText);
			}
		}
	};

	xhr.send(blob);
}

//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

PostboxClass.prototype.submitHandler = function()
{
	//showProgress();
	this.disable();
	getLocation($.proxy(this.continueSubmit, this), $.proxy(this.continueSubmit, this));
}

PostboxClass.prototype.continueSubmit = function(geolocation)
{
	var self = this;
	
	var text = this.textarea.val();
	if (text.length == 0 && this.files.length == 0)
	{
		alertInfo("Post not posted :/", "To post something, write something that should be posted! (Or upload anything you want others to see)", 5000);
		this.enable();
		return;
	}
	
	var data = {pid: this.options.pid, text: text, album: "Photos", longitude: geolocation.longitude, latitude: geolocation.latitude, files: this.files.length};
	for (var x = 0; x < this.files.length; x++)
		data["file" + x] = this.files[x].data;
	$.ajax(
	{
		xhr: getXHR,
		type: "POST",
		url: "/api/postpost.php",
		data: data,
		success: function(response)
		{
			if (typeof response === "object") //TODO
			{
				displayMessages(response.messages);
				if (response.status == "SUCCESS")
				{
					self.clear();
					self.enable();
					tick();
				} else if (response.status == "WAIT")
				{
					alertInfo("Submitting too much posts at once!", "Your post will be submitted after " + response.wait_time + " second" + (response.wait_time == 1 ? "" : "s"), response.wait_time * 1000);
					setTimeout(function(){
						alertInfo("Submitting post", "Your post is being submitted", 5000);
						self.continueSubmit(geolocation);
					}, response.wait_time * 1000);
				} else
				{
					self.enable();
				}
			} else
				alertError("Server error", "An unknown server-side error has occurred: " + response, 5000);
		},
		error: function(e, t, n)
		{
			self.enable();
			showConnectionError(e, t, n);
		}
	})
}

PostboxClass.prototype.disable = function()
{
	this.submit.prop("disabled", true);
	this.textarea.prop("disabled", true);
}

PostboxClass.prototype.enable = function()
{
	this.submit.prop("disabled", false);
	this.textarea.prop("disabled", false);
}

PostboxClass.prototype.clear = function()
{
	this.fileinput.val("");
	this.imagedisplay.html(""); //TODO remove each file instead of just clearing this div
	this.textarea.val("");
	this.files = []; //TODO remove each file instead of just clearing the array
}