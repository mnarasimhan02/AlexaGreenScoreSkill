"use strict";

var http = require("http");
var https = require("https");

exports.handler = function(event,context) {

  try {

    if(process.env.NODE_DEBUG_EN) {
      console.log("Request:\n"+JSON.stringify(event,null,2));
    }

    var request = event.request;
    var session = event.session;

    if(!event.session.attributes) {
      event.session.attributes = {};
    }

    /*
      i)   LaunchRequest       Ex: "Open greeter"
      ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
      iii) SessionEndedRequest Ex: "exit" or error or timeout
    */

    if (request.type === "LaunchRequest") {
      handleLaunchRequest(context);

    } else if (request.type === "IntentRequest") {

      if (request.intent.name === "CityNameIntent") {

        handleCityNameIntent(request,context);

      } else if (request.intent.name === "QuoteIntent") {

        handleQuoteIntent(request,context,session);

      } else if (request.intent.name === "NextQuoteIntent") {

        handleNextQuoteIntent(request,context,session);

      } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
        context.succeed(buildResponse({
          speechText: "Good bye. ",
          endSession: true
        }));

      } else {
        throw "Unknown intent";
      }

    } else if (request.type === "SessionEndedRequest") {

    } else {
      throw "Unknown intent type";
    }
  } catch(e) {
    context.fail("Exception: "+e);
  }
}


function getGeoCode(city, callback){

  const API_KEY = 'AIzaSyAeikm6Xn70P1S7-rzs7HO_iQ7m3dOwXVM';
  const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=' + API_KEY;
  //var url = "http://api.walkscore.com/score?format=json&address=Seattle&lat=47.6085"+
  //"&lon=-122.3295&transit=1&bike=1&wsapikey=fd849fcadadf4c953c1329a023c60e48"
  var req = https.get(geocodeUrl, function(res) {
    var body = "";

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      //removing escape characters for parsing
      body = body.replace(/\\/g,'');
      //converts string to JS object
      var result = JSON.parse(body);
      console.log(186, result);
      
      if(!result.results.length){
        return callback(new Error('Invalid Response from google'));
      }
      var location = result.results[0].geometry.location;
      callback(null, location);
    });

  });

  req.on('error', function(err) {
    callback(err);
  });
}

function buildResponse(options) {

  if(process.env.NODE_DEBUG_EN) {
    console.log("buildResponse options:\n"+JSON.stringify(options,null,2));
  }

  var response = {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: "<speak>"+options.speechText+"</speak>"
      },
      shouldEndSession: options.endSession
    }
  };

  if(options.repromptText) {
    response.response.reprompt = {
      outputSpeech: {
        type: "SSML",
        ssml: "<speak>"+options.repromptText+"</speak>"
      }
    };
  }

  if(options.cardTitle) {
    response.response.card = {
      type: "Simple",
      title: options.cardTitle
    }

    if(options.imageUrl) {
      response.response.card.type = "Standard";
      response.response.card.text = options.cardContent;
      response.response.card.image = {
        smallImageUrl: options.imageUrl,
        largeImageUrl: options.imageUrl
      };

    } else {
      response.response.card.content = options.cardContent;
    }
  }

  if(options.session && options.session.attributes) {
    response.sessionAttributes = options.session.attributes;
  }

  if(process.env.NODE_DEBUG_EN) {
    console.log("Response:\n"+JSON.stringify(response,null,2));
  }

  return response;
}

function handleLaunchRequest(context) {
  let options = {};
  options.speechText =  "Welcome to Green Score. Using Green Score you can get walk , bike and transit scores of cities in the United States."
  + "<break time='1s'/> Which city you want go first?<break time='1s'/> You can say for example, get me Green Score information for Seattle";
  options.repromptText = "You can say for example, get me Green Score information for Seattle";
  options.endSession = false;
  context.succeed(buildResponse(options));
}

function handleCityNameIntent(request,context) {
  let options = {};
  const city = request.intent.slots.CityName.value;
  //options.speechText = 'OK city name is' + city;
  //options.speechText += getWish();
  options.cardTitle = 'Green Score information for '+ city;
  getGeoCode(city, function (err, location) {
    console.log(189, location);
    if (err) {
      console.log(err);
      //return 
    }
    getScore(city, location, function(err, resp) {
      console.log(158, resp, err)
      if(err) {
        context.fail(err);
      } else {
        //options.speechText =resp.description;
        if(resp.walkscore){
          options.speechText = "<s>Walkscore for " + city+' is '+resp.walkscore+' and the area is '+resp.description+"."+"</s>";
        }
        if(resp.transit && resp.transit.score){
          options.speechText += "<break time='1s'/>Transit score is " + resp.transit.score + ' and the area is '+ resp.transit.description+".";
        } else {
          options.speechText += "<break time='1s'/>Transit score is not available"
        }
        if(resp.bike && resp.bike.score){
          options.speechText += "<break time='1s'/>Bike score is "+ resp.bike.score + ' and the area is ' + resp.bike.description+".";
        } else {
          options.speechText += "<break time='1s'/>Bike score is not available</s>"
        }
        options.cardContent = resp.description;
        options.imageUrl = resp.ws_link;
        options.endSession = true;
        context.succeed(buildResponse(options));
      }
    });
  })
  
}

function getScore(city, location, callback) {
  //var url = "http://api.forismatic.com/api/1.0/json?method=getScore&lang=en&format=json";
  var url = 'http://api.walkscore.com/score?format=json&address=' + city + '&lat=' + location.lat + 
    '&lon=' + location.lng + '&transit=1&bike=1&wsapikey=fd849fcadadf4c953c1329a023c60e48';
  var req = http.get(url, function(res) {
    var body = "";

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      //removing escape characters for parsing
      body = body.replace(/\\/g,'');
      //converts string to JS object
      var score = JSON.parse(body);
      console.log(186, score);
      callback(null, score);
    });

  });

  req.on('error', function(err) {
    callback(err);
  });
  
}
