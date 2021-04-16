import os
import sys
import cx_Oracle
from flask import Flask
from flask_cors import CORS
import datetime
import json
import keys

os.environ['PYTHON_USERNAME'] = keys.db_user
os.environ['PYTHON_PASSWORD'] = keys.db_password
os.environ['PYTHON_CONNECTSTRING'] = 'oracle.cise.ufl.edu:1521/ORCL'
os.environ['PORT'] = '8081'

cx_Oracle.init_oracle_client(lib_dir=keys.cx_oracle_path)

def init_session(connection, requestedTag_ignored):
    cursor = connection.cursor()
    cursor.execute("""
        ALTER SESSION SET
          TIME_ZONE = 'UTC'
          NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI'""")

def start_pool():
    pool_min = 4
    pool_max = 4
    pool_inc = 0
    pool_gmd = cx_Oracle.SPOOL_ATTRVAL_WAIT

    print("Connecting to", os.environ.get("PYTHON_CONNECTSTRING"))

    pool = cx_Oracle.SessionPool(user=os.environ.get("PYTHON_USERNAME"),
                                 password=os.environ.get("PYTHON_PASSWORD"),
                                 dsn=os.environ.get("PYTHON_CONNECTSTRING"),
                                 min=pool_min,
                                 max=pool_max,
                                 increment=pool_inc,
                                 threaded=True,
                                 getmode=pool_gmd,
                                 sessionCallback=init_session)

    return pool

app = Flask(__name__)
CORS(app)

def datetimeConverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


@app.route('/')
def index():
    return "Index"

@app.route('/stocks')
def list_stocks():
    connection = pool.acquire()
    cursor = connection.cursor()

    getStocks = "SELECT company, stock_id FROM LIRAZ.stock_list ORDER BY WEIGHT DESC"

    cursor.execute(getStocks)
    r = cursor.fetchall()
    return json.dumps(r, default=datetimeConverter)

#company name, interval, and time period up three
@app.route('/trend/<string:Stock1>/<string:interval>/<string:start>/<string:stop>')
@app.route('/trend/<string:Stock1>/<string:Stock2>/<string:interval>/<string:start>/<string:stop>')
@app.route('/trend/<string:Stock1>/<string:Stock2>/<string:Stock3>/<string:interval>/<string:start>/<string:stop>')
def get_trend(Stock1, start, stop, Stock2='', Stock3='', interval='D'):
    connection = pool.acquire()
    cursor = connection.cursor()
    inner = ""
    select = ""
    stocks = ""
    if (Stock3 != ''):
        inner = f"""(SELECT ADJ_Close as {Stock1}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock1}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')) NATURAL LEFT JOIN
(SELECT ADJ_Close as {Stock2}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock2}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')) NATURAL LEFT JOIN
(SELECT ADJ_Close as {Stock3}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock3}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD'))"""
        select = f"AVG({Stock1}) as {Stock1}, AVG({Stock2}) as {Stock2}, AVG({Stock3}) as {Stock3}"
        stocks = f"{Stock1}, {Stock2}, {Stock3}"
    elif (Stock2 != ''):
        inner = f"""(SELECT ADJ_Close as {Stock1}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock1}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')) NATURAL LEFT JOIN
(SELECT ADJ_Close as {Stock2}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock2}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD'))"""
        select = f'AVG({Stock1}) as {Stock1}, AVG({Stock2}) as {Stock2}'
        stocks = f"{Stock1}, {Stock2}"
    else: 
        inner = f"""(SELECT ADJ_Close as {Stock1}, Market_Date FROM LIRAZ.Stock_Data 
WHERE Stock_ID = '{Stock1}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') 
AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD'))"""
        select = f'AVG({Stock1}) as {Stock1}'
        stocks = f"{Stock1}"
    outer = ""
    if (interval == 'Y'):
        outer = f"SELECT CONCAT(YEAR, '-01-01'), {stocks} FROM (SELECT EXTRACT(year FROM Market_Date) as year, {select} FROM ({ inner }) GROUP BY EXTRACT(year FROM Market_Date) ORDER BY year)"
    elif (interval == 'M'):
        outer = f"SELECT CONCAT(CONCAT(CONCAT(year,'-'), LPAD(month,2,'0')),'-01'), {stocks} FROM (SELECT EXTRACT(month FROM Market_Date) as month, EXTRACT(year FROM Market_Date) as year, {select} FROM ({ inner }) GROUP BY EXTRACT(month FROM Market_Date), EXTRACT(year FROM Market_Date))"
    elif (interval == 'Q'):
        outer = f"SELECT CONCAT(CONCAT(CONCAT(Year, '-'),LPAD(Quarter*3-2, 2, '0')), '-01'), {stocks} FROM (SELECT Quarter, Year, {select} FROM ( SELECT {stocks}, CEIL(TO_NUMBER(TO_CHAR(Market_Date, 'MM'))/3) Quarter, TO_CHAR(Market_Date, 'YYYY') Year FROM ({inner}) )  GROUP BY Quarter, Year ORDER BY Year, Quarter) "
    # elif (interval == 'W'):
    #     outer = f"SELECT WYR, {select} FROM (SELECT {stocks}, CONCAT(CONCAT(TO_CHAR(Market_Date, 'WW'), '-'),  TO_CHAR(Market_Date, 'YYYY')) as WYR, Market_Date FROM ({inner})) GROUP BY WYR ORDER BY WYR"
    else:
        outer = f"SELECT Market_Date, {select} FROM ({ inner }) GROUP BY Market_Date"
    print(outer)
    cursor.execute(outer)
    r = cursor.fetchall()
    #print(r)
    return json.dumps(r, default=datetimeConverter)

