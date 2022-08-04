import * as Plotly from 'plotly.js-basic-dist';

Plotly.newPlot('myDiv', [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16],
    type: "scatter"
}]);