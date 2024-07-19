var admin = require("firebase-admin");
var serviceAccount = require("./sport-empire-firebase-sdk.json");
const { env } = require("../../config/vars");

var options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

exports.init = () => {
    console.log("Init Firebase...");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

exports.sendToDevice = (registrationToken, title, body) => {
    
    var payload = {
        notification: {
            title: title,
            body: body
        }
    };

    console.log(payload);

    if(env != "production") {
        console.log("Noti Test Send...");
        return;
    }
    
    admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function (response) {
            console.log("Success send message:", response);
        })
        .catch(function (error) {
            console.log("Error sending message:", error);
        });
}

exports.sendToTopic = (topic, title, body) => {

    var payload = {
        notification: {
            title: title,
            body: body
        }
    };

    console.log(payload);

    if(env != "production") {
        console.log("Noti Test Send...");
        return;
    }
    
    admin.messaging().sendToTopic(topic, payload)
        .then(function (response) {
            console.log("Topic send response:", response);
        })
        .catch(function (error) {
            console.log("Error sending message:", error);
        });
}