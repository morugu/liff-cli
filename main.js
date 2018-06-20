#!/usr/bin/env node

'use strict';

const request = require('request');
const fs = require('fs');

if (!process.env.LINE_ACCESS_TOKEN) {
    console.log('Error: set environment variable following command. \n$ export LINE_ACCESS_TOKEN={YOUR_LINE_ACCESS_TOKEN}');
    return;
}

if (process.argv[2] === 'init') {
    // TODO: initialize with line access token
}

if (process.argv[2] === 'token') {
    // TODO: confirm setted line access token
}

if (process.argv[2] === 'add') {

}

if (process.argv[2] === 'list') {
    const options = {
        url: 'https://api.line.me/liff/v1/apps',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    request(options, (error, response, body) => {
        if (response.statusCode === 401) {
            console.log(`${response.statusCode} Authentication failed.`);
        } else if (response.statusCode === 404) {
            console.log(`${response.statusCode} There is no LIFF app on the channel.`);
        }
        if (response.statusCode !== 200) {
            return;
        }

        let jsonResult = JSON.parse(body);
        jsonResult.apps.forEach((l, i) => {
            console.log('---------------------------------------------------');
            console.log(`No.${i+1}`);
            console.log(`[LIFF ID] ${l.liffId}`);
            console.log(`[LIFF App URL] line://app/${l.liffId}`);
            console.log(`[Type] ${l.view.type}`);
            console.log(`[Web URL] ${l.view.url}`);
        });
    });
}
