import data from './results/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
const https = require('https');
const path = require('path');

function saveImageToDisk(url, localPath) {
    let file = fs.createWriteStream(localPath);
    https.get(url, function (response) {
        response.pipe(file);
    });
}

const imagesParser = (obj) => {
    // let imagePath = 'https://img.lun.ua/building-800x600/'+obj.url;
    console.log(obj);
    let imagePath = obj.url.match(/[0-9]+.jpg|[0-9]+.png|[0-9]+.svg/i);
    if (imagePath.length) {
        imagePath = imagePath[0];
    }
    if (imagePath) {
        const folder = path.join(__dirname, './images/'+obj.id);
        if (!fs.existsSync(folder)){
            fs.mkdirSync(folder);
        }
        const planFolder = path.join(__dirname, './images/'+obj.id+'/plans');
        if (!fs.existsSync(planFolder)){
            fs.mkdirSync(planFolder);
        }

        if (obj.tag === 'house') {
            if (!fs.existsSync(folder+ '/' + imagePath)) {
                console.log(imagePath);
                saveImageToDisk('https:'+ obj.url, folder+ '/' + imagePath);
            }
        }

        if (obj.tag === 'plan') {
            if (!fs.existsSync(planFolder+ '/' + imagePath)) {
                console.log(imagePath);
                saveImageToDisk('https:'+ obj.url, planFolder+ '/' + imagePath);
            }
        }



    }
};


const q = tress((obj, callback) => {
    imagesParser(obj);
    callback();
}, 10); // 10 параллельных потоков


data.map((record) => {
    record.houseImages.map((url) => {
        q.push({url: url, id: record.id, tag: 'house'});
    });
    record.plansImages.map(plan => {
        q.push({url: plan.imagePath, id: record.id, tag: 'plan'});
    });
});