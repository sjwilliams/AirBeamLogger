<?php
  // include "snapshot_data.inc.php";
  // $snapshot = new Snapshot();
  // $snapshot->snapshot();

  include "logger.inc.php";

  $logger = new Logger();
  var_dump($logger->isRunning());
  var_dump($logger->isConnected());
  var_dump($logger->hasLog());
  $logger->snapshot();
?>

