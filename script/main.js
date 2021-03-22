
document.addEventListener('DOMContentLoaded', function() {
    $("#testing-symbol").html("JS");
    $("#testing-title").html("loaded using JS");

    
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