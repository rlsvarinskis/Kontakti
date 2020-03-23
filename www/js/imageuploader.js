var readImage = function(e)
{
    var files = e.target.files;
    var file = files[0];

    if (files && file) {
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            document.getElementById("base64textarea").value = btoa(binaryString);
        };

        reader.readAsBinaryString(file);
    }
	
	if (e.files)
	{
		for (var t = 0; t < e.files.length; t++)
		{
			var n = new FileReader;
			n.onload = function(e)
			{
				var img = $("<img>");
				img.load(function()
				{
					img.click(function()
					{
						img.remove();
						globalpost0.commentSection.images.splice(globalpost0.commentSection.images.indexOf(img), 1);
					});
					var canvas = document.createElement("canvas");
					var context = canvas.getContext("2d");
					
					canvas.width = this.width;
					canvas.height = this.height;
					
					img.css("max-height", "130px").css("max-width", "80%");
					
					context.drawImage(this, 0, 0);
					img[0].associatedData = canvas.toDataURL();
					globalpost0.commentSection.images.push(img[0]);
					
					img.css("border", "1px solid black");
					img.css("alt", "Remove this image");
					img.css("title", "Click to remove this image");
					img.css("cursor", "pointer");
				});
				img.attr("src", e.target.result);
				console.log(e.target.result);
				$("#commentbox0images").append(img);
			};
			n.readAsDataURL(e.files[t])
		}
		$("#commentbox0file").val("");
	}
};