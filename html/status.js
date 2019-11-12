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
      data: {
        time: Math.round($.now() / 1000)
      },
      url: 'start.php',
      success: function (data) {
        alert(data);
      },
      error: function (xhr) {
        alert("error");
      }
    });
  }

  function stop() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'stop.php',
      success: function (data) {
        alert(data);
      },
      error: function (xhr) {
        alert("error");
      }
    });
  }

  function clear_data() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'clear.php',
      success: function (data) {
        alert(data);
      },
      error: function (xhr) {
        alert("error");
      }
    });
  }

  function shutdown() {
    $.ajax({
      type: 'POST',
      data: {},
      url: 'shutdown.php',
      success: function (data) {
        alert(data);
      },
      error: function (xhr) {
        alert("error");
      }
    });
  }

  function update_settings(setting) {
    if (Math.floor($("#delay").val()) > 0 && Math.floor($("#delay").val()) <= 1440) {
      var use_date = 0;
      if ($("#date").prop('checked')) {
        use_date = 1;
      }
      var use_ntp = 0;
      if ($("#ntp").prop('checked')) {
        use_ntp = 1;
      }

      $.ajax({
        type: 'POST',
        data: {
          type: setting,
          ntp: use_ntp,
          delay: Math.floor($("#delay").val()) * 60,
          date: use_date
        },
        url: 'update_settings.php',
        success: function (data) {
          alert(data);
        },
        error: function (xhr) {
          alert("error");
        }
      });
    }
  }

  // Disable form submission, it's all handled via JavaScript.
  $('#settings').submit(function (e) {
    e.preventDefault();
    return false;
  });


  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $clearBtn = $('#clear');
  const $shutdownBtn = $('#shutdown');


  $startBtn.on('click', start);
  $stopBtn.on('click', stop);
  $shutdownBtn.on('click', shutdown);
  $clearBtn.on('click', clear_data);



  async function setStatus() {
    const status = {
      pi: false,
      logging: false,
      connected: false
    };

    const serverStatus = await requestJson('/get_status.php');

    if (!!serverStatus.data) {
      status.pi = true;
      status.logging = serverStatus.data.logging;
      status.connected = serverStatus.data.connected;
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

    console.log('status', status);
    setTimeout(setStatus, 1000);
  }

  setStatus();
});