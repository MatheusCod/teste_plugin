// Copyright 2019 The TensorFlow Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ==============================================================================

export async function render() {
  const msg = createElement('p', 'Fetching data…');
  document.body.appendChild(msg);

  const runToTags = await fetch('./tags').then((response) => response.json());
  const data = await Promise.all(
    Object.entries(runToTags).flatMap(([run, tagToDescription]) =>
      Object.keys(tagToDescription).map((tag) =>
        fetch('./greetings?' + new URLSearchParams({run, tag}))
          .then((response) => response.json())
          .then((greetings) => ({
            run,
            tag,
            greetings,
          }))
      )
    )
  );
  console.log(data)
  console.log(data[0].greetings)


  const newChart = document.createElement("canvas");
  newChart.id = "myChart";
  newChart.width = "600";
  newChart.height = "400";
  newChart.style.margin = "auto";
  document.body.appendChild(newChart)

  var script = document.createElement('script');
  script.onload = function () {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: [1,2,3,4,5,6,7,8,9,10],
          datasets: [{
              label: 'Energy Consumption Through Time',
              data: data[0].greetings,
              borderColor: 'rgba(132, 132, 255, 1)',
              borderWidth: 1
          }]
      },
      options: {
                responsive: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                     scaleLabel: {
                        display: true,
                        labelString: 'Time (s)'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                     scaleLabel: {
                        display: true,
                        labelString: 'Energy Consumption (W)'
                        }
                    }]
                }
            }
      });
  };
  
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js";
  document.head.appendChild(script);
}
function createElement(tag, children) {
  const result = document.createElement(tag);
  if (children != null) {
    if (typeof children === 'string') {
      result.textContent = children;
    } else if (Array.isArray(children)) {
      for (const child of children) {
        result.appendChild(child);
      }
    } else {
      result.appendChild(children);
    }
  }
  return result;
}
