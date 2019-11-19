<!DOCTYPE html>
<html>

<head>
  <title>AirBeam - <?php echo gethostname() ?></title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <header>
      <h1>Logger: <?php echo gethostname() ?></h1>
      <ul id="status" class="status info">
        <li id="status-pi">Pi</li>
        <li id="status-connected">AirBeam</li>
        <li id="status-logging">Logging</li>
      </ul>
  </header>  



  <section id="controls">
    <p><button id="start">Start</button></p>
    <p><button id="stop">Stop</button></p>
    <p><button id="snapshot">Snapshot</button></p>
    <p><button id="shutdown">Shutdown Pi</button></p>
  </section>

  <section id="console">
    <ul>
      
    </ul>
  </section>

  <section id="data">
    <h2>Currently</h2>
    <ul id="measurements" class="measurements">
      <li id="pm10"><span></span></li>
      <li id="pm25"><span></span></li>
      <li id="pm1"><span></span></li>
    </ul>

    <p><a href="output.csv">Download</a></p>
  </section>

  <section id="snapshots">
    <h2>Archive Data</h2>
    <table>
      <tr>
        <th>
          Name
        </th>
        <th>
          Size
        </th>
      </tr>

    </table>
  </section>



  <script src="jquery.min.js"></script>
  <script src="d3.js"></script>
  <!-- <script src="data.js"></script> -->
  <script src="status.js"></script>
</body>
</html>