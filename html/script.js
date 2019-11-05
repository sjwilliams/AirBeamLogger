$(function () {

  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $clearBtn = $('#clear');
  const $shutdownBtn = $('#shutdown');

  const celsius2fahrenheit = (celsius) => {
    return (celsius * (9 / 5)) + 32;
  };

  let serverRunning = false;
  let svg;
  let g;
  let gAxis;
  let gLines;
  let pathPm25;
  let width;
  let height;
  let x;
  let y;
  let xAxis;
  let yAxis;

  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 20
  };

  const parseTime = d3.timeParse("%Y/%m/%d %H:%M:%S");

  const line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y(d => y(d.value));

  const prepChartData = (rawData) => {
    return rawData.map((d) => {
      const celsius = parseInt(d['Temperature (C)']);
      return {
        celsius,
        date: parseTime(d.Time),
        fahrenheit: Math.round(celsius2fahrenheit(celsius)),
        pm25: parseInt(d['PM2.5']),
        pm10: parseInt(d['PM10']),
        pm1: parseInt(d['PM1']),
        rh: parseInt(d['%RH'])
      };
    });
  };

  const getDataByPollutionType = (type, data) => {
    return data.map((d) => {
      return {
        date: d.date,
        value: d[type]
      };
    });
  };

  const buildChart = (data) => {
    svg = d3.select("svg");
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    y = d3.scaleLinear()
      .domain([0, d3.max(getDataByPollutionType('pm25', data), d => d.value)]).nice() // todo: update to max of all pollution max values
      .range([height - margin.bottom, margin.top]);

    xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y));


    // tooltips
    const callout = (g, value) => {
      if (!value) return g.style("display", "none");

      g
        .style("display", null)
        .style("pointer-events", "none")
        .style("font", "10px sans-serif");

      const path = g.selectAll("path")
        .data([null])
        .join("path")
        .attr("fill", "white")
        .attr("stroke", "black");

      const text = g.selectAll("text")
        .data([null])
        .join("text")
        .call(text => text
          .selectAll("tspan")
          .data((value + "").split(/\n/))
          .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .style("font-weight", (_, i) => i ? null : "bold")
          .text(d => d));

      const {
        x,
        y,
        width: w,
        height: h
      } = text.node().getBBox();

      text.attr("transform", `translate(${-w / 2},${15 - y})`);
      path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    };

    const bisect = (() => {
      const bisect = d3.bisector(d => d.date).left;
      const dTmp = getDataByPollutionType('pm25', data); // todo: update 
      return (mx) => {
        const date = x.invert(mx);
        const index = bisect(dTmp, date, 1);
        const a = dTmp[index - 1];
        const b = dTmp[index];
        return date - a.date > b.date - date ? b : a;
      };
    })();

    // monitor mouse for tooltip
    const tooltip = g.append("g");

    g.on("touchmove mousemove", function () {
      const {
        date,
        value
      } = bisect(d3.mouse(this)[0]);
      console.log('date', date);
      tooltip
        .attr("transform", `translate(${x(date)},${y(value)})`)
        .call(callout, `${date.toLocaleString(undefined, 
          {
            month: "short", 
            day: "numeric", 
            year: "numeric", 
            hour: "numeric", 
            minute: "numeric", 
            second: "numeric",
            timeZoneName: "short",
            // timeZone: "UTC"
          }
        )
      }`);
    });

    svg.on("touchend mouseleave", () => tooltip.call(callout, null));


    // append axis
    gAxis = g.append("g")
      .attr('id', 'axis');

    gAxis.append("g")
      .attr('id', 'axis-x')
      .call(xAxis);

    gAxis.append("g")
      .attr('id', 'axis-y')
      .call(yAxis);

    // append line charts
    gLines = g.append("g")
      .attr('id', 'lines');
  
    pathPm25 = gLines.append("path")
      .datum(getDataByPollutionType('pm25', data))
      .attr("id", "line-pm25")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

  };

  const updateChart = (rawData) => {
    const data = prepChartData(rawData);

    if (!svg) {
      buildChart(data);
    }



    console.log(data);
  };

  const update = () => {
    // $startBtn
    // $stopBtn
    d3.json("/get_data.php").then(function (json) {
      const hasData = !!json.data;

      if (hasData) {
        $clearBtn.removeAttr('disabled');
        $stopBtn.removeAttr('disabled');
        $startBtn.attr('disabled', true);
        console.log($startBtn);
        updateChart(json.data);
      } else {
        $clearBtn.attr('disabled', true);
      }

      // setTimeout(update, 10000);
    });
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



  // Disable form submission, it's all handled via JavaScript.
  $('#settings').submit(function (e) {
    e.preventDefault();
    return false;
  });

  $startBtn.on('click', start);
  $stopBtn.on('click', stop);
  $clearBtn.on('click', clear_data);
  $shutdownBtn.on('click', start_shutdown);

  update();
});