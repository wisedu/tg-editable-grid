'use strict';
let express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.locals._layoutFile = 'layout.html';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));




app.use(express.static(path.join(__dirname, '')));


app.set('port', 8009);
let server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});



