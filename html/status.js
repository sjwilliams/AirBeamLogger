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

  // function clear_data() {
  //   $.ajax({
  //     type: 'POST',
  //     data: {},
  //     url: 'clear.php',
  //     success: function (data) {
  //       console.log(data);
  //     },
  //     error: function (xhr) {
  //       console.log("error");
  //     }
  //   });
  // }

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
  // const $clearBtn = $('#clear');
  const $shutdownBtn = $('#shutdown');
  const $snapshot = $('#snapshot');


  $startBtn.on('click', start);
  $stopBtn.on('click', stop);
  $shutdownBtn.on('click', shutdown);
  $snapshot.on('click', snapshot);
  // $clearBtn.on('click', clear_data);


  const $snapshots = $('#snapshots');

  async function setStatus() {
    const status = {
      pi: false,
      logging: false,
      connected: false
    };

    let snapshots = [];

    const serverStatus = await requestJson('/get_status.php');

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


    if(snapshots.length){
      console.log(snapshots);
      $snapshots.show();
      const $ul = $snapshots.find('ul').empty();

      snapshots.forEach((link) => {
        $ul.append(`<li><a href="snapshots/${link}">${link}</a></li>`);
      });
    } else {
      $snapshots.hide();
    }

    console.log('status', status);
    setTimeout(setStatus, 1000);
  }

  setStatus();
});