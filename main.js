#!/usr/bin/env node

'use strict';

const request = require('request');
const fs = require('fs');
const url = "https://api.line.me/liff/v1/apps";

if (!process.env.LINE_ACCESS_TOKEN) {
    if (process.platform === "win32") {
        console.log('Error: set environment variable following command. \nSET LINE_ACCESS_TOKEN={YOUR_LINE_ACCESS_TOKEN}');

    }
    else {
        console.log('Error: set environment variable following command. \n$ export LINE_ACCESS_TOKEN={YOUR_LINE_ACCESS_TOKEN}');
    }
    return;
}

if (process.argv[2] === '?' || process.argv[2] === 'help' || process.argv[2] === 'h') {

    let help = `welcome to liff tool. 

    [usage]
    list: list all registered liff applications.
    add <url> <type:full|tall|compact>: create new liff application.
    update <liffId> <url> <type:full|tall|compact>: update the liff application.
    delete <liffId>: delete specified liff
    deleteAll: delete all liff applications.
    
    [example]
    liff list
    liff add https://developers.line.me/en/docs/liff/overview/ tall
    liff add https://developers.line.me/en/docs/liff/overview/ compact
    liff update 1555709429-5zJQmooA https://developers.line.me/en/docs/liff/overview/ tall
    liff delete 1555709429-5zJQmooA
    liff deleteAll
`;

    console.log(help);
}

else if (process.argv[2] === 'list') {
    listLiff().then((jsonResult) => {
        jsonResult.apps.forEach((l, i) => {
            console.log('---------------------------------------------------');
            console.log(`No.${i + 1}`);
            console.log(`[LIFF ID] ${l.liffId}`);
            console.log(`[LIFF App URL] line://app/${l.liffId}`);
            console.log(`[Type] ${l.view.type}`);
            console.log(`[Web URL] ${l.view.url}`);
        })
    }).catch((reason) => console.log(reason));;
}

else if (process.argv[2] === 'delete') {
    if (!process.argv[3]) {
        console.log('Bad argumentes. i.e. >liff delete 1555709429-rWDWpjjE) ');
        return;
    }

    let liffId = process.argv[3];

    deleteLiff(liffId).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
}

else if (process.argv[2] === 'deleteAll') {
    listLiff().then((jsonResult) => {

        jsonResult.apps.forEach((l, i) => {
            deleteLiff(l.liffId).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
        })
    }).catch((reason) => console.log(reason));
}

else if (process.argv[2] === 'add') {
    if (process.argv.length != 5) {
        console.log('Bad argumentes. i.e. >liff add https://developers.line.me/en/docs/liff/overview/ tall');
        return;
    }

    let app_url = process.argv[3];
    let type = process.argv[4];

    if (type !== "full" || type !== "tall" || type !== "compact") {
        console.log('Supported types are full, tall or compact.');
        return;
    }

    let view = { "view": { "type": type, "url": app_url } };
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

    request(options, (error, response, body) => {
        if (response.statusCode === 401) {
            console.log(`${response.statusCode} Authentication failed.`);
        } else if (response.statusCode === 400) {
            let jsonResult = JSON.parse(body);
            console.log(`${jsonResult.message}`);
        }
        if (response.statusCode !== 200) {
            return;
        }

        let jsonResult = JSON.parse(body);
        console.log(`[LIFF ID] ${jsonResult.liffId} created`);
    });
}

else if (process.argv[2] === 'update') {
    if (process.argv.length != 6) {
        console.log('Bad argumentes. i.e. >liff update 1555709429-7aZa9EEq https://developers.line.me/en/docs/liff/overview/ tall');
        return;
    }

    let liffId = process.argv[3];
    let app_url = process.argv[4];
    let type = process.argv[5];

    let view = { "type": type, "url": app_url };
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

    request(options, (error, response, body) => {
        if (response.statusCode === 401) {
            console.log(`${response.statusCode} Authentication failed.`);
        } else if (response.statusCode === 400) {
            let jsonResult = JSON.parse(body);
            console.log(`${jsonResult.message}`);
        }
        if (response.statusCode !== 200) {
            return;
        }

        console.log(`[LIFF ID] ${liffId} has been updated`);
    });
}

else if (process.argv[2] === 'send') {
    if (process.argv.length != 5) {
        console.log('Bad argumentes. i.e. >liff send 1555709429-7aZa9EEq Ue52d11061890315xxxxxxxxxxx');
        return;
    }

    let liffId = process.argv[3];
    let userId = process.argv[4];
   
    let message = { "to": userId, "messages": [{"type":"text","text":`line://app/${liffId}`}]};
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

    request(options, (error, response, body) => {
        if (response.statusCode === 401) {
            console.log(`${response.statusCode} Authentication failed.`);
            return;
        } else if (response.statusCode === 400) {
            let jsonResult = JSON.parse(body);
            console.log(`${jsonResult.message}`);
            return;
        }
        if (response.statusCode !== 200) {
            let jsonResult = JSON.parse(body);
            console.log(`${jsonResult.message}`);
            return;
        }

        console.log(`Message sent to ${userId}`);
    });
}

function listLiff() {
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
            if (response.statusCode === 401) {
                return reject(`${response.statusCode} Authentication failed.`);
            } else if (response.statusCode === 404) {
                let jsonResult = JSON.parse(body);
                return reject(`${jsonResult.message}`);
            }
            if (response.statusCode !== 200) {
                return reject("something went wrong");
            }

            let jsonResult = JSON.parse(body);
            return resolve(jsonResult);
        });
    })
}

function deleteLiff(liffId) {
    const options = {
        url: `${url}/${liffId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        }
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (response.statusCode === 401) {
                return reject(`${response.statusCode} Authentication failed.`);
            } else if (response.statusCode === 404) {
                return reject(`${response.statusCode} There is no LIFF app on the channel.`);
            }
            if (response.statusCode !== 200) {
                return reject("something went wrong");
            }

            return resolve(`[LIFF ID] ${liffId} has been deleted`);
        });
    })
}