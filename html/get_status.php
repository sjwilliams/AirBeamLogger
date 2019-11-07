<?php
  exec("ps aux | grep /home/pi/data_logger.py | grep -v grep", $output, $loggerRunning);
  exec("ls -ltr /dev|grep -i ttyACM0", $output, $serialConnected);
  $jsonData = json_encode([
    'data' => array(
      'logging' => $loggerRunning === 0,
      'connected' => $serialConnected === 0
    )
  ]);
  print_r($jsonData);
?>