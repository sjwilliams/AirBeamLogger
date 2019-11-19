function requestJson(url, options = {}) {
  return fetch(url, options)
    .then(response => response.json())
    .then(jsonResponse => {
      return jsonResponse;
    })
    .catch((error) => {
      return {
        errors: [error.message]
      };
    });
}



$(function () {

  // Create AJAX functions to control the data logger.
  function start() {
    consoleLog('Starting Logger');

    $.ajax({
      type: 'POST',
      url: 'start.php',
      success: function (data) {
        consoleLog(data);
      },
      error: function (xhr) {
        consoleLog("Start error");
      }
    });
  }

  function stop() {
    consoleLog('Stopping Logger');

    $.ajax({
      type: 'POST',
      data: {},
      url: 'stop.php',
      success: function (data) {
        consoleLog(`${data}`);
      },
      error: function (xhr) {
        consoleLog("Stop error");
      }
    });
  }

  function snapshot() {
    consoleLog('Starting Snapshot');

    $.ajax({
      type: 'POST',
      data: {},
      url: 'snapshot.php',
      success: function (data) {
        console.log(data);
        consoleLog(`Generated Snapshot: ${data}`);
      },
      error: function (xhr) {
        consoleLog("Snapshot error");
      }
    });
  }

  function shutdown() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'shutdown.php',
      success: function (data) {
        consoleLog(data);
      },
      error: function (xhr) {
        consoleLog("Shutdown error");
      }
    });
  }

  const $console = $('#console');

  function consoleLog(msg){
    const $msg = $(`<li>$ ${msg}</li>`);
    $console.find('ul').prepend($msg);

    setTimeout(function(){
      $msg.remove();
    }, 3000);
  }

  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $shutdownBtn = $('#shutdown');
  const $snapshot = $('#snapshot');


  $startBtn.on('click', start);
  $stopBtn.on('click', stop);
  $shutdownBtn.on('click', shutdown);
  $snapshot.on('click', snapshot);

  const $snapshots = $('#snapshots');

  async function setStatus() {
    const status = {
      pi: false,
      logging: false,
      connected: false
    };

    const buttonStates = {
      start: false,
      stop: false,
      snapshot: false,
      shutdown: false
    };

    
    const serverStatus = await requestJson('/get_status.php');
    let snapshots = [];

    if (!!serverStatus.data) {
      status.pi = true;
      status.logging = serverStatus.data.logging;
      status.connected = serverStatus.data.connected;

      if(serverStatus.data.snapshots && serverStatus.data.snapshots.length > 0){
        snapshots = serverStatus.data.snapshots;
      }
    }

    // update button states
    if(status.pi){
      buttonStates.shutdown = true;
      if(status.connected){
        if(status.logging){
          buttonStates.stop = true;
          buttonStates.snapshot = true;
        } else {
          buttonStates.start = true;
        }
      }
    }

    // update status lights in nav
    Object.keys(status).forEach((k) => {
      const $el = $(`#status-${k}`);
      if (!!status[k]) {
        $el.addClass('active').removeClass('inactive');
      } else {
        $el.removeClass('active').addClass('inactive');
      }
    });


    // enable and disable buttons in UI as needed
    Object.keys(buttonStates).forEach((k) => {
      const $button = $(`button#${k}`);
      if(buttonStates[k]){
        $button.removeAttr('disabled');
      } else {
        $button.attr('disabled', true);
      }
    });

    // show snapshot downloads
    if(snapshots.length){
      $snapshots.show();
      const $table = $snapshots.find('table');

      snapshots.forEach((snapshot) => {
        const $row = $table.find(`#file-${snapshot.basename}`);
        if(!$row.length){
          $table.append(`<tr id="file-${snapshot.basename}"><td><a href="snapshots/${snapshot.name}">${snapshot.name}</a></td><td>${snapshot.size}</td></tr>`);
        }
      });
    } else {
      $snapshots.hide();
    }

    // console.log('status', status);
    setTimeout(setStatus, 1000);
  }

  setStatus();
});