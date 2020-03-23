function alertError(title, text, alivetime)
{
	var errorclose = $("<div>").addClass("alertclose")/*.append("&#10060;")*/;
	var element = $("<div>").addClass("alert").addClass("error").append(
		errorclose
	).append(
		$("<div>").addClass("alerttitle").append(
			"&#x2718;&nbsp;&nbsp;" + title
		)
	).append(
		$("<div>").addClass("alerttext").append(
			text
		)
	);
	$("#errors").prepend(element);
	element.animate({
		marginTop: "15"
	}, 250);
	var message = {
		title: title,
		text: text,
		element: element,
		close: function()
		{
			element.animate(
			{
				height: "0",
				opacity: "0",
				marginTop: "0",
				paddingTop: "0",
				paddingBottom: "0"
			}, 500, function()
			{
				$(this).remove();
			});
		}
	};
	errorclose.click(function()
	{
		message.close();
	});
	if (alivetime > 0)
		setTimeout(message.close, alivetime);
	return message;
}

function alertSuccess(title, text, alivetime)
{
	var errorclose = $("<div>").addClass("alertclose")/*.append("&#10060;")*/;
	var element = $("<div>").addClass("alert").addClass("success").append(
		errorclose
	).append(
		$("<div>").addClass("alerttitle").append(
			"&#x2714;&nbsp;&nbsp;" + title
		)
	).append(
		$("<div>").addClass("alerttext").append(
			text
		)
	);
	$("#errors").prepend(element);
	element.animate({
		marginTop: "15"
	}, 250);
	var message = {
		title: title,
		text: text,
		element: element,
		close: function()
		{
			element.animate(
			{
				height: "0",
				opacity: "0",
				marginTop: "0",
				paddingTop: "0",
				paddingBottom: "0"
			}, 500, function()
			{
				$(this).remove();
			});
		}
	};
	errorclose.click(function()
	{
		message.close();
	});
	if (alivetime > 0)
		setTimeout(message.close, alivetime);
	return message;
}

function alertInfo(title, text, alivetime)
{
	var errorclose = $("<div>").addClass("alertclose")/*.append("&#10060;")*/;
	var element = $("<div>").addClass("alert").addClass("info").append(
		errorclose
	).append(
		$("<div>").addClass("alerttitle").append(
			"!" + /*"&#10071;" + */"&nbsp;&nbsp;" + title
		)
	).append(
		$("<div>").addClass("alerttext").append(
			text
		)
	);
	$("#errors").prepend(element);
	element.animate({
		marginTop: "15"
	}, 250);
	var message = {
		title: title,
		text: text,
		element: element,
		close: function()
		{
			element.animate(
			{
				height: "0",
				opacity: "0",
				marginTop: "0",
				paddingTop: "0",
				paddingBottom: "0"
			}, 500, function()
			{
				$(this).remove();
			});
		}
	};
	errorclose.click(function()
	{
		message.close();
	});
	if (alivetime > 0)
		setTimeout(message.close, alivetime);
	return message;
}

function displayMessages(messages)
{
	for (var x = 0; x < messages.length; x++)
	{
		var message = messages[x];
		if (message.important)
		{
			var time = new Date().getTime();
			$("#errors").append(
				$("<div>").addClass("popupcontainer").attr("id", "message" + time).click(function()
				{
					removeDiv("message" + time);
				}).append(
					$("<div>").addClass("popupcell").append(
						$("<div>").addClass("popup").append(
							$("<div>").addClass("ipopup").append(
								$("<div>").addClass("title").append(
									message.name
								)
							).append(
								$("<div>").addClass("title").append(
									message.description
								)
							)
						)
					)
				)
			);
		} else
		{
			switch (message.type)
			{
				default:
				case "info":
					alertInfo(message.name, message.description, 5000);
					break;
				case "success":
					alertSuccess(message.name, message.description, 5000);
					break;
				case "error":
					alertError(message.name, message.description, 5000);
					break;
			}
		}
	}
}

function showConnectionError(xhr, ajaxOptions, error)
{
	if (xhr.status == 0)
		alertError("Connection error", "Could not connect to server!", 5000);
	else
		alertError("Server error", "Could not receive data from server, instead received error " + xhr.status + "<br />" + error + " (" + xhr.responseText + ")", 5000);
}