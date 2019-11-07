<?php
$file="output.csv";
$maxNumberOfRecords = 1000;

if( file_exists($file) && ($fp = fopen($file, "rb"))!==false ) {
  $csv = file_get_contents($file);
  $all = array_map("str_getcsv", explode("\n", $csv)); // csv to array
  $properties = array_map('trim', $all[0]); // first row has column names
  array_shift($all); // remove column names, leaving just records
  array_pop($all); // the last line from the CSV is blank, so let's remove that record, too

  function remapData($d){
    global $properties;
    $i = 0;
    foreach ($properties as $property ) {
      $newData[ $property ] = $d[$i];
      $i = $i + 1;
    }
  
    return $newData;
  }
  
  $data = array_map('remapData', $all);
  
  // only return recent data
  $data = (count($data) > $maxNumberOfRecords ? array_slice($data, $maxNumberOfRecords * -1) : $data);

  $jsonData = json_encode([
    'meta' => array('time' => date("Y/m/d g:i:s")),
    'data' => $data
  ]);
} else {
  $jsonData = json_encode([
    'errors' => "['No data']"
  ]);
}

print_r($jsonData);
?>

