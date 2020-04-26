#!/usr/bin/env node

'use strict';

const request = require('request');
require('dotenv').config()
const fs = require('fs');
const apiRequest = require('./apiRequest');

if (process.argv[2] === 'init') {
    if (!process.argv[3]) {
        console.log('Bad argumentes. i.e. >liff init _LINE_ACCESS_TOKEN_) ');
        return;
    }

    const LINE_ACCESS_TOKEN = process.argv[3];
    fs.appendFile('.env', `LINE_ACCESS_TOKEN="${LINE_ACCESS_TOKEN}"`, (err) => {
      if (err) { throw err; }
    });
    console.log(`write ${LINE_ACCESS_TOKEN} in .env file`);
    return
}

if (!process.env.LINE_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN == '') {
    if (process.platform === "win32") {
        console.log('Error: set environment variable following command. \n$ liff init {LINE_ACCESS_TOKEN}');
    }
    else {
        console.log('Error: set environment variable following command. \n$ liff init {LINE_ACCESS_TOKEN}');
    }
    return;
}

if (process.argv[2] === 'list') {
    apiRequest.listLiff().then((jsonResult) => {
        jsonResult.apps.forEach((l, i) => {
            console.log('---------------------------------------------------');
            console.log(`No.${i + 1}`);
            console.log(`[LIFF ID] ${l.liffId}`);
            console.log(`[LIFF App URL] https://liff.line.me/${l.liffId}`);
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

    apiRequest.deleteLiff(liffId).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
}

else if (process.argv[2] === 'deleteAll') {
    apiRequest.listLiff().then((jsonResult) => {

        jsonResult.apps.forEach((l, i) => {
            apiRequest.deleteLiff(l.liffId).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
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

    if (type !== "full" && type !== "tall" && type !== "compact") {
        console.log('Supported types are full, tall or compact.');
        return;
    }

    let view = { "view": { "type": type, "url": app_url } };
    apiRequest.addLiff(view).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
}

else if (process.argv[2] === 'update') {
    if (process.argv.length != 6) {
        console.log('Bad argumentes. i.e. >liff update 1555709429-7aZa9EEq https://developers.line.me/en/docs/liff/overview/ tall');
        return;
    }

    let liffId = process.argv[3];
    let app_url = process.argv[4];
    let type = process.argv[5];

    if (type !== "full" && type !== "tall" && type !== "compact") {
        console.log('Supported types are full, tall or compact.');
        return;
    }

    let view = { "type": type, "url": app_url };
    apiRequest.updateLiff(liffId, view).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
}

else if (process.argv[2] === 'send') {
    if (process.argv.length != 5) {
        console.log('Bad argumentes. i.e. >liff send 1555709429-7aZa9EEq Ue52d11061890315xxxxxxxxxxx');
        return;
    }

    let liffId = process.argv[3];
    let userId = process.argv[4];

    apiRequest.sendLiff(liffId, userId).then((result) => { console.log(result) }).catch((reason) => { console.log(reason) });
}

else {

    let help = `welcome to liff tool. 
    
        [usage]
        init: set liff commands.
        list: list all registered liff applications.
        add <url> <type:full|tall|compact>: create new liff application.
        update <liffId> <url> <type:full|tall|compact>: update the liff application.
        delete <liffId>: delete specified liff
        deleteAll: delete all liff applications.
        send: send liff application URL to sepecified LINE user.
        
        [example]
        liff init {LINE_ACCESS_TOKEN}
        liff list
        liff add https://developers.line.me/en/docs/liff/overview/ tall
        liff add https://developers.line.me/en/docs/liff/overview/ compact
        liff update 1555709429-5zJQmooA https://developers.line.me/en/docs/liff/overview/ tall
        liff delete 1555709429-5zJQmooA
        liff deleteAll
        liff send 1555709429-5zJQmooA Ue52d11061890315xxxxxxxxxxx
    `;

    console.log(help);
}