#correlation coefficient correlation
#2 names, granularity, time period
@app.route('/correlation/<string:Stock1>/<string:Stock2>/<string:interval>/<string:start>/<string:stop>')
def get_correlation(Stock1, Stock2, start, stop, interval='D'):
    connection = pool.acquire()
    cursor = connection.cursor()
    
    stockDataQuery = f"(SELECT s1.stock_ID Stock1, s1.Adj_Close Price1, s2.Stock_ID Stock2, s2.Adj_Close Price2, s1.Market_Date Market_Date FROM LIRAZ.Stock_Data s1 JOIN LIRAZ.Stock_Data s2 ON s1.Market_Date = s2.Market_Date Where s1.Stock_ID = '{Stock1}' AND s2.Stock_ID = '{Stock2}' AND s1.Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND s1.Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD'))"
    
    intervalQuery = f""
    namedIntervalQuery=f""
    nameOfInterval=f""
    formatting =f""
    if (interval == 'Y'):
        intervalQuery = f"extract(year from Market_Date)" #example: http://localhost:8081/correlation/AAPL/MSFT/M/2001-01-01/2003-01-01
        namedIntervalQuery = "extract(year from Market_Date) year"
        nameOfInterval = f"year"
        formatting = "CONCAT(CONCAT(year, CONCAT('-', '01')), CONCAT('-', '01'))"
    elif (interval == 'M'):
        intervalQuery = f"extract(year from Market_Date), extract(month from Market_Date)" 
        namedIntervalQuery = "extract(year from Market_Date) AS year, extract(month from Market_Date) AS month"
        nameOfInterval = f"year, month"
        formatting = "CONCAT(CONCAT(year, CONCAT('-', LPAD(month, 2, '0'))), CONCAT('-', '01'))"
    elif (interval == 'Q'):
        intervalQuery = f"extract(year from Market_Date), CEIL(extract(month from Market_Date)/3)"
        namedIntervalQuery = "extract(year from Market_Date) AS year, CEIL(extract(month from Market_Date)/3) AS quarter"
        nameOfInterval = f"year, quarter"
        formatting = "CONCAT(CONCAT(year, CONCAT('-', LPAD(3*quarter-2, 2,'0'))), CONCAT('-', '01'))"
        
    intervalAverages = f"SELECT Stock1, AVG(Price1) avg_price1, Stock2, AVG(Price2) avg_price2, { namedIntervalQuery } FROM ({ stockDataQuery }) GROUP BY Stock1, Stock2, { intervalQuery }"

    summedDemeanedPrices = f"WITH avgs AS ({ intervalAverages }), stocks AS (SELECT Price1, Price2, {namedIntervalQuery} FROM ({ stockDataQuery })) SELECT Stock1, Stock2, (SUM((Price1 - AVG_Price1) * (Price2 - AVG_Price2)))/(COUNT(Price1) - 1) AS cov, {nameOfInterval} FROM avgs NATURAL JOIN stocks GROUP BY Stock1, Stock2, {nameOfInterval}"

    stdDevProduct = f"WITH stocks AS ({ stockDataQuery }) SELECT Stock1, Stock2, STDDEV(Price1)* STDDEV(Price2) AS stddev_Product, { namedIntervalQuery } FROM stocks GROUP BY Stock1, Stock2, { intervalQuery }"

    correlation = f"SELECT {nameOfInterval}, Cov / stddev_Product AS corr FROM ({ summedDemeanedPrices }) NATURAL JOIN ({ stdDevProduct })"

    formattedCorrelation = f"SELECT {formatting}, corr FROM ({correlation}) ORDER BY {formatting}"

    cursor.execute(formattedCorrelation)
    r = cursor.fetchall()
    return json.dumps(r, default=datetimeConverter)

