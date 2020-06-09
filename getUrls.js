import config from './config.js';
import getUrlsParser from './parsers/getUrls';
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
        const parserRes = getUrlsParser($, url);
        parserRes.map(item => {results.push(item);});
        callback();
    });

}, 1); // 1 параллельных потоков

q.drain = () => {
    if (results.length) {

        const data = JSON.parse(fs.readFileSync('./results/urls.json', 'utf-8'));
        data.map((item, index) => {
            item.id = index;
        });

        fs.writeFileSync(
            `./results/urlsNew.json`,
            JSON.stringify(data, null, 4), 'utf8'
        );
    }
};

const limitPage = 9; // $(`.FunnelBottom-count b`); / 24
for (let i = 1; i <= limitPage; i++) {
    if (i === 1) {
        q.push(`${config.url}${config.urlPageList}`);
    } else {
        q.push(`${config.url}${config.urlPageList}?page=${i}`);
    }
}