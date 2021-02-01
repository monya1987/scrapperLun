// import data from '../public/data/ulrs';
const fetch = require("node-fetch");
import config from './config.js';
import lunParser from './parsers/getRecords';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');


let results = [];
const q = tress((record, callback) => {
    const url = encodeURI(config.url+'/ru'+record.urlLun);
    needle.get(url, (err, res) => {
        if (err) throw err;
        const $ = cheerio.load(res.body.replace(/&nbsp;/g, " "), {
            normalizeWhitespace: true,
            xmlMode: true
        });
        const mainParser = lunParser($, record);
        const plansUrls = [];
        needle.get(encodeURI(config.url+'/ru'+record.urlLun+'/планировки'), (err, res) => {
            const $ = cheerio.load(res.body, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            $('.PlansCard').each(function () {
                let urlPlan = $(this).attr('href');
                plansUrls.push(urlPlan);
            });
            mainParser.plans = plansUrls;
            results.push(mainParser);
            callback();
        })
    });

}, 10); // 10 параллельных потоков

q.drain = () => {
    if (results.length) {
        fs.writeFileSync(
            `../public/data/records.json`,
            JSON.stringify(results, null, 4), 'utf8'
        );
    }
};


function init() {
    fetch('https://garant.od.ua/api/getParsedUrls')
        .then(res => res.json())
        .then((data) => {
            // Limit records for testing
            // const testData = [];
            // for (let i = 0; i < 3; i++) {
            //     testData.push(data[i])
            // }
            // testData.map((record) => q.push(record));
            data.map((record) => q.push(record));


        });
}

init();


// data.map((record) => {
//     q.push(record);
// });

