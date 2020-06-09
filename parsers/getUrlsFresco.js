const parser = ($, url) => {
    const selector = '#new-building-list article';
    let res = [];
    $(selector).map((index) => {
        const item = $(`${selector}:nth-child(${index + 1})`);
        const card = {};
        card.title = item.find('.entry-title a').text();
        card.title = card.title.replace('ЖК ', '');
        card.urlFresco = item.find('.realty-img').attr('href');
        if (card.title) {
            res.push(card);
        }
    });


    return res;
};
export default parser;