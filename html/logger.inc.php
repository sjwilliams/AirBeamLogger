<?php
  include "get_logged_data.inc.php";
  
  function slugifyTime($string){
    return str_replace(':', '-', str_replace(" ", '-', strtolower(trim(str_replace("/", '', $string)))));
  }

  function exists($file){
    return file_exists($file) && ($fp = fopen($file, "rb"))!==false;
  }

  // sort snapshots by name
  function snapshotSorter($a, $b){
    return strcmp($a["basename"], $b["basename"]);
  }

  class Logger {
    function __construct()
    {
       $this->log = new LoggedData(); 

       $this->snapshotDir = realpath("./snapshots");
    }

    function hasLog()
    {
      return $this->log->logFileExists() && $this->log->get_length() > 0;
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
        $snapMsg = $this->snapshot();
        return $snapMsg . "<br> Logger Stopped";
      }
    }

    function start(){
      if(!$this->isRunning() && $this->isConnected()){
        exec("sudo python3 /home/pi/data_logger.py > /dev/null &");
        return "Logger Started";
      }
    }

    function getSnapshots(){
      $files = array();

      foreach (new DirectoryIterator($this->snapshotDir) as $file) {
        if ($file->isFile() && $file->getExtension() === "csv") {
            array_push($files, array(
              "name" => $file->getFilename(),
              "basename" => $file->getBasename(".csv"),
              "size" => $file->getSize()
            ));
        }
      }

      usort($files, "snapshotSorter");
      return $files;
    }

    function snapshot(){
      if($this->hasLog()){
        $restart = $this->isRunning();
        $first = $this->log->get_first();
        $last = $this->log->get_last();
        $archiveFilename = gethostname() . "_" . slugifyTime($first['Time'])."_".slugifyTime($last['Time']).".csv";
        
        $this->stop();
        rename($this->log->file, "{$this->snapshotDir}/{$archiveFilename}");

        if(exists('/home/pi/output.csv')){
          exec("sudo rm /home/pi/output.csv");
        }

        if(exists('/var/www/html/output.csv')){
          exec("sudo rm /var/www/html/output.csv");
        }

        if($restart){
          $this->start();
        }

        return $archiveFilename . " created";
      } else {
        return "No log to snapshot";
      }
    }
  }
?>