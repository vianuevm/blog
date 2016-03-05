#!flask/bin/python
from __future__ import division
from app import app
from firebase import firebase
import math
import json



def total_word_count(total_words, result):
    for item in result.keys():
        total_words = total_words + result[item]["text"].split()
    return set(total_words)

def create_inverted_index(tf_idf_count, idf_count):
    inverted_index = {}
    inverted_index["tf_idf_count"] = tf_idf_count
    inverted_index["idf_count"] = idf_count
    with open('result.json', 'w') as fp:
        json.dump(inverted_index, fp)

def tf_idf():
    fb = firebase.FirebaseApplication('https://zhacks.firebaseio.com/', None)
    result = fb.get('/', None)
    if(not result):
        return
    total_words = []
    for doc in result:
        result[doc]["text"] = result[doc]["text"].lower()
    total_words = total_word_count(total_words, result)
    tf_count = get_tf(result)
    idf_count = get_idf(result, total_words)
    tf_idf_count = get_tf_idf(tf_count, idf_count)
    create_inverted_index(tf_idf_count, idf_count)

def get_tf(result):
    tf_count = {}
    for doc in result.keys():
        tf_count[doc] = {}
        doc_array = result[doc]["text"].split()
        doc_len = len(doc_array)
        for word in result[doc]["text"].split():
            tf_count[doc][word] = doc_array.count(word) / doc_len

    return tf_count

def get_idf(result, total_words):
    idf_count = {}

    for word in total_words:
        for doc in result.keys():
            document = result[doc]["text"].split()
            if word in document:
                if word in idf_count:
                    idf_count[word] += 1
                else:
                    idf_count[word] = 1
        idf_count[word] = 1.0 + math.log(float(len(result.keys())) / idf_count[word])

    return idf_count

def get_tf_idf(tf_count, idf_count):
    tf_idf_count = {}
    for doc in tf_count.keys():
        tf_idf_count[doc] = {}
        for word in tf_count[doc].keys():
            if word in tf_idf_count[doc]:
                continue
            tf_idf_count[doc][word] = {}
            tf_idf_count[doc][word] = tf_count[doc][word] * idf_count[word]
    return tf_idf_count
tf_idf()


app.run(debug=True)


