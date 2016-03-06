from flask import render_template, request, jsonify
import requests
import math
from app import app
import json


@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")


@app.route('/db')
def db_endpoint():
    return render_template("databaseTestPage.html")


@app.route('/tfidf', methods = ['POST'])
def retrieve_document():
    # fb = firebase.FirebaseApplication('https://zhacks.firebaseio.com/', None)
    # result = fb.get('/', None)
    url = 'http://api.icndb.com/jokes/random/1000'
    data = ''
    result = requests.get(url, data=data)
    document_array = json.loads(result.text)['value']
    print len(document_array)
    query = request.json['query']
    for i in range(0, len(query)):
        query[i] = query[i].lower()


    inverted_index = open("result.json").read()
    inverted_index = json.loads(inverted_index)
    query_tf = calc_query_tf(query)
    query_tf_idf = calc_query_tf_idf(query_tf, inverted_index)
    closest_matched_document = compare_documents(query_tf_idf, inverted_index)
    url = "http://api.icndb.com/jokes/" + closest_matched_document["document"]
    result = requests.get(url, data=data)
    joke = json.loads(result.text)["value"]["joke"]
    closest_matched_document["document"] = joke
    return jsonify(closest_matched_document)


def calc_query_tf_idf(query_tf, inverted_index):
    query_calc = {}
    for word in query_tf.keys():
        if word not in inverted_index["idf_count"]:
            inverted_index["idf_count"][word] = 0
        query_calc[word] = query_tf[word] * inverted_index["idf_count"][word]

    return query_calc


def calc_query_tf(query):
    tf = {}
    for word in query:
        tf[word] = float(query.count(word)) / len(query)
    return tf


def compare_documents(query, index):
    best = -1
    tf_idf_map = index["tf_idf_count"]
    best_document = ""
    numerator = denominator = cosine = 0
    l_denom = []
    r_denom = []
    for document in tf_idf_map:
        metadata = calc_tf_idf(query, tf_idf_map[document])
        result = metadata["result"]
        if result > best:
            best = result
            best_document = document
            numerator = metadata["numerator"]
            l_denom = metadata["l_denominator"],
            r_denom = metadata["r_denominator"],
            cosine = result

    object = {
        "document": best_document,
        "numerator": numerator,
        "l_denominator": l_denom,
        "r_denominator": r_denom,
        "cosine": cosine
    }
    return object


def calc_tf_idf(query_document, comapared_document):
    numerator = 0
    doc1_denominator = 0
    doc2_denominator = 0
    numerator_array = []
    left_denom = []
    right_denom = []
    for word in query_document:
        if word not in comapared_document:
            comapared_document[word] = 0
        numerator += query_document[word] * comapared_document[word]
        next_addition = str(query_document[word]) + " * " + str(comapared_document[word])
        numerator_array.append(next_addition)

        doc1_denominator += math.pow(query_document[word], 2)
        left_denom.append(str(query_document[word]))
        doc2_denominator += math.pow(comapared_document[word], 2)
        right_denom.append(str(comapared_document[word]))

    denominator = math.sqrt(doc1_denominator) * math.sqrt(doc2_denominator)
    if denominator == 0:
        result = -1
    else:
        result = (float(numerator) / denominator)

    metadata = {
        "numerator": numerator_array,
        "l_denominator": left_denom,
        "r_denominator": right_denom,
        "result": result
    }
    return metadata





