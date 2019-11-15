<?php
  include "logger.inc.php";
  $logger = new Logger();
  
  $jsonData = json_encode([
    'data' => array(
      'logging' =>$logger->isRunning(),
      'connected' => $logger->isConnected(),
      'snapshots' => $logger->getSnapshots()
    )
  ]);
  print_r($jsonData);
?>