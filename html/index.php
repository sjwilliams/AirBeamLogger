<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>AirBeam - <?php echo gethostname() ?></title>
  <link rel="stylesheet" href="style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
  <header>
      <h1><?php echo gethostname() ?></h1>
      <ul id="status" class="status info">
        <li id="status-pi">Pi</li>
        <li id="status-connected">AirBeam</li>
        <li id="status-logging">Logging</li>
      </ul>
  </header>  

  <section id="console">
    <ul></ul>
  </section>

  <section id="controls">
    <p><button id="start">Start</button></p>
    <p><button id="stop">Stop</button></p>
    <p><button id="snapshot">Snapshot</button></p>
    <p><button id="shutdown">Shutdown Pi</button></p>
  </section>



  <section id="data">
    <h2>Current Measurements</h2>
    <ul id="measurements" class="measurements">
      <li id="pm10"><span></span></li>
      <li id="pm25"><span></span></li>
      <li id="pm1"><span></span></li>
    </ul>
    
    <p><a href="output.csv">Download Data</a></p>
  </section>

  <section id="snapshots">
    <h2>Previous Snapshots</h2>
    <table>
      <tr>
        <th> Name </th>
        <th> Size </th>
      </tr>
    </table>
  </section>



  <script src="jquery.min.js"></script>
  <script src="d3.js"></script>
  <script src="data.js"></script>
  <script src="status.js"></script>
</body>
</html>