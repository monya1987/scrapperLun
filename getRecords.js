// import data from '../public/data/ulrs';
const fetch = require("node-fetch");
import config from './config.js';
import lunParser from './parsers/getRecords';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

const getRooms = (text) => {
    let res = 0;
    if (text.includes('1-комнатная')) {
        res = 1;
    }
    if (text.includes('2-комнатная')) {
        res = 2;
    }
    if (text.includes('3-комнатная')) {
        res = 3;
    }
    if (text.includes('4-комнатная')) {
        res = 4;
    }
    return res;
};


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
        const options = {
            cookies : {"preferred_currency": "usd"},
        };
        needle.get(encodeURI(config.url+'/ru'+record.urlLun+'/планировки'), options, (err, res) => {
            const $ = cheerio.load(res.body, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            $('.PlansCard').each(function () {
                const plan = {
                    url: config.url+'/ru'+record.urlLun+'/планировки/'+$(this).attr('data-plans-card'),
                    price: $(this).find('.PlansCard-price').text(),
                    priceRange: [],
                    meters: $(this).find('.PlansCard-area b').text(),
                    rooms: getRooms($(this).find('.PlansCard-area span.placeholder').text()),
                    description: $(this).find('div.placeholder').text(),
                };
                if (plan.meters) {plan.meters = Number(plan.meters.match(/\d+/)[0])}
                if (plan.price) {plan.price = Number(plan.price.replace(/\s/g, '').replace(/&nbsp;/g, "").match(/\d+/)[0])}
                if ($(this).find('.PlansCard-price').text()) {
                    const tmp = $(this).find('.PlansCard-price').text().replace(/\s/g, '').replace(/&nbsp;/g, "").match(/\d+/g);
                    if (tmp.length) {
                        plan.priceRange = [Number(tmp[0])];
                        if (tmp.length > 1) {plan.priceRange.push(Number(tmp[1]))}
                    }
                }
                plansUrls.push(plan);
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


function init(limit) {
    fetch('https://garant.od.ua/api/getParsedUrls')
        .then(res => res.json())
        .then((data) => {
            if (limit) {
                data.length = 5;
            }
            data.map((record) => q.push(record));
        });
}

init();

