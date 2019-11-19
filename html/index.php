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

  <section id="data">
    <ul id="measurements" class="measurements">
      <li id="pm10"><span></span></li>
      <li id="pm25"><span></span></li>
      <li id="pm1"><span></span></li>
    </ul>
    
  </section>

  <section id="controls">
    <p><button id="start">Start</button></p>
    <p><button id="stop">Stop</button></p>
    <p><a class="button" href="output.csv">Download Data</a></p>
    
  </section>

  <section id="advanced" class="advanced">
    <h3>Advanced</h3>
    <div class="advanced-inner">
      <p><button class="advanced-reveal">Show</button></p>
      <div class="advanced-list">
        <p><button id="snapshot">Snapshot</button></p>
        <p><button class="button-alert" id="shutdown">Shutdown Pi</button></p>
      </div>
    </div>
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
  <script src="status.js" type="module"></script>
  <script src="data.js" type="module"></script>
</body>
</html>