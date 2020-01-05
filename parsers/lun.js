const parser = ($) => {
    const selector = '.card-grid-cell';
    let res = [];
    $(selector).map((index) => {
        const item = $(`${selector}:nth-child(${index + 1})`);
        const card = {};
        card.id = index + 1;
        card.title = item.find('.card-title').text();
        card.link = item.find('.card-media').attr('href');
        res.push(card);
    });
    return res;
};
export default parser;