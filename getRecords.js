import data from './results/urls';
import config from './config.js';
import lunParser from './parsers/getRecords';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');


let results = [];
const q = tress((url, callback) => {
    needle.get(url, (err, res) => {
        if (err) throw err;
        const $ = cheerio.load(res.body);
        results.push(lunParser($, url));
        callback();
    });

}, 10); // 10 параллельных потоков

q.drain = () => {
    if (results.length) {
        fs.writeFileSync(
            `./results/records.json`,
            JSON.stringify(results, null, 4), 'utf8'
        );
    }
};

Object.keys(data).map((i) => {
    Object.keys(data[i]).map((item) => {
        q.push(config.url+encodeURI(data[i][item].link));
    });
});