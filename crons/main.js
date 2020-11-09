var CronJob = require('cron').CronJob;
var TronWeb = require('tronweb');
const mongoose = require('mongoose');

const Balance = require('../models/balance');

const tronWeb = new TronWeb({
    fullHost:  'https://api.trongrid.io',
    privateKey : '01'
});


var job = new CronJob('15 3 * * *	', async function() {
    console.log('storing balance value ...');
    var c = await tronWeb.contract().at("TYLrbh1pVcx95bop33XQ1iYdh7r3ogEQ8Q");
    c.balanceOf('TQfKWr7a1mtNhPRUdcqq7mya56wCFDu3Hp').call().then(function(r){
        var balance = parseFloat(r.toString())/1e8;
        balance = new Balance({
            _id: new mongoose.Types.ObjectId(),
            balance  : balance,
            date: Date()
        });
    
        balance.save()
    });
})
job.start();

