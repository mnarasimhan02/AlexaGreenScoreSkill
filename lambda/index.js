"use strict";

var http = require("http");
var https = require("https");
const fs = require('fs');
var APP_ID = 'amzn1.ask.skill.6828f458-9656-4092-b8a2-ee0b43020ff5';

const cityObj = JSON.parse(fs.readFileSync('./output', 'utf8'));

function checkCity(city) {
    if (city.toLowerCase() in cityObj) {
        return true;
    }
    return false;
}
const facts = {
    car: ["<break time='1s'/>Short car trips waste more fuel and create more pollutants than long car trips.",
        "<break time='1s'/>Heavy cars with big engines use a lot of fuel per distance travelled, releasing more CO2 and worsening climate change.",
        "<break time='1s'/>The effects of car pollution are widespread, affecting air, soil and water quality.",
        "<break time='1s'/>To be truly sustainable electric cars need to be powered by clean and renewable energy sources such as solar and wind.",
        "<break time='1s'/>When buying a new car, check the fuel economy and environment label. High ratings mean low pollution levels.",
        "<break time='1s'/>Emissions from cars are greatest when an engine is cold. The first few minutes when you start up and then drive your car produces the highest emissions because the emissions control equipment has not yet reached its optimal operating temperature.",
        "<break time='1s'/>One of the best ways individuals can contribute to reducing air pollution is to leave the car at home for short trips and walk instead.",
        "<break time='1s'/>Carpool is an efficient way to share fuel and parking costs with the people in your neighborhood.",
        "<break time='1s'/>Turn off your engine when you are not driving - 10 seconds of waiting with your car on while parked uses more fuel and pollutes more than restarting your engine.",
        "<break time='1s'/>Be fuel efficient - Accelerating smoothly and maintaining a steady speed can also help lower fuel use.",
        "<break time='1s'/>Keep your vehicle well-maintained, with regular tune-ups and tire checks, and leave the car at home whenever you can.",
        "<break time='1s'/>Collectively, cars and trucks account for nearly one-fifth of all US emissions, emitting around 24 pounds of carbon dioxide and other global-warming gases for every gallon of gas.",
        "<break time='1s'/>Before buying a car, think about whether you really need it or not. If you decide you really need a car then buy the car with the lowest CO2 emissions which meets your needs.",
        "<break time='1s'/>Time spent idling in traffic releases emissions, so a person who avoids rush hour traffic may release less emissions than one who does not.",
        "<break time='1s'/>A small compact car or a hybrid will probably have a smaller effect on the environment than a large truck or van.",
        "<break time='1s'/>Cars can cause pollution in other ways, too. Oil that leaks from cars and gasoline spills at gas stations release toxins into the ground. Improper disposal of car fluids like motor oil can also harm the environment.",
        "<break time='1s'/>The best way to decrease your vehicle miles traveled and your polluting potential is to live close to where you work. If you live within walking or biking distance, then you have it made"
    ],
    bike: ["<break time='1s'/>Companies benefit when employees avoid sitting in traffic, earning back nearly two days worth of time every year.",
        "<break time='1s'/>Biking even just a couple miles to work can increase cardiovascular fitness and reduce cancer mortality.",
        "<break time='1s'/>Road traffic noise is a major contributor to high noise levels, hence biking particularly around schools and places of work is very efficient form of commute.",
        "<break time='1s'/>Riding a bike, however, contributes zero pollutants, a statistic that is definitely a pro for the environment.",
        "<break time='1s'/>An increase in bike ridership could cut down on oil consumption over the next decade, because bicycles consume no fuel.",
        "<break time='1s'/>Parking lots are a problem for the environment -  parking bikes requires little space, which means that bikes help minimize the heat island effect and also preserve habitats.",
        "<break time='1s'/>Biking significantly reduces transportation emissions while also reducing traffic congestion and the need for petroleum.",
        "<break time='1s'/>Biking enables people to interact socially and feel more at home in their local community.",
        "<break time='1s'/>More people cycling and walking provides additional opportunity for social interaction on the streets and this enhances a sense of community.",
        "<break time='1s'/>Riding to work, school, university or college, or taking your bike to short neighbourhood trips is a convenient and practical way to incorporate regular exercise into your busy day.",
        "<break time='1s'/>Shared cycling and pedestrian facilities also create benefits for pedestrians and people with disabilities by providing an increased network of paths and improved road crossings.",
        "<break time='1s'/>Cycling conserves roadway and residential space, thereby providing opportunities for less cement and more plant life in urban areas.",
        "<break time='1s'/>Bicycling has some of the same health and social benefits as walking, but provides you a bigger travel range. Plus, it does not emit a single molecule of greenhouse gas!"
    ],
    walk: ["<break time='1s'/> <break strength='strong'/> people in walkable places weigh 6-10 pounds less.",
        "<break time='1s'/> Walkable neighborhoods reduces carbon emissions and make people happier.<break strength='strong'/>",
        "<break time='1s'/> Skilled workers increasingly want to live in walkable and centrally located places close to services, amenities and job opportunities.",
        "<break time='1s'/> Physical activity including walking has been associated with a risk reduction for premature death and a number of chronic diseases.",
        "<break time='1s'/> Walkable neighborhoods make getting around far more affordable for every member of a community, with a particularly significant impact on low-income populations.",
        "<break time='1s'/> Walking 30 minutes a day, five days a week, adds 1.3-1.5 years to your life, on average. This means that for every minute you spend walking, you get three back.",
        "<break time='1s'/> Compact, walkable neighborhoods allow families to make fewer trips in their cars<break strength='strong'/>, travel less to meet their everyday needs – and thus reduce their contribution to global warming.",
        "<break time='1s'/> People who live in the most-walkable neighborhoods are 2.4 times as likely to walk for 30 minutes or more than those who lived in the least-walkable communities.",
        "<break time='1s'/>Many car trips are quite short, less than 2 km, indicating that walking or biking could be a feasible alternative.",
        "<break time='1s'/>Keep it easy by slowly building up the amount you walk each day, replacing those short car journeys with walking instead."
    ]
}

