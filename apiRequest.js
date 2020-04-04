const request = require('request');
const url = "https://api.line.me/liff/v1/apps";

var apiRequest = {
    listLiff: function() {
        const options = {
            url: url,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(apiRequest.isFailedStatus(response, body)) { return }

                let jsonResult = JSON.parse(body);
                return resolve(jsonResult);
            });
        })
    },

    deleteLiff: function(liffId) {
        const options = {
            url: `${url}/${liffId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
            }
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(apiRequest.isFailedStatus(response, body)) { return }

                return resolve(`[LIFF ID] ${liffId} has been deleted`);
            });
        })
    },

    updateLiff: function(liffId, view){
        let jsonView = JSON.stringify(view);
        const options = {
            url: `${url}/${liffId}/view`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: jsonView
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(apiRequest.isFailedStatus(response, body)) { return }

                console.log(`[LIFF ID] ${liffId} has been updated`);
            });
        })
    },

    sendLiff: function(liffId, userId){
        let message = { "to": userId, "messages": [{ "type": "text", "text": `https://liff.line.me/${liffId}` }] };
        let jsonMessage = JSON.stringify(message);
        const options = {
            url: `https://api.line.me/v2/bot/message/push`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: jsonMessage
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(apiRequest.isFailedStatus(response, body)) { return }

                console.log(`Message sent to ${userId}`);
            });
        })
    },

    addLiff: function(view){
        let jsonView = JSON.stringify(view);
        const options = {
            url: `${url}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: jsonView
        };

        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if(apiRequest.isFailedStatus(response, body)) { return }
                let jsonResult = JSON.parse(body);
                console.log(`[LIFF ID] ${jsonResult.liffId} created`);
                console.log(`accessible uri : https://liff.line.me/${jsonResult.liffId}`);
            });
        })
    },

    isFailedStatus: function(response, body){
        if (response.statusCode === 401) {
            console.log(`${response.statusCode} Authentication failed.`);
        } else if (response.statusCode === 400) {
            let jsonResult = JSON.parse(body);
            console.log(`${jsonResult.message}`);
        }
        if (response.statusCode !== 200) {
            return true;
        }
        return false
    }
};
module.exports = apiRequest;
