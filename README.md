 
Url Shortner Microservice

This is a simple site that shortens the url passed by the user
Write '/new/' (without the double quotes) and the url for which you want the short form, after the present url in address bar and press enter. Then you will get Json response. Then if you visit the output url in the Json response you will be redirected to original url



Examples:


1. Input: https://bunny-url-ms.herokuapp.com/new/https://www.google.com

Output:

{

input_url: https://bunny-url-ms.herokuapp.com/new/https://www.google.com ,

output_url: https://bunny-url-ms.herokuapp.com/45214

}



2. Input: https://bunny-url-ms.herokuapp.com/new/https://www.facebook.com:80

Output:

{

input_url: https://bunny-url-ms.herokuapp.com/new/https://www.facebook.com:80 ,

output_url: https://bunny-url-ms.herokuapp.com/45214

}








=========================================================================================



Prerequisites for setting up the server and mongodb:
---------------------------------------------------


Install mongodb module for nodejs.

==> sudo npm install mongodb -g




Database configuration for this app.

==> use short-urls


Then need to create a collection(Here we are capping the urls collection for auto deleting the 
documents when they reaches the max).

==> db.urls.createCollection('urls', {autoIndexID: true, capped: true, size:5120, max: 60000})


Then we also need to create another collection for the number.

==> db.createCollection("keyNumbers", {autoIndexID: true})


Then we should insert the num and 1 as key value pairs for our Node server to work properly.

==> db.keyNumbers.insert({'num': 1})