function getRandomIndex(max) {
    return Math.floor(Math.random() * (max - 1));
}

function getRandomFact(type) {
    const currentType = facts[type];
    return currentType[getRandomIndex(currentType.length)];
}

exports.handler = function(event, context) {

    try {

        if (process.env.NODE_DEBUG_EN) {
            console.log("Request:\n" + JSON.stringify(event, null, 2));
        }

        if (APP_ID !== '' && event.session.application.applicationId !== APP_ID) {
            context.fail('Invalid Application ID');
        }

        var request = event.request;
        var session = event.session;

        if (!event.session.attributes) {
            event.session.attributes = {};
        }

        /*
          i)   LaunchRequest       Ex: "Open greenscore"
          ii)  CityNameIntent      Ex: "baltimore"
          iii) NextCityIntent      Ex: " yes charlotte"
          iv) SessionEndedRequest  Ex: "exit" or error or timeout
        */

        if (request.type === "LaunchRequest") {
            handleLaunchRequest(context);

        } else if (request.type === "IntentRequest") {
            if (request.intent.name === "CityNameIntent") {

                handleCityNameIntent(request, context, session);

            } else if (request.intent.name === "NextCityIntent") {

                handleNextCityIntent(request, context, session);
            } else if (request.intent.name === "AMAZON.HelpIntent") {
               context.succeed(buildResponse({
                    speechText: "Using Green Score you can get walk and bike scores of cities in the United States. <break time='1s'/> You can say for example, get me Green Score for Seattle or what is the score for Seattle. <break time='1s'/> If you want to exit the skill, just say stop.'",
                    endSession: true
                }));

            } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent" || request.intent.name === "AMAZON.NoIntent"  ) {
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
    } catch (e) {
        context.fail("Exception: " + e);
    }
}


function getGeoCode(city, callback) {

    const API_KEY = 'AIzaSyAeikm6Xn70P1S7-rzs7HO_iQ7m3dOwXVM';
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=' + API_KEY;
    var req = https.get(geocodeUrl, function(res) {
        var body = "";

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            //removing escape characters for parsing
            body = body.replace(/\\/g, '');
            //converts string to JS object
            var result = JSON.parse(body);
            //console.log(186, result);

            if (!result.results.length) {
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

    if (process.env.NODE_DEBUG_EN) {
        console.log("buildResponse options:\n" + JSON.stringify(options, null, 2));
    }

    var response = {
        version: "1.0",
        response: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + options.speechText + "</speak>"
            },
            shouldEndSession: options.endSession
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>" + options.repromptText + "</speak>"
            }
        };
    }

    if (options.cardTitle) {
        response.response.card = {
            type: "Simple",
            title: options.cardTitle
        }

        if (options.imageUrl) {
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

    if (options.session && options.session.attributes) {
        response.sessionAttributes = options.session.attributes;
    }

    if (process.env.NODE_DEBUG_EN) {
        console.log("Response:\n" + JSON.stringify(response, null, 2));
    }

    return response;
}

function handleLaunchRequest(context) {
    let options = {};
    options.speechText = "Welcome to Green Score. Using Green Score you can get walk and bike scores of cities in the United States." +
        "<break time='1s'/> You can say for example, get me Green Score for Seattle or what is the score for Seattle";
    options.repromptText = "You can say for example, get me Green Score for Seattle or what is the score for Seattle";
    options.endSession = false;
    context.succeed(buildResponse(options));
}

function handleCityNameIntent(request, context, session) {
    let options = {};
    let city = request.intent.slots.CityName.value.toLowerCase();
    //options.speechText = 'OK city name is' + city;
    //options.speechText += getWish();
    if (!checkCity(city) || city==="") {
        options.speechText = 'Looks like you have provided an invalid City Name. The skill provides scores only for valid US cities. If you want to exit the skill, just say stop.';
        options.endSession = false;
        return context.succeed(buildResponse(options));
    }
    options.cardTitle = 'Green Score information for ' + city;
    getGeoCode(city, function(err, location) {
        console.log(189, location);
        if (err) {
            console.log(err);
            //return 
        }
        getScore(city, location, function(err, resp) {
            //console.log(158, resp, err)
            if (err) {
                context.fail(err);
            } else {
                //options.speechText =resp.description;
                options.cardContent = '';
                if (resp.walkscore) {
                    options.speechText = "<s>Walkscore for " + city + ' is ' + resp.walkscore + ' and the area is ' + resp.description + "</s>";
                    if (resp.walkscore > 70 && resp.walkscore < 101) {
                        //options.speechText += "<break time='1s'/> Fun Facts for walkable places: <break strength='strong'/> people in walkable places weigh 6-10 pounds less <break strength='strong'/> walkable neighborhoods reduces carbon emissions and make people happier<break strength='strong'/>";
                        options.speechText += "<break time='1s'/> Fact about walking neighborhoods:" + getRandomFact('walk');
                    } else {
                        //options.speechText += "<break time='1s'/> Facts for car-dependent places: <break strength='strong'/> Drive smart! Don't idle: Unnecessary idling wastes fuel and harms your vehicle. If you're stopping for longer than 10 seconds (except in traffic of course!), turn off the engine <break strength='strong'/>Minimize air conditioning: To stay cool on the highway, use your car's flow-through ventilation. <break strength='strong'/>";
                        options.speechText += "<break time='1s'/> Fact about car-dependant cities:" + getRandomFact('car');
                    }
                    options.cardContent += "Walkscore for " + city + " is " + resp.walkscore + " and the area is "  + resp.description;                }
                /*if(resp.transit && resp.transit.score){
                  options.speechText += "<break time='1s'/>Transit score is " + resp.transit.score + ' and the area is '+ resp.transit.description+".";
                } else {
                  options.speechText += "<break time='1s'/>Transit score is not available"
                }
                */
                if (resp.bike && resp.bike.score) {
                    options.speechText += "<break time='1s'/>Bike score is " + resp.bike.score + ' for' + city + ' and the area is ' + resp.bike.description + ".";
                    //options.speechText += "<break time='1s'/> Biking Facts : <break strength='strong'/> riding your bike to work rather than car can cut down your household emissions by minimum 6 percent   <break time='1s'/> cars produce point 97 pounds of pollution per mile annually; bikes produce none. Bikes are also up to 50% faster than cars during rush hour. <break strength='strong'/>";
                    options.speechText += "<break time='1s'/> Fact about bikable neighborhoods" + getRandomFact('bike');
                    options.cardContent += "\nBike score is " + resp.bike.score + " for " + city + " and the area is " + resp.bike.description;
                } else {
                    options.speechText += "<break time='1s'/>Bike score is not available for" + city;
                }
                options.cardTitle = "Walk and Bike scores for " + city;
                options.cardContent += "\nScores powered by Walk Score® https://www.walkscore.com/";
                //options.imageUrl = resp.ws_link;+
                options.session = session;
                options.speechText += "<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> just say yes followed by city name";
                options.repromptText = "You can say yes or one more.";
                options.session.attributes.NextCityIntent = true;
                options.endSession = false;
                context.succeed(buildResponse(options));
            }
        });
    })
}

function handleNextCityIntent(request, context, session) {
    let options = {};
    options.session = session;
    const city = request.intent.slots.CityName.value.toLowerCase();
    //console.log(233, city);
    if (!checkCity(city)) {
        options.speechText = 'Looks like you have provided an invalid City Name. The skill provides scores only for valid US cities';
        options.endSession = false;
        return context.succeed(buildResponse(options));
    }
    if (session.attributes.NextCityIntent) {
        getGeoCode(city, function(err, location) {
            //console.log(189, location);
            if (err) {
                console.log(err);
                //return 
            }
            getScore(city, location, function(err, resp) {
                //console.log(158, resp, err)
                if (err) {
                    context.fail(err);
                } else {
                  options.cardContent = '';
                    options.speechText += "<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> just say yes followed by city name";
                    const city = request.intent.slots.CityName.value;
                    options.repromptText = "You can say yes or one more.";
                    //options.speechText =resp.description;
                    if (resp.walkscore) {
                        options.cardContent += "Walkscore for " + city + " is " + resp.walkscore + " and the area is " + resp.description;
                        options.speechText = "<s>Walkscore for " + city + ' is ' + resp.walkscore + ' and the area is ' + resp.description + "</s>";
                    }
                    if (resp.bike && resp.bike.score) {
                        options.speechText += "<break time='1s'/>Bike score is " + resp.bike.score + 'for' + city + ' and the area is ' + resp.bike.description + ".";
                        options.cardContent += "\nBike score is " + resp.bike.score + " for " + city + " and the area is " + resp.bike.description;
                    } else {
                        options.speechText += "<break time='1s'/>Bike score is not available for" + city;
                    }
                    options.cardTitle = "Walk and Bike scores for " + city;
                    options.cardContent += "\nScores powered by Walk Score® https://www.walkscore.com/";
                    options.endSession = false;
                    options.speechText += "<break time='1s'/>Do you want to get score information for another city?<break time='1s'/> say yes followed by city name";
                    options.session.attributes.NextCityIntent = true;
                    context.succeed(buildResponse(options));
                }
            });
        })
    } else {
        options.speechText = " Wrong invocation. Start greenscore session to continue. ";
        options.endSession = true;
        context.succeed(buildResponse(options));
    }
}

function getScore(city, location, callback) {
    var url = 'http://api.walkscore.com/score?format=json&address=' + city + '&lat=' + location.lat +
        '&lon=' + location.lng + '&transit=1&bike=1&wsapikey=fd849fcadadf4c953c1329a023c60e48';
    var req = http.get(url, function(res) {
        var body = "";

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            //removing escape characters for parsing
            body = body.replace(/\\/g, '');
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