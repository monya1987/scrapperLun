const parser = ($, url) => {
    const selector = '#products_content .catalog-item.dough5';
    let res = [];
    $(selector).map((index) => {
        const item = $(`${selector}:nth-child(${index + 1})`);
        const pizza = {};
        pizza.title = item.find('.catalog-name a').text();
        pizza.price = item.find('.bx_price.price span').text();
        pizza.ingredients = item.find('.catalog-item-text p').text();
        pizza.imageURL = url + item.find('.catalog-item-img img').data('realsrc');
        pizza.sizes = [];
        item.find('.catalog-line2 label').each(function () {
            pizza.sizes.push($(this).data('name').substring(0,2));
        });
        pizza.dough = [];
        item.find('.dough-selector label').each(function () {
            pizza.dough.push($(this).text());
        });
        res.push(pizza);
    });
    return res;
};
export default parser;