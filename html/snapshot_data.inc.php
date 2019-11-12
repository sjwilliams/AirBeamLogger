<?php
  include "get_logged_data.inc.php";
  function slugifyTime($string){
    return str_replace(':', '-', str_replace(" ", '-', strtolower(trim(str_replace("/", '', $string)))));
  }

  class Snapshot {
    function __construct()
    {
       $this->log = new LoggedData(); 
    }

    function logExists()
    {
      return $this->log->fileExists && $this->log->get_length() > 0;
    }

    function snapshot(){
      if($this->logExists()){
        $first = $this->log->get_first();
        $last = $this->log->get_last();
        $archiveFilename = slugifyTime($first['Time'])."_".slugifyTime($last['Time']).".csv";
        echo($archiveFilename);
      }
    }

  }
?>