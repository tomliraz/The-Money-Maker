import os
import sys
import cx_Oracle
from flask import Flask
from flask_cors import CORS
from bson import json_util
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
        outer = f"SELECT EXTRACT(year FROM Market_Date) as year, {select} FROM ({ inner }) GROUP BY EXTRACT(year FROM Market_Date) ORDER BY year"
    elif (interval == 'M'):
        outer = f"SELECT CONCAT(CONCAT(month,'-'),year), {stocks} FROM (SELECT EXTRACT(month FROM Market_Date) as month, EXTRACT(year FROM Market_Date) as year, {select} FROM ({ inner }) GROUP BY EXTRACT(month FROM Market_Date), EXTRACT(year FROM Market_Date))"
    elif (interval == 'Q'):
        outer = f"SELECT CONCAT(CONCAT(Quarter,'-'), Year), {select} FROM ( SELECT {stocks}, CEIL(TO_NUMBER(TO_CHAR(Market_Date, 'MM'))/3) Quarter, TO_CHAR(Market_Date, 'YYYY') Year FROM ({inner}) ) GROUP BY CONCAT(CONCAT(Quarter,'-'), Year) ORDER BY CONCAT(CONCAT(Quarter,'-'), Year)"
    elif (interval == 'W'):
        outer = f"SELECT WYR, {select} FROM (SELECT {stocks}, CONCAT(CONCAT(TO_CHAR(Market_Date, 'WW'), '-'),  TO_CHAR(Market_Date, 'YYYY')) as WYR, Market_Date FROM ({inner})) GROUP BY WYR ORDER BY WYR"
    else:
        outer = f"SELECT Market_Date, {select} FROM ({ inner }) GROUP BY Market_Date"
    #print(outer)
    cursor.execute(outer)
    r = cursor.fetchall()
    #print(r)
    return json.dumps(r, default=datetimeConverter)

#correlation coefficient
#2 names, granularity, time period
@app.route('/correlation/<string:Stock>')
def get_correlation(Stock):
    connection = pool.acquire()
    cursor = connection.cursor()
    print(id)
    cursor.execute(f"select * FROM LIRAZ.Stock_Data WHERE Stock_ID = '{ Stock }'")
    r = cursor.fetchall()
    return json.dumps(r, default=json_util.default)

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
