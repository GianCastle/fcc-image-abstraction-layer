//jshint esversion:6
const express = require('express');
const mongoose = require('mongoose');

const MS_BING_KEY = process.env.MS_BING_KEY;
const MONGO_USER = process.env.MONGO_USER;
const DB_PASS = process.env.DB_PASSWORD;
const DB_URL =  `mongodb://${MONGO_USER}:${DB_PASS}@ds025973.mlab.com:25973/fcc-image-abstraction-layer`;
const app = express();
let Search = require('bing.search');
    Search = new Search(MS_BING_KEY);


const SearchTerm = mongoose.model('search', {
    term: String,
    when: Date
});
mongoose.connect(DB_URL);

app.get('/', function(req, res, next) {
    res.send('Image Search Abstraction Layer');
});

app.get('/search/:term', function(req, res, next) {
    const queryTerm = req.params.term;
    const offset = req.query.q;

    let result = [];
    Search.images(queryTerm, {
        top: offset
    }, function(error, results) {
        results.forEach((value, index) => {
            result.push({
                url: value.url,
                snippet: value.title,
                context: value.displayUrl,
                thumbnail: value.thumbnail.url
            });
        });
        const _term = new SearchTerm({
            term: queryTerm,
            when: Date.now()
        }).save((err) => {
            if (err)
                return next(err);

            res.json(result);
        });

    });
});
app.get('/images/latest', function(req, res, next) {
    SearchTerm.find()
        .sort('when')
        .select('term when')
        .exec((err, terms) => res.json((err) ? err : terms));
});

app.listen(process.env.PORT || 3000, function() {
    console.log('The server is running at', proces.env.PORT || 3000);
});
