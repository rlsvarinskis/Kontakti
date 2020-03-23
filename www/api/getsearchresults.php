<?php
include "../util/session.php";
require_once('D:/sphinx/api/sphinxapi.php');

if (isset($_POST['search']))
{
	$limit = 100;
	if (isset($_POST['s']))
	{
		$limit = 10;
	}
	
	//Sphinx
	$s = new SphinxClient;
	$s->setServer("localhost", 9312);//9312, 9306
	$s->setMatchMode(SPH_MATCH_EXTENDED2);
	$s->SetRankingMode(SPH_RANK_PROXIMITY_BM25);
	
	$search = preg_replace("/@/", "\\@", $_POST['search']);
	$result;
	$hash = false;
	if (substr($search, 0, 1) === '#')
	{
		$hash = true;
		 $result = $s->query("@(text,name,username) $search", "posts");
	} else
	{
		 $result = $s->query("@(username,name,email) $search", "accounts");
	}
	//$result = $s->query("@(name,email,folder) $search", "accounts");
	$hass = $result['total'] == 1 ? "" : "s";
	if ($result['total'] == 0)
	{
		echo '<div class="sresult">No results found</div>';
		echo $s->getLastError();
	} else
	{
		if ($hash)
		{
			foreach ($result['matches'] as $id => $data)
			{
				$res = mysqli_query($db, "SELECT `accounts`.`id`,`accounts`.`name`,`postedit`.`text` FROM `posts` JOIN `accounts` ON `accounts`.`id`=`posts`.`uid` JOIN `postedit` ON `postedit`.`editid`=`posts`.`posteditid` WHERE `posts`.`pid`=$id");
				$row = mysqli_fetch_array($res);
				echo mysqli_error($db);
				echo "<a class='sresult' href='/posts/" . $id . "/' onclick='return pg(this);'>";
				echo '<div style="float:left;margin-right:5px;background-image:url(/profilemedia/avatar' . $row['id'] . '/);background-size:cover;width:50px;height:50px;"></div>';
				echo $row['name'] . ":<br /><span class='sresultsmall'>";
				echo $row['text'] . "</span></a>";
			}
		} else
		{
			foreach ($result['matches'] as $id => $data)
			{
				$row = mysqli_fetch_array(mysqli_query($db, "SELECT `name`,`username` FROM `accounts` WHERE `id`=$id"));
				echo "<a class='sresult' href='/profile/" . $row['username'] . "/' onclick='return pg(this);'>";
				echo '<div style="float:left;margin-right:5px;background-image:url(/profilemedia/avatar' . $id . '/);background-size:cover;width:50px;height:50px;"></div>';
				echo $row['name'] . "</a>";
			}
		}
		echo "<div style='float:left;'>&nbsp;&nbsp;Powered by Sphinx</div><div style='float:right;'>Found " . $result['total'] . " result$hass in " . $result['time'] . " seconds&nbsp;&nbsp;</div><div style='clear:both;padding-bottom:5px;'></div>";
	}
	$s->close();
}
?>