var express = require('express');

const Balance = require('../models/balance');
var router = express.Router();
var moment = require('moment');


router.get('/api/balances', function(req, res, next) {
   
    Balance.find().sort('-date').limit(10).exec().then(function(docs){
        var data = [];
        docs.forEach(function(doc){       
            data.push({balance :doc.balance  , date : doc.date})
        });
        res.json(data);
    })
});


module.exports = router;