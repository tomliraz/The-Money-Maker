var $ = window.parent.$;
var jQuery = window.parent.jQuery;

function drawChart() {

    var url = "http://localhost:8081/trend/AAPL/MSFT/M/2001-01-01/2003-01-01";

    $.ajax({
        dataType: "json",
        url: url,
        success: (response) => {

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Day');
            data.addColumn('number', 'AAPL');
            data.addColumn('number', 'MSFT');

            data.addRows();

            var options = {
                chart: {
                    title: 'Stock Trend',
                    subtitle: 'Apple Inc.'
                },
                width: "100%",
                height: "100%"
            };
        
            var chart = new google.charts.Line(document.getElementById('linechart'));
        
            chart.draw(data, google.charts.Line.convertOptions(options));
        }
    });
}