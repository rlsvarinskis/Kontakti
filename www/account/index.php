<?php
require "../util/page.php";
$p = new Page();
$p->setTitle("Edit profile");
$p->setState("editprofile");

ob_start();
include "../util/notifications.php";
$notifications=ob_get_contents();
ob_end_clean();
if ($notifications === 'null')
	$notifications = "Enable";
else
	$notifications = "Disable";

$p->setWallHTML("
<script type='text/javascript' src='/js/profileedit.js'></script>
<div class='post'>
	<div class='seper'>
		<div class='sepertitle'>Customize your profile</div>
		<table style='margin-left:3px;border-spacing: 10px;'>
			<tbody>
				<tr>
					<td style='vertical-align:top;'>
						Photo:
					</td>
					<td>
						<div onpaste='pasteHandler(event, this)' id='1' style='overflow:hidden;padding:0;width:98px;height:98px;background-color:#eee;border:1px solid #5772D4;border-radius:5px;' class='profilepicture'></div>
					</td>
					<td>
						<form style='margin-bottom:0;' id='fawrm1'>
							<input type='hidden' style='display:none;' id='imgdataurl1' name='imgdataurl1' />
							<input accept='image/*' type='file' name='img1' id='img1' onchange='readImage(this, 1)' />
						</form>
						<button style='width:110px;' class='button' id='reset1' onclick='resetImg(1)'>Reset picture</button><br />
						<button style='width:110px;' class='button' id='clear1' onclick='clearImg(1)'>Default picture</button><br />
						<button style='width:110px;' class='button' id='submit1' onclick='submitIt(1)'>Change</button>
					</td>
				</tr>
				<tr>
					<td style='vertical-align:top;'>
						Sidebar:
					</td>
					<td>
						<div onpaste='pasteHandler(event, this)' id='2' style='overflow:hidden;padding:0;width:98px;height:98px;background-color:#eee;border:1px solid #5772D4;border-radius:5px;' class='profilepicture'></div>
					</td>
					<td>
						<form style='margin-bottom:0;' id='fawrm2'>
							<input type='hidden' style='display:none;' id='imgdataurl2' name='imgdataurl2' />
							<input accept='image/*' type='file' name='img2' id='img2' onchange='readImage(this, 2)' />
						</form>
						<button style='width:110px;' class='button' id='reset2' onclick='resetImg(2)'>Reset picture</button><br />
						<button style='width:110px;' class='button' id='clear1' onclick='clearImg(2)'>Default picture</button><br />
						<button style='width:110px;' class='button' id='submit2' onclick='submitIt(2)'>Change</button>
					</td>
				</tr>
				<tr>
					<td style='vertical-align:top;'>
						Background:
					</td>
					<td>
						<div id='bgc' style='overflow:hidden;padding:0;width:98px;height:50px;background-color:#" . "ABCDEF" . ";border:1px solid #5772D4;border-radius:5px;'></div>
					</td>
					<td>
						<input onfocus=\"$('.colors').show();\" style='padding:5px;border: 1px solid gray;border-radius:3px;font-size:14px;' type='text' id='bgcol' placeholder='#ABCDEF' />
						<style>.colors li{border: 1px solid #FFF;padding:5px;border-radius: 5px;}.colors li:hover{border: 1px solid #000;opacity: 0.7;cursor: pointer;}.colors li:active{opacity: 0.5;}.colors{list-style:none;display:block;height:300px;overflow-y:scroll;margin:0;padding:0;width:164px;border:solid 1px gray;position:absolute;z-index:10000;background:white;margin-bottom:5px;display:none;}</style><ul class='colors'><li style='background-color:#ABCDEF;'>#ABCDEF</li><li style='background-color:#F0F8FF;'>#F0F8FF</li><li style='background-color:#FAEBD7;'>#FAEBD7</li><li style='background-color:#00FFFF;'>#00FFFF</li><li style='background-color:#7FFFD4;'>#7FFFD4</li><li style='background-color:#F0FFFF;'>#F0FFFF</li><li style='background-color:#F5F5DC;'>#F5F5DC</li><li style='background-color:#FFE4C4;'>#FFE4C4</li><li style='background-color:#000000;'>#000000</li><li style='background-color:#FFEBCD;'>#FFEBCD</li><li style='background-color:#0000FF;'>#0000FF</li><li style='background-color:#8A2BE2;'>#8A2BE2</li><li style='background-color:#A52A2A;'>#A52A2A</li><li style='background-color:#DEB887;'>#DEB887</li><li style='background-color:#5F9EA0;'>#5F9EA0</li><li style='background-color:#7FFF00;'>#7FFF00</li><li style='background-color:#D2691E;'>#D2691E</li><li style='background-color:#FF7F50;'>#FF7F50</li><li style='background-color:#6495ED;'>#6495ED</li><li style='background-color:#FFF8DC;'>#FFF8DC</li><li style='background-color:#DC143C;'>#DC143C</li><li style='background-color:#00FFFF;'>#00FFFF</li><li style='background-color:#00008B;'>#00008B</li><li style='background-color:#008B8B;'>#008B8B</li><li style='background-color:#B8860B;'>#B8860B</li><li style='background-color:#A9A9A9;'>#A9A9A9</li><li style='background-color:#006400;'>#006400</li><li style='background-color:#BDB76B;'>#BDB76B</li><li style='background-color:#8B008B;'>#8B008B</li><li style='background-color:#556B2F;'>#556B2F</li><li style='background-color:#FF8C00;'>#FF8C00</li><li style='background-color:#9932CC;'>#9932CC</li><li style='background-color:#8B0000;'>#8B0000</li><li style='background-color:#E9967A;'>#E9967A</li><li style='background-color:#8FBC8F;'>#8FBC8F</li><li style='background-color:#483D8B;'>#483D8B</li><li style='background-color:#2F4F4F;'>#2F4F4F</li><li style='background-color:#00CED1;'>#00CED1</li><li style='background-color:#9400D3;'>#9400D3</li><li style='background-color:#FF1493;'>#FF1493</li><li style='background-color:#00BFFF;'>#00BFFF</li><li style='background-color:#696969;'>#696969</li><li style='background-color:#1E90FF;'>#1E90FF</li><li style='background-color:#B22222;'>#B22222</li><li style='background-color:#FFFAF0;'>#FFFAF0</li><li style='background-color:#228B22;'>#228B22</li><li style='background-color:#FF00FF;'>#FF00FF</li><li style='background-color:#DCDCDC;'>#DCDCDC</li><li style='background-color:#F8F8FF;'>#F8F8FF</li><li style='background-color:#FFD700;'>#FFD700</li><li style='background-color:#DAA520;'>#DAA520</li><li style='background-color:#808080;'>#808080</li><li style='background-color:#008000;'>#008000</li><li style='background-color:#ADFF2F;'>#ADFF2F</li><li style='background-color:#F0FFF0;'>#F0FFF0</li><li style='background-color:#FF69B4;'>#FF69B4</li><li style='background-color:#CD5C5C;'>#CD5C5C</li><li style='background-color:#4B0082;'>#4B0082</li><li style='background-color:#FFFFF0;'>#FFFFF0</li><li style='background-color:#F0E68C;'>#F0E68C</li><li style='background-color:#E6E6FA;'>#E6E6FA</li><li style='background-color:#FFF0F5;'>#FFF0F5</li><li style='background-color:#7CFC00;'>#7CFC00</li><li style='background-color:#FFFACD;'>#FFFACD</li><li style='background-color:#ADD8E6;'>#ADD8E6</li><li style='background-color:#F08080;'>#F08080</li><li style='background-color:#E0FFFF;'>#E0FFFF</li><li style='background-color:#FAFAD2;'>#FAFAD2</li><li style='background-color:#D3D3D3;'>#D3D3D3</li><li style='background-color:#90EE90;'>#90EE90</li><li style='background-color:#FFB6C1;'>#FFB6C1</li><li style='background-color:#FFA07A;'>#FFA07A</li><li style='background-color:#20B2AA;'>#20B2AA</li><li style='background-color:#87CEFA;'>#87CEFA</li><li style='background-color:#778899;'>#778899</li><li style='background-color:#B0C4DE;'>#B0C4DE</li><li style='background-color:#FFFFE0;'>#FFFFE0</li><li style='background-color:#00FF00;'>#00FF00</li><li style='background-color:#32CD32;'>#32CD32</li><li style='background-color:#FAF0E6;'>#FAF0E6</li><li style='background-color:#FF00FF;'>#FF00FF</li><li style='background-color:#800000;'>#800000</li><li style='background-color:#66CDAA;'>#66CDAA</li><li style='background-color:#0000CD;'>#0000CD</li><li style='background-color:#BA55D3;'>#BA55D3</li><li style='background-color:#9370DB;'>#9370DB</li><li style='background-color:#3CB371;'>#3CB371</li><li style='background-color:#7B68EE;'>#7B68EE</li><li style='background-color:#00FA9A;'>#00FA9A</li><li style='background-color:#48D1CC;'>#48D1CC</li><li style='background-color:#C71585;'>#C71585</li><li style='background-color:#191970;'>#191970</li><li style='background-color:#F5FFFA;'>#F5FFFA</li><li style='background-color:#FFE4E1;'>#FFE4E1</li><li style='background-color:#FFE4B5;'>#FFE4B5</li><li style='background-color:#FFDEAD;'>#FFDEAD</li><li style='background-color:#000080;'>#000080</li><li style='background-color:#FDF5E6;'>#FDF5E6</li><li style='background-color:#808000;'>#808000</li><li style='background-color:#6B8E23;'>#6B8E23</li><li style='background-color:#FFA500;'>#FFA500</li><li style='background-color:#FF4500;'>#FF4500</li><li style='background-color:#DA70D6;'>#DA70D6</li><li style='background-color:#EEE8AA;'>#EEE8AA</li><li style='background-color:#98FB98;'>#98FB98</li><li style='background-color:#AFEEEE;'>#AFEEEE</li><li style='background-color:#DB7093;'>#DB7093</li><li style='background-color:#FFEFD5;'>#FFEFD5</li><li style='background-color:#FFDAB9;'>#FFDAB9</li><li style='background-color:#CD853F;'>#CD853F</li><li style='background-color:#FFC0CB;'>#FFC0CB</li><li style='background-color:#DDA0DD;'>#DDA0DD</li><li style='background-color:#B0E0E6;'>#B0E0E6</li><li style='background-color:#800080;'>#800080</li><li style='background-color:#FF0000;'>#FF0000</li><li style='background-color:#BC8F8F;'>#BC8F8F</li><li style='background-color:#4169E1;'>#4169E1</li><li style='background-color:#8B4513;'>#8B4513</li><li style='background-color:#FA8072;'>#FA8072</li><li style='background-color:#F4A460;'>#F4A460</li><li style='background-color:#2E8B57;'>#2E8B57</li><li style='background-color:#FFF5EE;'>#FFF5EE</li><li style='background-color:#A0522D;'>#A0522D</li><li style='background-color:#C0C0C0;'>#C0C0C0</li><li style='background-color:#87CEEB;'>#87CEEB</li><li style='background-color:#6A5ACD;'>#6A5ACD</li><li style='background-color:#708090;'>#708090</li><li style='background-color:#FFFAFA;'>#FFFAFA</li><li style='background-color:#00FF7F;'>#00FF7F</li><li style='background-color:#4682B4;'>#4682B4</li><li style='background-color:#D2B48C;'>#D2B48C</li><li style='background-color:#008080;'>#008080</li><li style='background-color:#D8BFD8;'>#D8BFD8</li><li style='background-color:#FF6347;'>#FF6347</li><li style='background-color:#40E0D0;'>#40E0D0</li><li style='background-color:#EE82EE;'>#EE82EE</li><li style='background-color:#F5DEB3;'>#F5DEB3</li><li style='background-color:#FFFFFF;'>#FFFFFF</li><li style='background-color:#F5F5F5;'>#F5F5F5</li><li style='background-color:#FFFF00;'>#FFFF00</li><li style='background-color:#9ACD32;'>#9ACD32</li></ul>
						<br />
						<button class='button' id='defaultBG' onclick=\"\$('#bgc').get(0).style.backgroundColor='#ABCDEF';document.body.style.backgroundColor='#ABCDEF';\">Default</button><button class='button' id='buttonCheckBG' onclick=\"var bgc = $('#bgcol').val();document.body.style.backgroundColor=bgc;\">Check</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<script type='text/javascript'>resetAll();</script>
	<div class='seper'>
		<div class='sepertitle'>Dekstop notifications</div>
		<button class='button' id='desktop' onclick='desktop()'>" . $notifications . "</button>
	</div>
</div>");
$p->setWallMargins('right');
$p->finish();
?>