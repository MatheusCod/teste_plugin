// Copyright 2019 The TensorFlow Authors. All Rights Reserved.
// Modifications Copyright 2020 MatheusCod 
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
  
  const h1var = document.createElement('h1');
  const textvar = document.createTextNode("First print");
  h1var.appendChild(textvar);
  //document.body.appendChild(h1var);
    
  //const msg = createElement('p', 'Fetching data…');
  //document.body.appendChild(msg);
  
  const newJson = await fetch('./printdata').then((response) => response.json());
  var str = JSON.stringify(newJson, null, 2);
  const newHead = document.createElement('h1');
  const newText = document.createTextNode(str);
  newHead.appendChild(newText);
  //document.body.appendChild(newHead);
  
  var tipo = newJson['Second']
  const newHead2 = document.createElement('h2');
  const newText2 = document.createTextNode(tipo);
  newHead2.appendChild(newText2);
  //document.body.appendChild(newHead2);
  
  //const newImage = await fetch('./plotgraph').then((response) => response.json());
  //var image = document.createElement("img");
  //image.id = "image0";
  //document.body.appendChild(image);
  //image.src = "./static/image.png";
  //image.src = "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
  //document.getElementById("image0").src = "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
  
  //function loadScript(src) {
  //  return new Promise(function (resolve, reject) {
  //      var s;
  //      s = document.createElement('script');
  //      s.src = src;
  //      s.onload = resolve;
  //      s.onerror = reject;
  //      document.head.appendChild(s);
  //  });
  //}
  
  //loadScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js")
  //  .catch(loadScript.bind(null, localSource))
  //  .then(successCallback, failureCallback);
  
  const newChart = document.createElement("canvas");
  newChart.id = "myChart";
  newChart.width = "600";
  newChart.height = "400";
  newChart.style.margin = "auto";
  document.body.appendChild(newChart)
  
  const graphData = await fetch('./plotgraph').then((response) => response.json());

  var script = document.createElement('script');
  script.onload = function () {
    //const graphData = await fetch('./plotgraph').then((response) => response.json());
    var ctx = document.getElementById('myChart').getContext('2d');
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: graphData['x'],
          datasets: [{
              label: 'Energy Consumption Through Time',
              data: graphData['y'],
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
  script.src = "https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js";
  document.head.appendChild(script);
  //var image = document.createElement("img");
  //document.body.appendChild(image);
  //var newImg = new Image;
  //newImg.onload = function() {
  //    image.src = this.src;
  //}
  //newImg.src = "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
  
  
  const runToTags = await fetch('./tags').then((response) => response.json());
  const data = await Promise.all(
    Object.entries(runToTags).flatMap(([run, tagToDescription]) =>
      Object.keys(tagToDescription).map((tag) =>
        fetch('./summary' + new URLSearchParams({run, tag}))
          .then((response) => response.json())
          .then((greetings) => ({
            run,
            tag,
            greetings,
          }))
      )
    )
  );
  const style = createElement(
    'style',
    `
      thead {
        border-bottom: 1px black solid;
        border-top: 2px black solid;
      }
      tbody {
        border-bottom: 2px black solid;
      }
      table {
        border-collapse: collapse;
      }
      td,
      th {
        padding: 2pt 8pt;
      }
    `
  );
  style.innerText = style.textContent;
  document.head.appendChild(style);
  const table = createElement('table', [
    createElement(
      'thead',
      createElement('tr', [
        createElement('th', 'Run'),
        createElement('th', 'Tag'),
        createElement('th', 'Greetings'),
      ])
    ),
    createElement(
      'tbody',
      data.flatMap(({run, tag, greetings}) =>
        greetings.map((guest, i) =>
          createElement('tr', [
            createElement('td', i === 0 ? run : null),
            createElement('td', i === 0 ? tag : null),
            createElement('td', guest),
          ])
        )
      )
    ),
  ]);
  msg.textContent = 'Data loaded.';
  document.body.appendChild(table);
  
}


/*
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
*/
