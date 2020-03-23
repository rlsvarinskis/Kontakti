//Thanks to http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
function pasteHandler(e, post)
{
	if (e.clipboardData)
	{
		var clipboard = e.clipboardData.items;
		if (clipboard)
			for (var i = 0; i < clipboard.length; i++)
				if (clipboard[i].type.indexOf("image") !== -1)
				{
					var file = clipboard[i].getAsFile();
					var url = window.URL || window.webkitURL;
					var src = url.createObjectURL(file);
					createImage(src, post);
				}
	} else
		setTimeout(function(){checkInput(post)}, 1);
}

function checkInput(post)
{
	var child = post.commentSection.find("#commentbox" + post.id)[0].childNodes[0];
	if (child)
		if (child.tagName === "IMG")
			createImage(child.src, post);
}