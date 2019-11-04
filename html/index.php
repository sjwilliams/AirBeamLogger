<?php
	// Load JSON settings from file.
	$settings = json_decode(file_get_contents("/home/pi/settings.json"), true);
?>
<!DOCTYPE html>
<html>

<head>
  <title>Data Server</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <h1>Welcome to the Data Server</h1>
  <p><a style="font-size: x-large; font-weight: bold;" href="output.csv">Data File</a></p>
  <p><button onclick="start()">Start Data Logger</button></p>
  <p><button onclick="stop()">Stop Data Logger</button></p>
  <p><button onclick="clear_data()">Clear Data</button></p>
  <p><button onclick="start_shutdown()">Shutdown</button></p>
  <form id="settings">
    <p>
      <input id="delay" type="number" max="1440" min="1" value="<?php echo($settings["delay"] / 60) ?>">
      <button onclick="update_settings(0)">Set Sample Rate (min)</button>
    </p>
    <p>
      <input id="date" type="checkbox" value="date" <?php if ( $settings["date"] == 1 ) echo("checked") ?>
        onclick="update_settings(1)">
      Enable date and time stamp.
    </p>
    <p>
      <input id="ntp" type="checkbox" value="ntp" <?php if ( $settings["ntp"] == 1 ) echo("checked") ?>
        onclick="update_settings(2)">
      Enable NTP time sync.
    </p>
  </form>
<script src="jquery.min.js"></script>
<script src="script.js"></script>
</body>
</html>