const parser = ($, url) => {
    const selector = '.card-grid-cell';
    let res = [];
    const a = url.indexOf('page=');
    let page = 1;
    if (a !== -1) {
        page = url.substring(a+5, url.length);
    }
    $(selector).map((index) => {
        const item = $(`${selector}:nth-child(${index + 1})`);
        const card = {};
        card.id = page;
        card.title = item.find('.card-title').text();
        card.link = item.find('.card-media').attr('href');
        res.push(card);
    });


    return res;
};
export default parser;