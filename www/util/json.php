<?php

$jsondata = array();
$messages = array();

function addJSON($name, $value)
{
	global $jsondata;
	$jsondata[$name] = $value;
}

function echoMessage($title, $body, $type = "info")
{
	global $messages;
	array_push($messages, array(
		"name" => /*addslashes*/(slashQuotes($title)),
		"description" => /*addslashes*/(slashQuotes($body)),
		"type" => $type,
		"important" => false
	));
}

function echoErr($title, $body)
{
	global $messages;
	array_push($messages, array(
		"name" => /*addslashes*/(slashQuotes($title)),
		"description" => /*addslashes*/(slashQuotes($body)),
		"type" => "error",
		"important" => false
	));
}

$errorTitles = array(
	"Database error",
	"Webpage error"
);

$errorDescriptions = array(
	"There was an error with the database, and your requested action could not have been completed. We are working to resolve this issue ASAP.",
	"There was an error in the webpage, and your requested action could not have been completed. We are working to resolve this issue ASAP."
);

function echoDBError($error, $code)
{
	global $messages;
	global $db;
	echoErr("Database error", "There was an error with the database, and your requested action could not have been completed. We are working to resolve this issue.");
	if ($stmt = $db->prepare("INSERT INTO `errors`(`error`, `code`) VALUES (?, ?)"))
	{
		$stmt->bind_param("ss", $error, $code);
		$stmt->execute();
		$stmt->close();
	} else
		echoErr("Error reporting error", "There was an error while attempting to report this error. Please email us about this");
}

function echoImportantMessage($title, $body)
{
	global $messages;
	$time = time();
	array_push($messages, array(
		"name" => /*addslashes*/(slashQuotes($title)),
		"description" => /*addslashes*/(slashQuotes($body)),
		"important" => true
	));
}

function slashQuotes($str)
{
	return str_replace("\"", "\\\"", $str);
}

function echoJSON()
{
	global $jsondata;
	global $messages;
	addJSON("messages", $messages);
	echo json_encode($jsondata);
}

function stringifyJSON($json)
{
	$output = '';
	if (is_array($json))
	{
		$keyval = false;
		foreach ($json as $key => $value)
			if (!is_numeric($key))
			{
				$keyval = true;
				break;
			}
		if ($keyval)
		{
			$outputs = array();
			foreach ($json as $key => $value)
				array_push($outputs, '"' . $key . '":' . stringifyJSON($value));
			$output = '{' . implode(",", $outputs) . '}';
		} else
		{
			$outputs = array();
			foreach ($json as $value)
				array_push($outputs, stringifyJSON($value));
			$output = '[' . implode(",", $outputs) . ']';
		}
	} else if (is_bool($json))
		$output = $json ? "true" : "false";
	else if (is_scalar($json))
		$output = $json;
	else if (is_string($json))
		$output = '"' . json_encode($json) . '"';
	else
		$output = '"' . json_encode($json) . '"';
	return $output;
}

?>