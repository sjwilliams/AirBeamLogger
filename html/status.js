import {log} from './utils.js';


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
    log('Starting Logger');

    $.ajax({
      type: 'POST',
      url: 'start.php',
      success: function (data) {
        log(data);
      },
      error: function (xhr) {
        log("Start error");
      }
    });
  }

  function stop() {
    log('Stopping Logger');

    $.ajax({
      type: 'POST',
      data: {},
      url: 'stop.php',
      success: function (data) {
        log(`${data}`);
      },
      error: function (xhr) {
        log("Stop error");
      }
    });
  }

  function snapshot() {
    log('Starting Snapshot');

    $.ajax({
      type: 'POST',
      data: {},
      url: 'snapshot.php',
      success: function (data) {
        console.log(data);
        log(`Generated Snapshot: ${data}`);
      },
      error: function (xhr) {
        log("Snapshot error");
      }
    });
  }

  function shutdown() {
    log('Starting Shutdown');

    $.ajax({
      type: 'POST',
      data: {},
      url: 'shutdown.php',
      success: function (data) {
        log(data);
      },
      error: function (xhr) {
        log("Shutdown error");
      }
    });
  }

  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $shutdownBtn = $('#shutdown');
  const $snapshot = $('#snapshot');

  const $advanced = $('#advanced');

  $startBtn.on('click', start);
  $stopBtn.on('click', stop);
  $shutdownBtn.on('click', shutdown);
  $snapshot.on('click', snapshot);

  $('.advanced-reveal').on('click', function(){
    const $el = $(this);

    if($advanced.hasClass('active')){
      $advanced.removeClass('active');
      $el.html('Show');
    } else {
      $advanced.addClass('active');
      $el.html('Hide');
    }
  });

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

      window.AIRBEAM_STATUS = status;
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