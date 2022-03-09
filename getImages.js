const fetch = require("node-fetch");
const tress = require('tress');
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
    let imagePath = obj.url.match(/[0-9]+.jpg|[0-9]+.png/i);
    if (imagePath && imagePath.length) {
        imagePath = imagePath[0];
    }
    if (imagePath) {
        const folder = path.join(__dirname, '../../garant/public/images/buildings/'+obj.id);
        if (!fs.existsSync(folder)){
            fs.mkdirSync(folder);
        }
        const planFolder = path.join(__dirname, '../../garant/public/images/buildings/'+obj.id+'/plans');
        if (!fs.existsSync(planFolder)){
            fs.mkdirSync(planFolder);
        }

        const progressFolder = path.join(__dirname, '../../garant/public/images/buildings/'+obj.id+'/progress');
        if (!fs.existsSync(progressFolder)){
            fs.mkdirSync(progressFolder);
        }

        if (obj.tag === 'house') {
            if (!fs.existsSync(folder+ '/' + imagePath)) {
                saveImageToDisk('https://img.lunstatic.net/building-800x600/'+ obj.url, folder+ '/' + imagePath);
            }
        }

        if (obj.tag === 'plan') {
            if (obj.id === '61fd0937e6c0749df5f17afd') {
                console.log('https://img.lunstatic.net/layout-650x800/'+ obj.url);
            }
            if (!fs.existsSync(planFolder+ '/' + imagePath)) {
                saveImageToDisk('https://img.lunstatic.net/layout-650x800/'+ obj.url, planFolder+ '/' + imagePath);
            }
        }

        if (obj.tag === 'progress') {
            if (!fs.existsSync(progressFolder+ '/' + imagePath)) {
                console.log(imagePath);
                saveImageToDisk('https://img.lunstatic.net/construction-800x450/'+ obj.url, progressFolder+ '/' + imagePath);
            }
        }

    }
};


const q = tress((obj, callback) => {
    imagesParser(obj);
    callback();
}, 1); // 10 параллельных потоков

function init() {
    fetch('http://localhost:5000/api/getRecords')
        .then(res => res.json())
        .then((data) => {
            data.records.map((record) => {
                // console.log(record.title);
                record.houseImages.map((url) => {
                    q.push({url: url, id: record._id, tag: 'house'});
                });
                if (record.plans && record.plans.length) {
                    record.plans.map(plan => {
                        q.push({url: plan.url, id: record._id, tag: 'plan'});
                    });
                }
                if (record.progress) {
                    record.progress.map(item => {
                        if (item.image) {
                            q.push({url: item.image, id: record._id, tag: 'progress'});
                        }
                    });
                }
            });
        });
}

init();