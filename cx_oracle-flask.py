import os
import sys
import cx_Oracle
from flask import Flask
import json

os.environ['PYTHON_USERNAME'] = 'kyledampier' # update
os.environ['PYTHON_PASSWORD'] = 'Camo1019' # update
os.environ['PYTHON_CONNECTSTRING'] = 'oracle.cise.ufl.edu:1521/ORCL'
os.environ['PORT'] = '8080'

cx_Oracle.init_oracle_client(lib_dir=r"c:\oracle\instantclient_19_10") # update

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

@app.route('/')
def index():
    return "Index"

@app.route('/table/<string:table>')
def show_table(table):
    connection = pool.acquire()
    cursor = connection.cursor()
    print(table)
    cursor.execute("select * from " + table)
    r = cursor.fetchall()
    return json.dumps(r)

if __name__ == '__main__':
    pool = start_pool()

    app.run(port=int(os.environ.get('PORT', '8080')))
