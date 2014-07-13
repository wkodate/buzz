// import
var express = require('express');
var http    = require('http');
var path    = require('path');
var favicon = require('static-favicon');
var logger  = require('morgan');
var cookieParser   = require('cookie-parser');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var twitter = require('ntwitter');
var routes = require('./routes');
var users  = require('./routes/users');

// environments
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/users', users.list);

// create socket.io instance
var server = http.createServer(app)
var io = require('socket.io').listen(server);
console.log(secret);

// twitter api
var tw = new twitter({
    consumer_key: "CONSUMER_KEY",
    consumer_secret: "CONSUMER_SECRET",
    access_token_key: "ACCESS_TOKEN_KEY",
    access_token_secret: "ACCESS_TOKEN_SECRET"
});

// root page
var keyword;
app.get('/', function(req, res){
    // get keword from post equest
    if (req.query.keyword){
        keyword = req.query.keyword;
    }
    res.render('index', {
        keyword: keyword,
        title: 'TwitterBuzz'
    });
});

// check the connectino to twitter
app.get('/twitterCheck', function(req, res){
    tw.verifyCredentials(function (error, data) {
        res.send("Hello, " + data.name + ".");
    });
});

// io socket connection
io.sockets.on('connection', function(socket){
    console.log("connected");

    // Call Twitter Streaming API
    socket.on('keyword post', function(keyword){
        console.log('received keyword post', keyword);
        // keyword filtering
        tw.stream('statuses/filter', {'track': keyword}, function(stream){
            console.log('tw.stream start');

            stream.on('data', function (data){
                var message = data.user['screen_name'] + "\t" + data.text;
                console.log(message);
                io.sockets.emit('message', message);
            });

            stream.on('end', function(response){
                //Handle a disconnection
                console.log('disconnected');
            });

            stream.on('destroy', function(response){
                //Handle a 'silent' disconnection from Twitter, 
                //no end/error event fired
                console.log(response);
            });

            stream.on('error', function(e){
                console.log(e);
            });

            // timeout if connection disconnected
            //setTimeout(stream.destroy, 5000);
 
        });
    });
});

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port')); 
});

// Error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;
