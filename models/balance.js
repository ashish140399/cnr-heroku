const mongoose = require('mongoose');


const balanceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    balance : {type : String},
    date : {type : Date}
});


module.exports = mongoose.model('Balance',balanceSchema);