const fetch = require("node-fetch");
import config from './config.js';
import lunParser from './parsers/getRecords';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

let results = [];
const q = tress(function(record, done) {
        const url = encodeURI(config.url+'/ru'+record.urlLun);
        const options = {
            cookies : {
                "preferred_currency": "usd",
                "user_language": "ru",
                "ab_dimension_my_lun": "A_23"
            },
        };
        needle.get(url, options, (err, res) => {
            if (err) {
                done(err, 'some message');
            }
            const $ = cheerio.load(res.body.replace(/&nbsp;/g, " "), {
                normalizeWhitespace: true,
                xmlMode: true
            });
            const mainParser = lunParser($, record);
            const plansUrls = [];
            needle.get(encodeURI(config.url+'/ru'+record.urlLun+'/планировки'), options, (error, res) => {
                if (res && res.body) {
                    const $ = cheerio.load(res.body, {
                        normalizeWhitespace: true,
                        xmlMode: true
                    });

                    if ($('.PlansCard').length) {
                        $('.PlansCard').each(function () {
                            const plan = {
                                url: `https://lun.ua/api/layout-modal/${$(this).attr('data-plans-card')}`,
                            };
                            plansUrls.push(plan);
                        });
                    } else if($('.PlansCardTest').length) {
                        $('.PlansCardTest').each(function () {
                            const plan = {
                                url: `https://lun.ua/api/layout-modal/${$(this).attr('data-plans-card')}`,
                            };
                            plansUrls.push(plan);
                        });
                    }
                } else {
                    console.log('нет ответа', encodeURI(config.url+'/ru'+record.urlLun+'/планировки'));
                }
                mainParser.plans = plansUrls;
                results.push(mainParser);
                done();
            })
        });

}, 10); // 10 параллельных потоков

q.success = function(data) {
    // console.log('success');
}

q.error = function(err) {
    console.log('Job ' + this + ' failed with error ' + err);
};

q.drain = function(){
    console.log('q drain');
    if (results.length) {
        fs.writeFileSync(
            `../public/data/records.json`,
            JSON.stringify(results, null, 4), 'utf8'
        );
    }
};


function init(limit, name) {
    fetch('https://garant.od.ua/api/getParsedUrls')
        .then(res => res.json())
        .then((data) => {
            if (limit) {
                data.length = limit;
            }
            if (name) {
                const r = data.filter(item => item.title === name)
                r.map((record) => q.push(record));
            } else {
                data.map((record, index) => {
                    record.urlLun && q.push(record)
                });
            }
        });
}

init(0, '');

