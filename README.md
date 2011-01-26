twitter-stalker
===============

This little script will poll Twitter timelines for users you specify, and
send an SMS for every tweet that arrives. Tropo is used to send the actual
SMS.

Usage
-----

1. Sign up for a [Tropo](https://www.tropo.com/) account
2. On Tropo, create a script (ending with .js) containing the following (replace with your number as a catchall):

    text = msg ? msg : (currentCall.callerID + ": " + currentCall.initialText);
    number = number ? number : "+15555551234"; // backup number in case none
    message(text, {"to": "tel:" + number, "network": "SMS"});

3. cp config.json.example config.json
4. Edit config.json with your Tropo API key, stalkees, and the number to SMS
5. node stalker.js
