<?php
require "util/page.php";
$p = new Page();

$p->setWallMargins("right");

$p->setTitle("New Object");
$p->setState("newobject");
$p->setWallHTML("
<style>
	.objecttype
	{
		width:25%;
		height:200px;
		text-align:center;
		border:solid 1px white;
		cursor:pointer;
		font-family: 'Open Sans';
		background-color: #eee;
		opacity: 0.8;
	}
	.objecttype:hover
	{
		opacity: 1;
	}
	.wall
	{
		margin-right: 0;
		margin-left: 0;
	}
</style>
<div class='post'>
	<div class='seper'>
		<div class='sepertitle'>Choose your Object&trade; type</div>
		<table style='background-color:#ddd;width:100%;border-spacing:2px;'>
			<tbody>
				<tr>
					<td class='objecttype' id='o1'>
						Local Business or Place
					</td>
					<td class='objecttype' id='o2'>
						Company, Organization or Institution
					</td>
					<td class='objecttype' id='o3'>
						Brand or Product
					</td>
					<td class='objecttype' id='o4'>
						Celebrity or Public Figure
					</td>
				</tr>
				<tr>
					<td class='objecttype' id='o5'>
						Entertainment
					</td>
					<td class='objecttype' id='o6'>
						Cause, Movement or Community
					</td>
					<td class='objecttype' id='o7'>
						Website/application
					</td>
					<td class='objecttype' id='o8'>
						Country/State
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>");
$p->finish();
?>