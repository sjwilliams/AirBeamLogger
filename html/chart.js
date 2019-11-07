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

  const celsius2fahrenheit = (celsius) => {
    return (celsius * (9 / 5)) + 32;
  };

  // const pollutants = ['pm25', 'pm10', 'pm1'];
  const thresholds = {
    'pm25': [12, 35, 55, 150],
    'pm10': [20, 50, 100, 200],
    'pm1': [12, 35, 55, 150]
  };

  const pollutants = Object.keys(thresholds);

  let svg;
  let g;
  let gAxis;
  let gLines;
  let width;
  let height;
  let x;
  let y;
  let xAxis;
  let gXAxis;
  let yAxis;
  let gYAxis;

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

  const getMaxValueForAllTypes = (data) => {
    let values = [];
    pollutants.forEach((pollutant) => {
      values = values.concat(getDataByPollutionType(pollutant, data));
    });
    return d3.max(values, d => d.value);
  };

  const getPollutantWithHighestValue = (data) => {
    let highestSlug;
    let highestValue;
    pollutants.forEach((pollutant) => {
      const value = d3.max(getDataByPollutionType(pollutant, data), d => d.value);
      if (!highestValue || highestValue < value) {
        highestValue = value;
        highestSlug = pollutant;
      }
    });

    return {
      slug: highestSlug,
      value: highestValue
    };
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
      .domain([0, getMaxValueForAllTypes(data)]).nice() // todo: update to max of all pollution max values
      .range([height - margin.bottom, margin.top]);

    xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => {
        // todo: fix this
        const text = g.select(".tick:last-of-type text");
        if (text && text.clone) {
          text.clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y);
        }
      });


    // append axis
    gAxis = g.append("g")
      .attr("id", "axis");

    gXAxis = gAxis.append("g")
      .attr("id", "axis-x")
      .attr("class", "x axis")
      .call(xAxis);

    gYAxis = gAxis.append("g")
      .attr("id", "axis-y")
      .attr("class", "y axis")
      .call(yAxis);

    // append line charts
    gLines = g.append("g")
      .attr('id', 'lines');

    pollutants.forEach((pollutant) => {
      gLines.append("path")
        .datum(getDataByPollutionType(pollutant, data))
        .attr("id", `line-${pollutant}`)
        .attr("class", `line line-${pollutant}`)
        .attr("d", line);
    });


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
  };

  const updateChart = (rawData) => {
    const data = prepChartData(rawData);

    if (!svg) {
      buildChart(data);
    }


    // update axis
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, d3.max(getDataByPollutionType(getPollutantWithHighestValue(data).slug, data), d => d.value)]);

    gXAxis
      .transition()
      .call(xAxis);

    gYAxis
      .transition()
      .call(yAxis);


    // remove background colors from callouts
    $('#measurements li').removeClass(function(index, cssClass){
      return (cssClass.match(/^threshold-\d+$/) || []).join(' ');
    });

    pollutants.forEach((pollutant) => {
      const dataForPollutant = getDataByPollutionType(pollutant, data);

      // update lines
      svg.select(`.line-${pollutant}`)
        .datum(dataForPollutant)
        .transition()
        .attr("d", line);

      /**
       * Update callout values and background colors
       */
      
       const currentValue = +dataForPollutant[dataForPollutant.length - 1].value;
      
      const $item = $(`#${pollutant}`);
      $('span', $item).html(currentValue);

      // for background color, default to highest threshold color, but then search for a better one.
      let currentThreshold = thresholds[pollutant].length - 1; 

      for (let index = 0; index < thresholds[pollutant].length; index++) {
        const value = thresholds[pollutant][index];
        if (currentValue < value) {
          currentThreshold = index;
          break;
        }
      }

      $item.addClass(`threshold-${currentThreshold}`);
    });

    console.log('update chart');
  };

  async function getChartData() {
    const response = await requestJson('/get_data.php');

    if (!!response.data) {
      updateChart(response.data);
    }

    setTimeout(getChartData, 60 * 1000);
  }

  getChartData();
});