"use strict";

var http = require("http");
var https = require("https");
const fs = require('fs');

const cityObj = JSON.parse(fs.readFileSync('./output', 'utf8'));

function checkCity(city){
  if(city.toLowerCase() in cityObj){
    return true;
  }
  return false;
}
const facts = {
  car: ['cf1', 'cf2', 'cf3'],
  bike: ['bf1', 'bf2'],
  walk: ['wf1', 'wf2', 'wf3']
}
function getRandomIndex(max){
  return Math.floor(Math.random() * (max-1));
}
function getRandomFact(type){
  const currentType = facts[type];
  return currentType[getRandomIndex(currentType.length)];
}

exports.handler = function(event,context) {

  try {

    if (process.env.NODE_DEBUG_EN) {
      console.log("Request:\n"+JSON.stringify(event,null,2));
    }

    var request = event.request;
    var session = event.session;

    if (!event.session.attributes) {
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

        handleCityNameIntent(request,context,session);

      }  else if (request.intent.name === "NextCityIntent") {

        handleNextCityIntent(request,context,session);

    } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
        context.succeed(buildResponse({
          speechText: "Promote Green Environment . Go Green. Good bye. ",
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
  options.speechText =  "Welcome to Green Score. Using Green Score you can get walk and bike scores of cities in the United States."
  + "<break time='1s'/> You can say for example, get me Green Score information for Seattle";
  options.repromptText = "You can say for example, get me Green Score information for Seattle";
  options.endSession = false;
  context.succeed(buildResponse(options));
}

function handleCityNameIntent(request,context,session) {
  let options = {};
  let city = request.intent.slots.CityName.value.toLowerCase();
  //options.speechText = 'OK city name is' + city;
  //options.speechText += getWish();
console.log(175, city);
  if(!checkCity(city)){
    options.speechText = 'Invalid City Name';
    options.endSession = false;
    return context.succeed(buildResponse(options));
  }
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
          options.speechText = "<s>Walkscore for " + city+' is '+resp.walkscore+' and the area is '+resp.description+"</s>";
        if(resp.walkscore>70 && resp.walkscore<101){
          //options.speechText += "<break time='1s'/> Fun Facts for walkable places: <break strength='strong'/> people in walkable places weigh 6-10 pounds less <break strength='strong'/> walkable neighborhoods reduces carbon emissions and make people happier<break strength='strong'/>";
          options.speechText += getRandomFact('walk');
          } else {
          //options.speechText += "<break time='1s'/> Facts for car-dependent places: <break strength='strong'/> Drive smart! Don't idle: Unnecessary idling wastes fuel and harms your vehicle. If you're stopping for longer than 10 seconds (except in traffic of course!), turn off the engine <break strength='strong'/>Minimize air conditioning: To stay cool on the highway, use your car's flow-through ventilation. <break strength='strong'/>";
          options.speechText += getRandomFact('car');
          }
        }
        /*if(resp.transit && resp.transit.score){
          options.speechText += "<break time='1s'/>Transit score is " + resp.transit.score + ' and the area is '+ resp.transit.description+".";
        } else {
          options.speechText += "<break time='1s'/>Transit score is not available"
        }
        */
        if(resp.bike && resp.bike.score){
          options.speechText += "<break time='1s'/>Bike score is "+ resp.bike.score + ' for' + city+ ' and the area is ' + resp.bike.description+".";
          //options.speechText += "<break time='1s'/> Biking Facts : <break strength='strong'/> riding your bike to work rather than car can cut down your household emissions by minimum 6 percent   <break time='1s'/> cars produce point 97 pounds of pollution per mile annually; bikes produce none. Bikes are also up to 50% faster than cars during rush hour. <break strength='strong'/>";
          options.speechText += getRandomFact('bike');
        } else {
          options.speechText += "<break time='1s'/>Bike score is not available for"+city;
        }
        options.cardTitle= "Walk and Bike scores for " +city
        options.cardContent ="Walkscore for " + city+" is "+resp.walkscore+" and the area is "+resp.description+ "\nBike score is "+ resp.bike.score + " for " + city+ " and the area is " + resp.bike.description+"\n For more information around scores visit: - "+resp.more_info_link;
        //options.imageUrl = resp.ws_link;
        options.session = session;
        options.speechText +="<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> just say the city name";
        options.repromptText="You can say yes or one more.";
        options.session.attributes.NextCityIntent=true;
        options.endSession = false;
        context.succeed(buildResponse(options));
      }
    });
  })
}

function handleNextCityIntent(request,context,session) {
  let options = {};
  options.session = session;
  const city = request.intent.slots.CityName.value.toLowerCase();
  console.log(233, city);
  if(!checkCity(city)){
    options.speechText = 'Invalid City Name';
    options.endSession = false;
    return context.succeed(buildResponse(options));
  }
if(session.attributes.NextCityIntent) {
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
        options.speechText +="<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> just say the city name";
        const city = request.intent.slots.CityName.value;
        options.repromptText="You can say yes or one more.";
          //options.speechText =resp.description;
          if(resp.walkscore){
            options.speechText = "<s>Walkscore for " + city+' is '+resp.walkscore+' and the area is '+resp.description+"</s>";
          } 
          if(resp.bike && resp.bike.score){
            options.speechText += "<break time='1s'/>Bike score is "+ resp.bike.score + 'for' + city+ ' and the area is ' + resp.bike.description+".";
         
          } else {
            options.speechText += "<break time='1s'/>Bike score is not available for"+city;
          }
          options.cardTitle= "Walk and Bike scores for " +city
          options.cardContent ="Walkscore for " + city+" is "+resp.walkscore+" and the area is "+resp.description+ "\nBike score is "+ resp.bike.score + " for " + city+ " and the area is " + resp.bike.description+"\n For more information around scores visit: - "+resp.more_info_link;
          options.endSession = false;
          options.speechText +="<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> just say the city name";
          options.session.attributes.NextCityIntent=true;
          context.succeed(buildResponse(options));
        }
      });
    })
  } else {
    options.speechText = " Wrong invocation of this intent. ";
    options.endSession = true;
    context.succeed(buildResponse(options));
  }
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
      //console.log(186, score);
      callback(null, score);
    });

  });

  req.on('error', function(err) {
    callback(err);
  });
  
}
