<?php
  include "logger.inc.php";
  $logger = new Logger();
  
  $jsonData = json_encode([
    'data' => array(
      'logging' =>$logger->isRunning(),
      'connected' => $logger->isConnected()
    )
  ]);
  print_r($jsonData);
?>