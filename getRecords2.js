import index from '../public/data/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
let results = [];

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

const getDescr = (text) => {
    let res = 0;
    if (text.includes('1-комнатная')) {
        res = 1;
    }
    return res;
};


const qGetPlans = tress((obj, callback) => {
    if (typeof results[obj.record._id] === 'undefined') {
        results[obj.record._id] = [];
    }
    let planObj = {...obj.plan};
    const options = {
        follow_max: 5,
        cookies : {
            "preferred_currency": "usd",
            "user_language": "ru",
            "ab_dimension_my_lun": "A_23"
        },
    };
    needle.get(encodeURI(obj.plan.url), options, (err, res) => {
        if (err) throw err;
        if (res.body.html && res.body.html.modal) {
            const $ = cheerio.load(res.body.html.modal, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            let imagePath = $('.PlanCanvas-content[data-canvas-for="developer"] img').attr('src');
            if (imagePath) {
                imagePath = imagePath.replace('https://img.lunstatic.net/layout-650x800/', '');
                planObj.url = imagePath;
                planObj.priceRange = [];
                const priceAndMetersSelector = '.PlanInfo-title'; //44.9 м²$nbsp;•$nbsp;1$nbsp;750 — 2$nbsp;400 $/м²
                const labelsSelector = '.PlanInfo-labels';
                console.log($(priceAndMetersSelector).text());
                if ($(priceAndMetersSelector).text()) {
                    const res = $(priceAndMetersSelector).text().replace(/\s/g, '').replace(/&nbsp;/g, "").split('&bull;');
                    if (res.length === 2) {
                        planObj.price = res[1].match(/\d+/)[0];
                        planObj.meters = res[0].match(/\d+/)[0];
                        const tmp = res[1].match(/\d+/g);
                        if (tmp.length) {
                            planObj.priceRange = tmp;
                        }
                    } else {
                        console.log(res);
                    }
                    planObj.description = '';
                    planObj.rooms = getRooms($(labelsSelector).text());
                    $(labelsSelector).find('.UILabel').each(function () {
                        if ($(this).text().includes('Секция')) {
                            planObj.description += $(this).text();
                        }
                        if ($(this).text().includes('Запланировано')) {
                            planObj.description += ' | ' + $(this).text();
                        }
                    });

                }
                results[obj.record._id].push(planObj);
            }
            callback()
        }
    });

}, 4);

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