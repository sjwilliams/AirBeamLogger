$(function () {

  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $clearBtn = $('#clear');

  const celsius2fahrenheit = (celsius) => {
    return (celsius * (9 / 5)) + 32;
  };

  const movingAverage = (values, N) => {
    let i = 0;
    let sum = 0;
    const means = new Float64Array(values.length).fill(NaN);
    for (let n = Math.min(N - 1, values.length); i < n; ++i) {
      sum += values[i];
    }
    for (let n = values.length; i < n; ++i) {
      sum += values[i];
      means[i] = sum / N;
      sum -= values[i - N + 1];
    }
    return means;
  };

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

  function start_shutdown() {
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

  const updateChart = (data) => {
    const svg = d3.select("svg");
    

    const margin = {
      top: 20,
      right: 20,
      bottom: 10,
      left: 20
    };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;


    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const parseTime = d3.timeParse("%Y/%m/%d %H:%M:%S");

    // prep data
    const processedData = data.map((d) => {
      const celsius = parseInt(d['Temperature (C)']);
      return {
        celsius,
        date: parseTime(d.Time),
        fahrenheit: Math.round(celsius2fahrenheit(celsius)),
        pm25: parseInt(d['PM2.5']),
        pm10: parseInt(d['PM10']),
        pm1: parseInt(d['PM1']),
        rh: parseInt(d['%RH']),
        value: parseInt(d['PM2.5']),
      };
    });

    // const x = d3.scaleTime()
    //   .rangeRound([0, width]);

    const x = d3.scaleUtc()
      .domain(d3.extent(processedData, d => d.date))
      .range([margin.left, width - margin.right]);

    // const y = d3.scaleLinear()
    //   .rangeRound([height, 0]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value)]).nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y));
        
    const line = d3.line()
      .defined(d => !isNaN(d.value))
      .x(d => x(d.date))
      .y(d => y(d.value));





    g.append("g")
      .call(xAxis);

    g.append("g")
      .call(yAxis);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    console.log(processedData);
  };

  const update = () => {
    d3.json("/get_data.php").then(function (json) {
      const hasData = !!json.data;

      if (hasData) {
        $clearBtn.removeAttr('disabled');
        updateChart(json.data);
      } else {
        $clearBtn.addAttr('disabled');
      }

      // setTimeout(update, 10000);
    });
  };

  // Disable form submission, it's all handled via JavaScript.
  $('#settings').submit(function (e) {
    e.preventDefault();
    return false;
  });

  $startBtn.on('click', () => {
    console.log('click');
    start();
  });

  $stopBtn.on('click', () => {

  });


  update();
});