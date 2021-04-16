function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Day');
    data.addColumn('number', 'AAPL');
    data.addColumn('number', 'GME');
    data.addColumn('number', 'AMC');

    // data.addRows();

    var options = {
        chart: {
            title: 'Seasonal Trend',
            subtitle: 'Apple Inc.'
        },
        width: "100%",
        height: "100%"
    };

    var chart = new google.charts.Line(document.getElementById('linechart'));

    chart.draw(data, google.charts.Line.convertOptions(options));
}