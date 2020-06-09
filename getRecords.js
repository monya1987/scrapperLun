import data from './results/urls';
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
        const $ = cheerio.load(res.body, {
            normalizeWhitespace: true,
            xmlMode: true
        });
        const mainParser = lunParser($, record);
        needle.get(encodeURI(config.url+'/ru'+record.urlLun+'/планировки'), (err, res) => {
            if (err) throw err;
            const $ = cheerio.load(res.body, {
                normalizeWhitespace: true,
                xmlMode: true
            });

            const plansImages = [];
            $('.PlansCard').each(function () {
                const plan = {};
                let imagePath = $(this).find('img').attr('data-src');
                if (imagePath) {
                    const toCrop = plan.title = $(this).find('.PlansCard-content p span').text();
                    plan.title = $(this).find('.PlansCard-area').text();
                    plan.imagePath = imagePath;
                    plan.imageAlt = $(this).find('img').attr('alt');
                    plan.rooms = $(this).find('.PlansCard-area .placeholder').text();
                    if (plan.rooms.match('-комнатная')) {
                        plan.rooms = plan.rooms.slice(0, 1)
                    }
                    plansImages.push(plan);
                }
            });

            mainParser.plansImages = plansImages;
            results.push(mainParser);
            callback();
        });

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


data.map((record) => {
    q.push(record);
});

