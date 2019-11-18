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
    $.ajax({
      type: 'POST',
      url: 'start.php',
      success: function (data) {
        console.log(data);
      },
      error: function (xhr) {
        console.log("error");
      }
    });
  }

  function stop() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'stop.php',
      success: function (data) {
        console.log(data);
      },
      error: function (xhr) {
        console.log("error");
      }
    });
  }

  function snapshot() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'snapshot.php',
      success: function (data) {
        // console.log(data);
        console.log(data);
      },
      error: function (xhr) {
        console.log("error");
      }
    });
  }

  function shutdown() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'shutdown.php',
      success: function (data) {
        console.log(data);
      },
      error: function (xhr) {
        console.log("error");
      }
    });
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
      start: true,
      stop: false,
      snapshot: false,
      shutdown: true
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

    // update status lights in nav
    Object.keys(status).forEach((k) => {
      const $el = $(`#status-${k}`);
      if (!!status[k]) {
        $el.addClass('active').removeClass('inactive');
      } else {
        $el.removeClass('active').addClass('inactive');
      }
    });
    
    // enable and disable buttons as needed
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