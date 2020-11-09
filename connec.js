var mongoose = require('mongoose');
var dbRoute ='mongodb+srv://ashish:ashish@cluster0.ydy2x.mongodb.net/ashish';
mongoose.connect(dbRoute, { useNewUrlParser: true }).then(() => {
    console.log('Connected to mongoDB')
}).catch(e => {
    console.log('Error while DB connecting');
    console.log(e);
});