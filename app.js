var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
const { check, validationResult } = require('express-validator');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/customerApp";


var app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use(function(req, res, next){
    res.locals.errors = null;
    res.locals.users = null;
    next();
});

function getUsers(res){
    MongoClient.connect(url, {useNewUrlParser:true},function(err, db) {
        if (err) throw err;
        var dbo = db.db("customerApp");
        dbo.collection("users").find({}).toArray(function(err, result) {
            if (err) throw err;
            users = result;
            db.close();
            res.render('index', {
                title: 'Customers',
                users: users
            });
        });
    });
}

function insertUser(usr){
    MongoClient.connect(url, {useNewUrlParser:true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db("customerApp");
        dbo.collection("users").insertOne(usr, function(err, res) {
            if (err) throw err;            
            db.close();            
        });
    });
}

app.get('/', function(req, res){
    getUsers(res);
});

app.post('/users/add', [
        check('first_name', 'First Name is required').not().isEmpty(),
        check('last_name', 'Last Name is required').not().isEmpty(),
        check('email', 'Email is required').isEmail()
    ],
         
    function(req, res){
        errors = validationResult(req).array();
        if(errors.length>0){
            console.log('Failed...')
            
            console.log(errors);
            res.render('index',{
                title: 'Customers',
                users: users,
                errors: errors
            })
        }else{
            console.log('Success')
            var newUser = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email
            }
            insertUser(newUser);
            res.redirect('/');
        }
    }
);

app.listen(3000, function(){
    console.log('Server Started on Port 3000...')
});