twitter-stalker
===============

This little script will poll Twitter timelines for users you specify, and
send an SMS for every tweet that arrives. Tropo is used to send the actual
SMS.

Tropo Script
------------

You'll need to sign up for a [Tropo](https://www.tropo.com/) account and
create the following script (file must end with .js):

    text = msg ? msg : (currentCall.callerID + ": " + currentCall.initialText);
    number = number ? number : "+15555551234"; // backup number in case none
    message(text, {"to": "tel:" + number, "network": "SMS"});


Usage
-----

1. cp config.json.example config.json
2. Edit config.json with your Tropo API key, stalkees, and the number to SMS
3. node stalker.js
