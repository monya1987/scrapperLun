import index from '../public/data/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
let results = [];

const cropSubStrings = (str, arr) => {
    let res = str.trim();
    arr.map((arrStr) => {
        res = res.replace(arrStr, '').trim();
    });
    return res;
};
const getPriceInNumber = (text) => {
    let res = cropSubStrings(text, ['от', 'грн', 'м²', '≈']);
    console.log(res);
    if (res.includes('тыс.')) {
        res = res.replace('тыс.', '000')
    }
    if (res.includes('млн')) {
        res = res.replace(' млн', '')
        if (Number.isInteger(Number(res))) {
            res = res+' 000 000'.replace('.',' ');
        } else {
            res = (Number(res).toFixed(3)+' 000').replace('.',' ')
        }
    }
    console.log(`getPriceInNumber ${res}`);
    return res;
};

const getRooms = (text) => {
    let res = 0;
    if (text.includes('Однокомнатная')) {
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

const qGetPlans = tress((obj, callback) => {
    if (typeof results[obj.record._id] === 'undefined') {
        results[obj.record._id] = [];
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
            imagePath = imagePath.replace('https://img.lunstatic.net/layout-650x800/', '');
            let planTitle = $('.UIMainTitle.-with-subtitle').find('.h2').text();
            let planDescription = $('.PlanHeader .UISubtitle-content').text();
            let planPrice = $('.PlanInfo .PlanInfo-price').text();
            planPrice = planPrice.trim().replace(/&nbsp;/g, "");
            planTitle = planTitle.replace('Еще планировки', '').trim();
            planObj.imagePath = imagePath;
            planObj.title = planTitle.replace(/&nbsp;/g, '');
            planObj.description = planDescription.replace(/(.*?): /g, '');
            planObj.meters = null;
            if (planTitle && planTitle.match(/\d+/)) {
                planObj.meters = Number(planTitle.match(/\d\d+/)[0]);
            }
            planObj.rooms = getRooms(planTitle);
            planObj.price = planPrice;
            planObj.priceNum = null;
            if (planPrice && planPrice.match(/\d+/)) {
                planObj.priceNum = Number(planPrice.replace(' ', '').match(/\d+/)[0]);
            }
            if (planPrice !== 'Продано') {
                results[obj.record._id].push(planObj);
            }
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