#seasonal trends
#company name, time period but yearly, time interval
@app.route('/seasonal/<string:id>/<int:beginYear>/<int:endYear>/<string:start>/<string:stop>')
def get_seasonal(id, beginYear, endYear, start, stop):
    connection = pool.acquire()
    cursor = connection.cursor()

    temp = []

    while beginYear <= endYear:
        seasonStart = str(beginYear) + start
        seasonStop = str(beginYear) + stop
        periodStart = str(beginYear) + "01-01"
        periodStop = str(beginYear) + "12-31"
        stockDataQuery = f"WITH Seasonal (STOCK_ID, S_Average) as (SELECT STOCK_ID, AVG(ADJ_CLOSE) FROM LIRAZ.Stock_Data WHERE MARKET_DATE <= to_date('{seasonStop}','YYYY/MM/DD') and MARKET_DATE >= to_date('{seasonStart}','YYYY/MM/DD') and STOCK_ID = '{id}' GROUP BY STOCK_ID), Period(STOCK_ID, P_Average) as (SELECT STOCK_ID, AVG(ADJ_CLOSE) FROM LIRAZ.Stock_Data WHERE MARKET_DATE <= to_date('{periodStop}','YYYY/MM/DD') and MARKET_DATE >= to_date('{periodStart}','YYYY/MM/DD') and STOCK_ID = '{id}' GROUP BY STOCK_ID) SELECT (S_Average - P_Average) / P_Average * 100 FROM Seasonal, Period"
        cursor.execute(stockDataQuery)
        r = cursor.fetchall()
        #print(r[0])
        temp.append([beginYear, r[0]])
        beginYear += 1
    
    #print(temp[0][1])
    return json.dumps(temp, default=datetimeConverter)


@app.route('/volatility/<string:Stock1>/<string:interval>/<string:start>/<string:stop>')
def get_volatility(Stock1, start, stop, interval='D'):
    connection = pool.acquire()
    cursor = connection.cursor()

    intervalQuery = f""
    namedIntervalQuery=f""
    if (interval == 'Y'):
        intervalQuery = f"extract(year from Market_Date)"
        namedIntervalQuery = "extract(year from Market_Date) year"
        formatting = "CONCAT(year, '-01-01')"
    elif (interval == 'M'):
        intervalQuery = f"extract(year from Market_Date), extract(month from Market_Date)"
        namedIntervalQuery = "extract(year from Market_Date) year, extract(month from Market_Date) month"
        formatting = "CONCAT(CONCAT(year, CONCAT('-', LPAD(month, 2, '0'))), CONCAT('-', '01'))"
    elif (interval == 'Q'):
        intervalQuery = f"extract(year from Market_Date), CEIL(extract(month from Market_Date)/3)"
        namedIntervalQuery = "extract(year from Market_Date) year, CEIL(extract(month from Market_Date)/3) quarter"
        formatting = "CONCAT(CONCAT(year, CONCAT('-', LPAD(3*quarter-2, 2,'0'))), CONCAT('-', '01'))"
    #elif (interval == 'W'): # not working
    #    intervalQuery = f"extract(year from Market_Date)"

    volatility = f"SELECT {namedIntervalQuery}, STDDEV(adj_close)/AVG(adj_close)*100 std FROM LIRAZ.stock_data WHERE stock_id = '{Stock1}' AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD') GROUP BY {intervalQuery}"

    formattedVolatility = f"SELECT {formatting}, std FROM ({volatility}) ORDER BY {formatting}"

    cursor.execute(formattedVolatility)
    r = cursor.fetchall()
    return json.dumps(r, default=datetimeConverter)


@app.route('/macd/<string:Stock1>/<string:slow>/<string:fast>/<string:start>/<string:stop>')
def get_MACD(Stock1, slow, fast, start, stop):
    connection = pool.acquire()
    cursor = connection.cursor() #example: http://localhost:8081/macd/AAPL/12/11/2000-01-01/2000-02-01

    k_slow = f"2/({slow}+1)"
    
    k_fast = f"2/({fast}+1)"

    stockDataQuery = f"SELECT ROW_NUMBER() OVER(ORDER BY market_date) k, market_date, adj_close FROM LIRAZ.stock_data WHERE stock_id = '{Stock1}' AND market_date >= TO_DATE('{start}', 'YYYY-MM-DD') AND market_date <= TO_DATE('{stop}', 'YYYY-MM-DD')"
    
    EMA_slow = f"WITH EMA (n,cdate,val) AS (SELECT * FROM ({stockDataQuery}) WHERE k = 1 UNION ALL SELECT n+1, market_date, adj_close*({k_slow}) + val*(1-{k_slow}) FROM EMA JOIN ({stockDataQuery}) d on EMA.n+1 = d.k) SELECT 'slow', cdate,val slowval FROM EMA"
    
    EMA_fast = f"WITH EMA (n,cdate,val) AS (SELECT * FROM ({stockDataQuery}) WHERE k = 1 UNION ALL SELECT n+1, market_date, adj_close*({k_fast}) + val*(1-{k_fast}) FROM EMA JOIN ({stockDataQuery}) d on EMA.n+1 = d.k) SELECT 'fast', cdate,val fastval FROM EMA"

    cursor.execute(EMA_fast)
    r = cursor.fetchall()
    return json.dumps(r, default=datetimeConverter)


if __name__ == '__main__':
    pool = start_pool()

    app.run(port=int(os.environ.get('PORT', '8081')))