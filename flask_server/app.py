#To start run 'venv\Scripts\activate'
#Then 'flask run'

import keys

import cx_Oracle

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from sqlalchemy.ext.automap import automap_base

cx_Oracle.init_oracle_client(lib_dir=r"D:\Program Files (x86)\instantclient_19_10")

Base = automap_base()
engine = create_engine("sqlite:///mydatabase.db")

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = keys.db_uri

db = SQLAlchemy(app)

#animal_shelter = db.Table('ANIMAL_SHELTER', db.metadata, autoload=True, autoload_with=db.engine)

test = db.Table('test', db.metadata, autoload=True, autoload_with=db.engine)


#Base = automap_base()
#Base.prepare(db.engine, reflect=True)
#test = Base.classes.test

@app.route('/')
def index():
    results = db.session.query(test).all()

    print(results)
    return f'<h1> Hello, World! {results}</h1>'