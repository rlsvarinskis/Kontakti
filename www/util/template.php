<html>
	<head>
		<?php include "head.php"; ?>
		<title><?php echo $title; ?></title>
	</head>
	
	<body>
		<div class="body">
			<?php include "nav.php"; ?>
							
			<div class="container">
				<div class="content" id='content'>
					<?php echo $string; ?>
				</div>
			</div>
		</div>
		<div class="footer" id="footer">
			<div class="innerfooter"><footer><?php include "footer.php"; ?></footer></div>
		</div>
	</body>
</html>
<?php header("Content-type: text/html"); ?>