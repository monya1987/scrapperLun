import config from './config.js';
import getUrlsParser from './parsers/getUrlsFresco';
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
    console.log(results);

    if (results.length) {

        const data = JSON.parse(fs.readFileSync('./results/urlsNew.json', 'utf-8'));
        data.map((item) => {
            results.map(result => {
                console.log(item.title, result.title);
                console.log(item.title.includes(result.title), result.title.includes(item.title));
                if (item.title.includes(result.title) || result.title.includes(item.title)) {
                    data.urlFresco = result.urlFresco;
                }
            });
        });

        // console.log(data);
        // data.map((item) => {
        //     //if (!item.urlFresco) {
        //         item.urlFresco = '';
        //     //}
        //     // if(item.title) {
        //     //     item.title.replace('ЖК ', '');
        //     // }
        //     console.log(item);
        // });

        fs.writeFileSync(
            `./results/urlsNew.json`,
            JSON.stringify(data, null, 4), 'utf8'
        );
    }
};


q.push(`https://fresco.od.ua/novostroyki-odessa.html`);
