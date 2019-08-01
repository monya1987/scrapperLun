import config from './config.js'
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');


let sitesResults = [];
config.map((item) => {

    // build sites.json
    const {parser, ...itemFields} = item;
    const sitesResult = itemFields;
    sitesResults.push(sitesResult);

    // build results .json
    let results = [];
    const q = tress((url, callback) => {
        needle.get(url, (err, res) => {
            if (err) throw err;
            const $ = cheerio.load(res.body);
            results = item.parser($, item.url);
            callback();
        });
    }, 10); // 10 параллельных потоков

    q.drain = () => {
        fs.writeFileSync(
            `./results/${item.name}.json`,
            JSON.stringify(results, null, 4), 'utf8'
        );
    };
    q.push(item.url);
});

fs.writeFileSync(
    `./results/sites.json`,
    JSON.stringify(sitesResults, null, 4), 'utf8'
);














//
//
// const q = tress(function(url, callback){
//     needle.get(url, function(err, res){
//         if (err) throw err;
//
//         // парсим DOM
//         const $ = cheerio.load(res.body);
//
//         // console.log($('#js-products-container .item:nth-child(2)'));
//         // $('#js-products-container .item').map((index) => {
//         //     results.push({
//         //         title: $(`#js-products-container .item:nth-child(${index + 1})`).find('.title').text(),
//         //         date: '22',
//         //         href: 'url',
//         //         size: '22222'
//         //     });
//         // });
//         //информация о новости
//         // if($('.newsdateline a').first().text() === '1 августа'){
//         //     results.push({
//         //         title: $('#newstr5 td:nth-child(2)').text(),
//         //         date: '22',
//         //         href: 'url',
//         //         size: '22222'
//         //     });
//         // }
//
//         // //список новостей
//         // $('.b_rewiev p>a').each(function() {
//         //     q.push($(this).attr('href'));
//         // });
//         //
//         // //паджинатор
//         // $('.bpr_next>a').each(function() {
//         //     // не забываем привести относительный адрес ссылки к абсолютному
//         //     q.push(resolve(URL, $(this).attr('href')));
//         // });
//
//         callback();
//     });
// }, 10); // запускаем 10 параллельных потоков
//
// q.drain = function(){
//     fs.writeFileSync('./data.json', JSON.stringify(results, null, 4), 'utf8');
// }
//
// q.push(URL);