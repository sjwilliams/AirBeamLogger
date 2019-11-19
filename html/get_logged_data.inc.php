<?php

// base class with member properties and methods
class LoggedData {

   function __construct($file = "output.csv")
   {
       $this->file = realpath($file);
   }

   function logFileExists()
  {
    return file_exists($this->file) && ($fp = fopen($this->file, "rb"))!==false;
  }

   function get_data($maxNumber = 1000)
   {
      if($this->logFileExists()){

        $csv = $this->get_csv();

        $all = array_map("str_getcsv", explode("\n", $csv)); // csv to array
        $this->properties = array_map('trim', $all[0]); // first row has column names
        array_shift($all); // remove column names, leaving just records
        array_pop($all); // the last line from the CSV is blank, so let's remove that record, too

        $remapData = function ($d){
          global $properties;
          $i = 0;
          foreach ($this->properties as $property ) {
            $newData[ $property ] = $d[$i];
            $i = $i + 1;
          }
        
          return $newData;
        };
        
        $data = array_map($remapData, $all);

        // only return recent data
        $data = (count($data) > $maxNumber ? array_slice($data, $maxNumber * -1) : $data);
        return $data;
      } else {
        return array();
      }
  }

  function get_json($maxNumber = 1000)
  {
    $data = $this->get_data($maxNumber);

    return json_encode([
      'meta' => array('time' => date("Y/m/d g:i:s")),
      'data' => $data
    ]);
  }

  function get_first()
  {
    $data = $this->get_data();
    return $data[0];
  }

  function get_first_json()
  {
    $data = $this->get_first();
    return json_encode([
      'meta' => array('time' => date("Y/m/d g:i:s")),
      'data' => $data
    ]);
  }

  function get_last()
  {
    $data = $this->get_data(1);
    return $data[0];
  }

  function get_last_json()
  {
    $data = $this->get_last();
    return json_encode([
      'meta' => array('time' => date("Y/m/d g:i:s")),
      'data' => $data
    ]);
  }

  function get_length(){
    return count($this->get_data());
  }

  function get_csv()
  {
    $csv = '';

    if($this->logFileExists()){
      if(!isset($this->csv)){
        $this->csv = file_get_contents($this->file);
      }
      $csv = $this->csv;
    } 
    return $csv;
  }
}
?>