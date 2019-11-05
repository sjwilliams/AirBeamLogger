$(function () {

  const $startBtn = $('#start');
  const $stopBtn = $('#stop');
  const $clearBtn = $('#clear');

  const celsius2fahrenheit = (celsius) => {
    return (celsius * (9 / 5)) + 32;
  };

  // const movingAverage = (values, N) => {
  //   let i = 0;
  //   let sum = 0;
  //   const means = new Float64Array(values.length).fill(NaN);
  //   for (let n = Math.min(N - 1, values.length); i < n; ++i) {
  //     sum += values[i];
  //   }
  //   for (let n = values.length; i < n; ++i) {
  //     sum += values[i];
  //     means[i] = sum / N;
  //     sum -= values[i - N + 1];
  //   }
  //   return means;
  // };

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

  const updateChart = (rawData) => {
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
    const data = rawData.map((d) => {
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

    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
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
      return (mx) => {
        const date = x.invert(mx);
        const index = bisect(data, date, 1);
        const a = data[index - 1];
        const b = data[index];
        return date - a.date > b.date - date ? b : a;
      };
    })();

    g.append("g")
      .call(xAxis);

    g.append("g")
      .call(yAxis);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

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

    console.log(data);
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