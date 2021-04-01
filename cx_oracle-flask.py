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
def get_trend(Stock1, interval, start, stop, Stock2='', Stock3=''):
    connection = pool.acquire()
    cursor = connection.cursor()
    print(id)
    if (Stock3 != ''):
        cursor.execute("select * from Stock WHERE StockID in ('" + Stock1 + "','" + Stock2 + "','" + Stock3 + "') AND Market_Date >= to_date('"+start+"') AND Market_Date <= to_date('"+stop+"')")
    elif (Stock2 != ''):
        cursor.execute("select * from Stock WHERE StockID = '" + id + "'")
    else: 
        cursor.execute("select * from Stock WHERE StockID = '" + id + "'")
    r = cursor.fetchall()
    print(r)
    return json.dumps(r, default=datetimeConverter)

#correlation coefficient
#2 names, granularity, time period
@app.route('/correlation/<string:Stock>')
def get_correlation(Stock):
    connection = pool.acquire()
    cursor = connection.cursor()
    print(id)
    cursor.execute("select * from Stock WHERE StockID = '" + Stock + "'")
    r = cursor.fetchall()
    return json.dumps(r, default=json_util.default)

#seasonal trends
#time interval, company name, time period but yearly
@app.route('/seasonal/<string:id>')
def get_seasonal(id):
    connection = pool.acquire()
    cursor = connection.cursor()
    print(id)
    cursor.execute("select * from Stock WHERE StockID = '" + id + "'")
    r = cursor.fetchall()
    return json.dumps(r, default=json_util.default)

if __name__ == '__main__':
    pool = start_pool()

    app.run(port=int(os.environ.get('PORT', '8081')))
