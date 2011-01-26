/**
 * stalker.js
 * Stalk someone on Twitter and send each tweet as an SMS.
 *
 * To use, create a new .js script on Tropo (this also sends mentions to
 * a connected Twitter account, if I'm not mistaken):
 *
 * text = msg ? msg : (currentCall.callerID + ": " + currentCall.initialText);
 * number = number ? number : "+15555551234"; // backup number in case none
 * message(text, {"to": "tel:" + number, "network": "SMS"});
 *
 * Note that Twitter currently limits unauthenticated requests to the user
 * timeline feed to 150 requests per hour per IP address.
 *
 * https://github.com/ammmir/twitter-stalker
 * @author Amir Malik
 * @license MIT License
 */

var http = require('http');

var CONFIG;
try {
  CONFIG = JSON.parse(require('fs').readFileSync('config.json'));
} catch(e) {
  console.log('could not read config.json');
  process.exit(1);
}

var LAST_ID = {};

function getfeed(user, cb) {
  var req = http.createClient(80, 'api.twitter.com').request('GET', '/1/statuses/user_timeline.json?screen_name=' + user + '&count=5&include_rts=1', {'host': 'api.twitter.com'});
  req.end();
  req.on('response', function(res) {
    res.setEncoding('utf8');
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      cb(body);
    });
  });
}

function checkfeeds() {
  console.log('fetching feeds');

  CONFIG['twitter-names'].forEach(function(url) {
    getfeed(url, function(data) {
      console.log('user=' + url + ' length=' + data.length);

      var articles = [];
      try {
        articles = JSON.parse(data);
      } catch(e) {
        console.log("error: " + e);
        console.log(data);
        return;
      }

      for(var i = 0; i < articles.length; i++) {
        if(LAST_ID[url]) {
          if(articles[i].id <= LAST_ID[url]) {
            break;
          } else {
            sendsms(CONFIG['number'], articles[i].user.name + ': ' + articles[i].text);
          }

          LAST_ID[url] = articles[i].id;
        } else { // first fetch
          sendsms(CONFIG['number'], articles[i].user.name + ': ' + articles[i].text);
          LAST_ID[url] = articles[i].id;
          break;
        }
      }
    });
  });
}

function sendsms(number, msg) {
  console.log("sending >>>>>>>>>> " + msg + " <<<<<<<<<<<<<<");

  var msg = encodeURI(msg);
  var tropoSessionAPI = 'api.tropo.com';
  var path = '/1.0/sessions?action=create&token=' + CONFIG['tropo-token'] + '&msg=' + msg + '&number=' + number;

  var req = http.createClient(80, tropoSessionAPI).request('GET', path, {'host': tropoSessionAPI});
  req.end();

  req.on('response', function(res) {
    res.setEncoding('utf8');
    res.addListener('data', function(chunk) {
      console.log('Sent message. Tropo res code:' + res.statusCode + '. Body: ' + chunk);
    });
  });         
}

process.addListener('uncaughtException', function(e) {
  console.log('Uncaught exception: ' + e);
  console.log(e.stack);
});

checkfeeds();
setInterval(checkfeeds, (CONFIG['interval'] || 2) * 60 * 1000);
