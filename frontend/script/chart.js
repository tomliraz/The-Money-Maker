document.addEventListener('DOMContentLoaded', function() {
    google.charts.load('current', {'packages':['line']});
    google.charts.setOnLoadCallback(drawChart);
}, false);