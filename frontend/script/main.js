
function generateRow(id, symbol, name, weight) {
    var output = `<tr>
    <th scope="row">${symbol}</th>
    <td>${name}</td>
    </tr>`;
    return output; 
}

console.log(generateRow(1, "AAPL", "Apple Inc.", 0.011));

document.addEventListener('DOMContentLoaded', function() {

    $.ajax({
        url: base_url + "table/AAPL",
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function(result) {
            console.log(result);
            for (var i = 0; i < result.length; i++)
            {
                let temp = result[i];
                let generated = generateRow(temp[0], temp[2], temp[1], temp[3]);
                $("#table-body").append(generated);
            }
        }
    });

    $('#sandbox-container .input-daterange').datepicker({
        format: "yyyy-mm-dd",
        minViewMode: 1,
        maxViewMode: 2,
        todayBtn: true
    });
    
   
}, false);


function reset_active() {
    $(".nav-link").attr("class", "nav-link");
}

function loadView(view) {
    // Stock, Corr, Season, Vol, MACD, Google
    var frame = $("#main-frame");
    var folder = "charts/";
    if (view == 'Stock') {
        frame.attr('src', folder + 'StockTrend.html');
    }
    else if (view == 'Corr') {
        frame.attr('src', folder + "Correlation.html");
    }
    else if (view == 'Season') {
        frame.attr('src', folder + "SeasonTrend.html");
    }
    else if (view == 'Vol') {
        frame.attr('src', folder + "Volatility.html");
    }
    else if (view == 'MACD') {
        frame.attr('src', folder + "MACD.html");
    }
    else if (view == 'Google') {
        frame.attr('src', folder + "GoogleTrend.html");
    }
    else {
        console.error("Template HTML not found");
    }
    reset_active();
    $("#" + view).attr("class", "nav-link active");
}

const base_url = "http://localhost:8081/"

