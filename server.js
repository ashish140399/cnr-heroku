var express = require('express');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ashish:ashish@cluster0.ydy2x.mongodb.net/ashish',{ useNewUrlParser: true ,useUnifiedTopology: true});


require('./crons/main');
//INIT
var app = express();
const port =   process.env.PORT ;
var apiroutes = require('./routes/api');

//app.use(sslRedirect());
app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', engines.ejs);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', apiroutes);

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});


//error handling start
app.use( (req,res,next) => {
    res.render('index');
});

app.use( (err,req,res,next) => {
    res.status(err.status || 500);
    res.json({
        error :{
            message : err.message,
        }
    });
});
//error handling end


var server = app.listen(port , function(){
    console.log('running server on port : ' + 8080);
});
