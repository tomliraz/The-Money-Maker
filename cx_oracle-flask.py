# first run:
# env\Scripts\activate
# set FLASK_APP=cx_oracle-flask.py
# flask run

import os
import sys
import cx_Oracle
from flask import Flask
import json

import keys

os.environ['PYTHON_USERNAME'] = keys.db_user
os.environ['PYTHON_PASSWORD'] = keys.db_password
os.environ['PYTHON_CONNECTSTRING'] = 'oracle.cise.ufl.edu:1521/ORCL'
os.environ['PORT'] = '8080'

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

@app.route('/')
def index():
    return "<h1> Hello, World </h1>"

@app.route('/table/<string:table>')
def show_table(table):
    pool = start_pool()
    connection = pool.acquire()
    cursor = connection.cursor()
    print(table)
    cursor.execute("select * from " + table)
    r = cursor.fetchall()
    return json.dumps(r)

if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', '8080')))