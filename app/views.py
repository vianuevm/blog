from flask import render_template
from app import app

@app.route('/')
@app.route('/index')
def index():
	return render_template("index.html")


@app.route('/db')
def db_endpoint():
	return render_template("databaseTestPage.html")