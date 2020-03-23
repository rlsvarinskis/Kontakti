<?php
	echo "Continent code: " . geoip_continent_code_by_name($_SERVER['REMOTE_ADDR']) . "<br />";
	echo "Country name: " . geoip_country_name_by_name($_SERVER['REMOTE_ADDR']) . "<br />";
	echo "Country code: " . geoip_country_code_by_name($_SERVER['REMOTE_ADDR']) . "<br />";
	echo "Country 3 letter code: " . geoip_country_code3_by_name($_SERVER['REMOTE_ADDR']) . "<br />";
?>