const parser = ($, url) => {
    const selector = '#js-products-container .item';
    let res = [];
    $(selector).map((index) => {
        const item = $(`${selector}:nth-child(${index + 1})`);
        const pizza = {};
        pizza.title = item.find('.title').text();
        pizza.price = item.find('.price span').text();
        pizza.ingredients = item.find('.description').text();
        pizza.imageURL = url + item.find('.item-img img').attr('src');
        pizza.sizes = [30];
        pizza.dough = [];
        res.push(pizza);
    });
    return res;
};
export default parser;