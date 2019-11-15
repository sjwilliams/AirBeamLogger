<!DOCTYPE html>
<html>

<head>
  <title>AirBeam</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <header>
      
      <h1>AirBeam Data Logger</h1>
      <ul id="status" class="status info">
        <li id="status-pi">Pi</li>
        <li id="status-connected">AirBeam</li>
        <li id="status-logging">Logging</li>
      </ul>
  </header>  

  <section id="data">
    <ul id="measurements" class="measurements">
      <li id="pm10"><span></span></li>
      <li id="pm25"><span></span></li>
      <li id="pm1"><span></span></li>
    </ul>
    <div id="chart">
      <svg></svg>
    </div>
  </section>

  <section id="snapshots">
    <ul>
      
    </ul>
  </section>

  <section id="controls">
    <p><button id="start">Start</button></p>
    <p><button id="stop">Stop</button></p>
    <p><button id="snapshot">Snapshot</button></p>
    <p><button id="shutdown">Shutdown Pi</button></p>
  </section>

  <script src="jquery.min.js"></script>
  <script src="d3.js"></script>
  <script src="chart.js"></script>
  <script src="status.js"></script>
</body>
</html>