var $ = window.parent.$;
var jQuery = window.parent.jQuery;

function compareDateColumn(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function drawChart() {

    let start = $("input[name='start']").val();
    $("input[name='start']").on("change", () => {
        drawChart();
    });

    let end = $("input[name='end']").val();
    $("input[name='end']").on("change", () => {
        drawChart();
    });

    var url = "http://localhost:8081/trend/AAPL/MSFT/TSLA/D/" + start + "/" + end;

    $.ajax({
        dataType: "json",
        url: url,
        success: (response) => {
            for (var i = 0; i < response.length; i++)
            { 
                let d = response[i][0].split("-");
                // response[i][0] = d[1] + "-" + d[0].padStart(2, '0') + "-01";
                response[i][0] = new Date(response[i][0]);
            }
            response.sort(compareDateColumn);
            console.log(response);

            var data = new google.visualization.DataTable();
            data.addColumn('date', 'Month');
            data.addColumn('number', 'AAPL');
            data.addColumn('number', 'MSFT');
            data.addColumn('number', 'TSLA');

            data.addRows(response);

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

document.addEventListener('DOMContentLoaded', function() {
    drawChart();
});

