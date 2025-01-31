import {log, isLogging } from './utils.js';

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
  
  const prepRawData = (rawData) => {
    const parseTime = d3.timeParse("%Y/%m/%d %H:%M:%S");
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


  const update = (rawData) => {
    const data = prepRawData(rawData);



    pollutants.forEach((pollutant) => {
      const dataForPollutant = getDataByPollutionType(pollutant, data);
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

    const lastRecord = jQuery.extend({}, data[0]);
    const recordDate = new Date(lastRecord.date).toLocaleString(undefined, {});
    // $data.find('h2 span').html(`${recordDate}`);

    // delete lastRecord.date;
    log(`Logger: ${recordDate}: ${JSON.stringify(lastRecord)}`);
  };

  const $data = $('#data');

  async function getData() {
    const response = await requestJson('/get_data.php?limit=1');

    // remove background colors from callouts
    $('#measurements li').removeClass(function(index, cssClass){
      return (cssClass.match(/^threshold-\d+$/) || []).join(' ');
    });

    if (!!response.data && isLogging()) {
      update(response.data);
    }

    setTimeout(getData, 5 * 1000);
  }

  getData();
});