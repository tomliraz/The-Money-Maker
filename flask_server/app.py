import

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

Base = automap_base()
engine = create_engine("sqlite:///mydatabase.db")

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle://liraz:Pp04062001@oracle.cise.ufl.edu:1521/orcl'

db = SQLAlchemy(app)

country = db.Table('country', db.metadata, autoload=True, autoload_with=db.engine)

@app.route('/')
def index():
    results = db.session.query(customer).all()
    return f'<h1> Hello </h1>'