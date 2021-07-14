import index from '../public/data/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
let results = [];


const qGetPlans = tress((obj, callback) => {
    if (typeof results[obj.record._id] === 'undefined') {
        results[obj.record._id] = [];
    }
    let planObj = {...obj.plan};
    needle.get(encodeURI(obj.plan.url), (err, res) => {
        if (err) throw err;
        const $ = cheerio.load(res.body.html.modal, {
            normalizeWhitespace: true,
            xmlMode: true
        });
        let imagePath = $('.PlanCanvas-content[data-canvas-for="developer"] img').attr('src');
        if (imagePath) {
            imagePath = imagePath.replace('https://img.lunstatic.net/layout-650x800/', '');
            planObj.url = imagePath;
            results[obj.record._id].push(planObj);
        }
        callback()
    });

}, 10);

qGetPlans.drain = () => {
    index.map((item) => {
        item.plans = results[item._id]
    });
    if (Object.keys(results).length) {
        console.log('Finished Get Plans & Recording to json');
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