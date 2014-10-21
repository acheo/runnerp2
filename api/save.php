<?php

$data = array();

$hash = $_POST["hash"];
$savedata = $_POST["savedata"];

$myfile = fopen($hash.".json", "w") or die("Unable to open file!");
fwrite($myfile, $savedata);
fclose($myfile);

$data["msg"] = "ok";
$data["path"] = realpath('.');

echo json_encode($data);

?>