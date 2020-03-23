<?php
require "util/page.php";
$p = new Page();

$p->setState("kontakts");
$p->setTitle("My Kontakts");
$p->setWallHTML("");
$p->setSetupScript("window.kontakt = new kontakts();registerModule(kontakt);console.log(kontakt);$('#wall').append(kontakt.kontaktrequests.element);$('#wall').append(kontakt.userkontaktrequests.element);$('#wall').append(kontakt.kontakts.element);
cleanup = function(){\$('#wall').get(0).removeChild(kontakt.kontaktrequests.element.get(0));unregisterModule(kontakt);}");
$p->setWallMargins("right");
$p->finish();
?>