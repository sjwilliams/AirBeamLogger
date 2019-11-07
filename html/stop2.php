<?php
  include "get_logged_data.inc.php";
  function slugifyTime($string){
    return str_replace(':', '-', str_replace(" ", '-', strtolower(trim(str_replace("/", '', $string)))));
  }

  $log = new LoggedData();
  if($log->fileExists && $log->get_length() > 0){
    $first = $log->get_first();
    $last = $log->get_last();

    $archiveFilename = slugifyTime($first['Time'])."_".slugifyTime($last['Time']).".csv";
    echo($archiveFilename);
  }
?>

