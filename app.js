var http = require("http");
var fs = require("fs");
var url = require("url");
var mongo = require("mongodb").MongoClient;




function checkInput(input) { /*This function is to check whether the input url is valid or not*/
    var arr = input.split('.');
    if (arr.length >= 2) {
        if (input.substring(0, 7) === "http://") {
            if (/\w/.test(input[7]) === true) {
                return true;
            }
        } else if (input.substring(0, 8) === "https://") {
            if (/\w/.test(input[8]) === true) {
                return true;
            }
        }
    }
}


function noWebsiteFound(response){ /*This function is to send the eroor if the user searched for invalid short links in root directory '/'*/
    response.writeHead(200, { "Content-Type": "text/json" });
    response.end(JSON.stringify({
        "error": "No website found in the data base!"
    }));
}


http.createServer(function (request, response) { /*http server!*/
    var inputUrl = url.parse(request.url, true); /*Making the url readable*/
    var input = inputUrl.path.substring(1, inputUrl.length); /*Removing the '/' from the url*/
    if(input[input.length - 1] == "/"){ /*Also remove the '/' if present at the end of the url*/
        input = input.substring(0, input.length - 1);
    }
    if (inputUrl.path == '/') { /*When user lands on site serve him the index.html*/
        var data = fs.readFileSync('./index.html');
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(data);
    } else if (input.substring(0, 3) == 'new' || input.substring(0, 4) == "new/") { /*If the user wanna make a url shorten*/
        input = input.substring(4, input.length);
        if (checkInput(input) === true) { /*Check if the url is in valid format*/
            mongo.connect('mongodb://127.0.0.1/short-urls', function (err, db) { /*Connecting to mongodb*/
                if (err) {
                    console.error(err);
                    db.close(); /*Don't forget to close the db*/
                } else {
                    db.collection('urls').findOne({ "url": input }, function (erra, data) { /*Check if the url exists in the collection(here the collection name is 'urls'*/
                        if (data == null) { /*If no url exists in the database then add a new doc to the collection urls*/
                            var number;
                            db.collection('keyNumbers').find({ "num": {$gte : 1} }).toArray(function (errb, datab) { /*Get the number to count and generate the short url*/
                                if (errb) {
                                    console.log(errb);
                                } else {
                                    number = datab[0]["num"];
                                    var shorturl = "https://bunny-url-ms.herokuapp.com/" + number;
                                    db.collection('urls').insert({ "url": input, "short": number, "short-url": shorturl }); /*Insert the url into the collection*/
                                    db.collection('urls').find({ "short": number }).toArray(function (errOne, dataOne) { /*Now make a query to database and serve the Json to the user*/
                                        if (errOne) {
                                            console.log(errOne)
                                        } else {
                                            response.writeHead(200, { "Content-Type": "text/json" });
                                            response.end(JSON.stringify({
                                                "original-url": dataOne[0]["url"],
                                                "short-url": dataOne[0]["short-url"],
                                            }));
                                            db.collection('keyNumbers').update({'num': number}, {$set: {'num': number + 1}}); /*Update the number for the next use*/
                                            db.close(); /*Don't forget to close the db*/
                                        }
                                    });
                                }
                            });
                        } else { /*If the url that user wanted to shorten, already exists in database then serve him the existing short url*/
                            db.collection('urls').find({ "url": input }).toArray(function (err, data) { /*Making the query to the database for the existing short url*/
                                if (err) {
                                    console.log(err);
                                    db.close();
                                } else { /*Serving the Json*/
                                    response.writeHead(200, { "Content-Type": "text/json" });
                                    response.end(JSON.stringify({
                                        "original-url": data[0]["url"],
                                        "short-url": data[0]["short-url"]
                                    }));
                                    db.close(); /*Don't forget to close the db*/
                                }
                            });
                        }
                    });
                }
            });
        } else { /*Else if the user failed to enter a valid url format then serve him the error!*/
            response.writeHead(200, { "Content-Type": "text/json" });
            response.end(JSON.stringify({
                "error": "In correct url format. please use a real domain name with correct url format!"
            }));
        }
    } else if(typeof Number(input) === "number"){ /*Check whether the short url entered by user is a number*/
        mongo.connect('mongodb://127.0.0.1/short-urls', function (err, db) { /*If its a valid number make a connection to the database*/
           if(err){
               console.error(err);
           } else {
               db.collection("urls").findOne({"short": Number(input)}, function(err, data){ /*Check if the short url exists in our database*/
                  if(err){
                      console.error(err);
                      db.close();
                  } else if(data == null){ /*If not found serve him the error json*/
                      noWebsiteFound(response);
                      db.close();
                  } else { /*If found sredirect to original url*/
                      response.writeHead(301, {Location: data["url"]});
                      response.end();
                      db.close();
                  }
               });
           }
        });
    } else { /*Serving the error for entering wrong short url*/
        noWebsiteFound(response);
    }
}).listen(process.env.PORT);