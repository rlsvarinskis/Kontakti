<?php
	if (!isset($viewdata))
		die("404 not found...");
	$username = $viewdata['name'];
	
	$user = $viewdata['id'];
	$myid = $userdata['id'];
	$isfriend = false;
	if ($user === $myid)
		$isfriend = true;
	else
	{
		$sql = "SELECT * FROM `friends` WHERE `fstatus` != 0 AND `fstatus` != 2 AND `rstatus` != 0 AND `rstatus` != 2 AND ((`rid`=$user AND `fid`=$myid) OR (`fid`=$user AND `rid`=$myid));";
		$data = mysqli_query($db, $sql);
		if ($data)
		{
			$isfriend = mysqli_num_rows($data) != 0;
			if ($isfriend)
			{
				$row = mysqli_fetch_row($data);
				$isfriend = ($row['rid'] == $myid) ? ($row['fstatus'] != 0 && $row['fstatus'] != 2) : ($row['rstatus'] != 0 && $row['rstatus'] != 2);
			}
		} else
		{
			$isfriend = false;
			echo mysqli_error($db);
		}
	}
?>					<div class='side'>
						<div class='post' style='margin-top:0;'>
							<div class='profilegeneral'>
								<div class='userimages'>
									<div class='userbackground' style='display:table;background:url(/profilemedia/sidebar<?php echo $viewdata['id']; ?>/);background-size:cover;'>
										<center style='height:138px;display:table;width:100%;'>
											<div style='display:table-cell;vertical-align:middle;height:inherit;'>
												<div class='profilepic'>
													<a onclick='return pg(this);' href='/profile/<?php echo $viewdata['username']; ?>/'>
														<div class='ppicd'>
															<div class='ppic' style='background-image:url(/profilemedia/avatar<?php echo $viewdata['id']; ?>/)'></div>
														</div>
													</a>
												</div>
											</div>
										</center>
										<center>
											<div class='welcome'>
												<a onclick='return pg(this);' href='/profile/<?php echo $viewdata['username'];?>/' class='usernamel'><?php echo $viewdata['name']; ?></a><br />
											</div>
										</center>
									</div>
								</div>
								<?php if (!$isfriend)
								{
									echo "
									<script type='text/javascript'>function addfriend(el){\$(el).prop('disabled',true);\$(el).html('Friend request sent');\$.get('/tools/kontakt.php?user=$user',function(msg){\$('#errors').append(msg);});}</script>
									<div class='newpostbottom'>
										<button class='button' id='addfriend' onclick='reskontakt($user, this)'>Send friend request</button>
									</div>";
								}?>
							</div>
						</div>
						<div class='post'>
							<div class='postdivtitle'><a onclick='return pg(this);' href='/profile/<?php echo $viewdata['username']; ?>/photos/'>Apps</a></div>
							<div class='subpost'>
								<table class='imagelist' cellspacing="2px">
									<tbody>
										<tr class='imagelist'>
											<?php
												if ($stmt = $db->prepare("SELECT `mediaid` FROM `media` WHERE `uid`=? AND `deleted`=0 ORDER BY `date` DESC LIMIT 8"))
												{
													$stmt->bind_param("i", $viewdata['id']);
													$stmt->execute();
													$result = $stmt->get_result();
													for ($i = 0; $i < mysqli_num_rows($result); $i++)
													{
														if ($i % 4 == 0 && $i != 0)
														{
															echo "</tr><tr class='imagelist'>";
														}
														$img = mysqli_fetch_array($result);
														echo "<td class='imagelist'><div class='imagelist' style='background-image:url(/files/" . $img['mediaid'] . ");' ></div></td>";
													}
													$stmt->close();
												}
											?>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div style='float:right;'>
							<button class='btc' onclick='window.location.href = "bitcoin:1PBx74mu7FMPrZ7Zq79QF68ZWzhdNwqDat?amount=0.00144928&label=Kontakti&message=Donate to Kontakti"'><span></span>Donate</button>
						</div>
					</div>