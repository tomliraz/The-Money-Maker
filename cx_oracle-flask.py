import os
import sys
import cx_Oracle
from flask import Flask
from flask_cors import CORS
#from bson import json_util
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
#company name, interval, and time period up three
@app.route('/trend/<string:Stock1>/<string:interval>/<string:start>/<string:stop>')
@app.route('/trend/<string:Stock1>/<string:Stock2>/<string:interval>/<string:start>/<string:stop>')
@app.route('/trend/<string:Stock1>/<string:Stock2>/<string:Stock3>/<string:interval>/<string:start>/<string:stop>')
def get_trend(Stock1, start, stop, Stock2='', Stock3='', interval='D'):
    connection = pool.acquire()
    cursor = connection.cursor()
    inner = ""
    if (Stock3 != ''):
        inner = f"SELECT * FROM LIRAZ.Stock_Data WHERE Stock_ID in ('{Stock1}','{Stock2}', '{Stock3}') AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')"
    elif (Stock2 != ''):
        inner = f"SELECT * FROM LIRAZ.Stock_Data WHERE Stock_ID in ('{ Stock1 }','{ Stock2 }') AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')" 
    else: 
        inner = f"SELECT * FROM LIRAZ.Stock_Data WHERE Stock_ID in ('{ Stock1 }') AND Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD')" 
    
    outer = ""
    if (interval == 'Y'):
        outer = f"SELECT Stock_ID, EXTRACT(year FROM Market_Date) as yr, AVG(ADJ_Close) FROM ({ inner }) GROUP BY Stock_ID, EXTRACT(year FROM Market_Date) ORDER BY yr"
    elif (interval == 'M'):
        outer = f"SELECT Stock_ID, EXTRACT(month FROM Market_Date) as month, EXTRACT(year FROM Market_Date) as yr, AVG(ADJ_Close) FROM ({ inner }) GROUP BY Stock_ID, EXTRACT(month FROM Market_Date), EXTRACT(year FROM Market_Date)"
    elif (interval == 'Q'):
        outer = f"SELECT Stock_ID, Quarter, Year, Avg(Adj_Close) FROM ( SELECT Stock_ID, Adj_close, CEIL(TO_NUMBER(TO_CHAR(Market_Date, 'MM'))/3) Quarter, TO_CHAR(Market_Date, 'YYYY') Year FROM ({inner}) ) GROUP BY Stock_ID, Quarter, Year ORDER BY Stock_ID, Year, Quarter"
    elif (interval == 'W'):
        outer = f"SELECT Stock_ID, Week, Year, AVG(Adj_Close) FROM (SELECT Stock_ID, Adj_close, TO_CHAR(Market_Date, 'WW') Week,  TO_CHAR(Market_Date, 'YYYY') Year, Market_Date FROM ({inner})) GROUP BY Stock_ID, week, year ORDER BY Stock_ID, Year, Week"
    elif (interval == 'D'):
        outer = f"SELECT Stock_ID, ADJ_Close, Market_Date FROM ({ inner })"
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
    
    stockDataQuery = f"(SELECT s1.stock_ID Stock1, s1.Adj_Close Price1, s2.Stock_ID Stock2, s2.Adj_Close Price2, s1.Market_Date Market_Date FROM Stock_Data s1 JOIN Stock_Data s2 ON s1.Market_Date = s2.Market_Date Where s1.Stock_ID = '{Stock1}' AND s2.Stock_ID = '{Stock2}' AND s1.Market_Date >= TO_DATE('{start}', 'YYYY-MM-DD') AND s1.Market_Date <= TO_DATE('{stop}', 'YYYY-MM-DD'))"
    
    intervalQuery = f""
    if (interval == 'Y'):
        intervalQuery = f"extract(year from Market_Date)" #example: http://localhost:8081/correlation/AAPL/MSFT/M/2001-01-01/2003-01-01
    elif (interval == 'M'):
        intervalQuery = f"extract(month from Market_Date)" #Does not work
    #elif (interval == 'Q'):
    
    #elif (interval == 'W'):
    
    #elif (interval == 'D'):
        
    intervalAverages = f"SELECT Stock1, AVG(Price1) avg_price1, Stock2, AVG(Price2) avg_price2, { intervalQuery } AS Interval FROM ({ stockDataQuery }) GROUP BY Stock1, Stock2, { intervalQuery }"

    summedDemeanedPrices = f"WITH avgs AS ({ intervalAverages }), stocks AS ({ stockDataQuery }) SELECT avgs.Stock1, avgs.Stock2, (SUM((Price1 - avgs.AVG_Price1) * (Price2 - avgs.AVG_Price2)))/(COUNT(Price1) - 1) AS cov, avgs.Interval FROM avgs,stocks  WHERE { intervalQuery } = avgs.Interval GROUP BY avgs.Stock1, avgs.Stock2, avgs.Interval"

    stdDevProduct = f"WITH stocks AS ({ stockDataQuery }) SELECT Stock1, Stock2, STDDEV(Price1)* STDDEV(Price2) AS stddev_Product, { intervalQuery } AS Interval FROM stocks GROUP BY Stock1, Stock2, { intervalQuery }"

    correlation = f"SELECT numerator.Interval, Cov / stddev_Product FROM ({ summedDemeanedPrices }) numerator, ({ stdDevProduct }) denominator WHERE numerator.Interval = denominator.Interval"

    cursor.execute(correlation)
    r = cursor.fetchall()
    return json.dumps(r, default=datetimeConverter)

#seasonal trends
#company name, time period but yearly, time interval
@app.route('/seasonal/<string:id>/<int:period>/<string:start>/<string:stop>')
def get_seasonal(id, period, start, stop):
    connection = pool.acquire()
    cursor = connection.cursor()

    cursor.execute(f"select * FROM LIRAZ.Stock_Data WHERE Stock_ID = '{ id }'")
    r = cursor.fetchall()
    return json.dumps(r, default=json_util.default)

if __name__ == '__main__':
    pool = start_pool()

    app.run(port=int(os.environ.get('PORT', '8081')))
