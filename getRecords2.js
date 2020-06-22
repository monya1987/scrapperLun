import index from '../public/data/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
let results = [];

const qGetPlans = tress((obj, callback) => {
    if (typeof results[obj.record.id] === 'undefined') {
        results[obj.record.id] = [];
    }
    let planObj = {};
    needle.get(encodeURI(config.url+obj.plan), (err, res) => {
        if (err) throw err;
        const $ = cheerio.load(res.body, {
            normalizeWhitespace: true,
            xmlMode: true
        });
        let imagePath = $('[data-canvas-for="developer"]').find('img').attr('src');
        if (imagePath) {
            imagePath = imagePath.replace('//img.lunstatic.net/layout-650x800/', '');
            let planTitle = $('.PlanView-title').find('.h1').text();
            planTitle = planTitle.replace('Еще планировки', '');
            planObj.imagePath = imagePath;
            planObj.title = planTitle;
            planObj.imageAlt = '';
            planObj.rooms = '';
            results[obj.record.id].push(planObj);
        }
        callback()
    });

}, 10);

qGetPlans.drain = () => {
    index.map((item) => {
        item.plans = results[item.id]
    });
    console.log('Finished Get Plans & Recording to json');
    if (results.length) {
        fs.writeFileSync(
            `../public/data/records.json`,
            JSON.stringify(index, null, 4), 'utf8'
        );
    }
};

// INIT
index.map( record => {
    record.plans.map(plan => qGetPlans.push({record, plan}));
});