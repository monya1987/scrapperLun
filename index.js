import config from './config.js'
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

config.map((item) => {
    // build links .json
    let results = [];
    const q = tress((url, callback) => {
        needle.get(url, (err, res) => {
            if (err) throw err;
            const $ = cheerio.load(res.body);
            results.push(item.parser($, url));
            callback();
        });

    }, 1); // 10 параллельных потоков

    q.drain = () => {
        if (results.length) {
            fs.writeFileSync(
                `./results/links.json`,
                JSON.stringify(results, null, 4), 'utf8'
            );
        }
    };

    const limitPage = 2; // $(`.FunnelBottom-count b`); / 24
    for (let i = 1; i <= limitPage; i++) {
        if (i === 1) {
            q.push(`${item.url}`);
        } else {
            q.push(`${item.url}?page=${i}`);
        }
    }
});














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