<?php
  include "get_logged_data.inc.php";
  function slugifyTime($string){
    return str_replace(':', '-', str_replace(" ", '-', strtolower(trim(str_replace("/", '', $string)))));
  }

  class Logger {
    function __construct()
    {
       $this->log = new LoggedData(); 
    }

    function hasLog()
    {
      return $this->log->fileExists && $this->log->get_length() > 0;
    }

    function isRunning()
    {
      exec("ps aux | grep /home/pi/data_logger.py | grep -v grep", $output, $loggerRunning);
      return $loggerRunning === 0;
    }

    function isConnected()
    {
      exec("ls -ltr /dev|grep -i ttyACM0", $output, $serialConnected);
      return $serialConnected === 0;
    }

    function stop(){
      if($this->isRunning()){
        exec('sudo pkill -f "python3 /home/pi/data_logger.py"');
      }
    }

    function start(){
      if(!$this->isRunning() && $this->isConnected()){
        exec("sudo python3 /home/pi/data_logger.py > /dev/null &");
      }
    }

    function snapshot(){
      if($this->hasLog()){
        $first = $this->log->get_first();
        $last = $this->log->get_last();
        $archiveFilename = slugifyTime($first['Time'])."_".slugifyTime($last['Time']).".csv";

        $restart = $this->isRunning();

        $this->stop();
        rename("output.csv", $archiveFilename);

        if($restart){
          $this->start();
        }
      }
    }
  }
?>