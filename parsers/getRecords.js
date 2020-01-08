const card = {
    post_author: 1,
    post_date: '2019-12-27 16:46:07',
    post_date_gmt: '2019-12-27 16:46:07',
    post_modified: '2019-12-27 16:46:07',
    post_modified_gmt: '2019-12-27 16:46:07',
    comment_status: 'closed',
    comment_count: 0,
    post_parent: 0,
    menu_order: 0,
    post_type: "post",
    post_status: "publish",
    ping_status: "open",
    fields: {}
};

const parser = ($, url) => {
    const title = '.BuildingContacts-title h1';
    const description = '.BuildingDescription-text';
    const address = '.BuildingLocation-address';
    const houseClass = '.BuildingAttributes-name:contains(Класс)';
    const cnt_houses = '.BuildingAttributes-name:contains(Домов)';
    const floors = '.BuildingAttributes-name:contains(Этажность)';
    const technologies = '.BuildingAttributes-name:contains(Технология строительства)';
    const walls = '.BuildingAttributes-name:contains(Стены)';
    const warming = '.BuildingAttributes-name:contains(Утепление)';
    const heating = '.BuildingAttributes-name:contains(Отопление)';
    const ceiling = '.BuildingAttributes-name:contains(Высота потолков)';
    const cnt_aparts = '.BuildingAttributes-name:contains(Количество квартир)';
    const condition = '.BuildingAttributes-name:contains(Состояние квартиры)';
    const closed_territory = '.BuildingAttributes-name:contains(Закрытая территория)';
    const parking = '.BuildingAttributes-name:contains(Паркинг)';
    const price = '.BuildingPrices-range';
    const room1 = '.BuildingPrices-cell:contains(1-комнатные)';
    const room2 = '.BuildingPrices-cell:contains(2-комнатные)';
    const room3 = '.BuildingPrices-cell:contains(3-комнатные)';
    const room4 = '.BuildingPrices-cell:contains(4-комнатные)';
    const room2flors = '.BuildingPrices-cell:contains(Двухуровневые)';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const developer = '.BuildingContacts-developer-name span';

    card.post_title = $(title).text();
    card.post_name = encodeURI($(title).text());
    card.post_content = $(description).html();
    card.fields.address = $(address).text();
    card.fields.houseClass = $(houseClass).parent().find('.BuildingAttributes-value').text();
    card.fields.cnt_houses = $(cnt_houses).text();
    card.fields.floors = $(floors).text();
    card.fields.technologies = $(technologies).text();
    card.fields.walls = $(walls).text();
    card.fields.warming = $(warming).text();
    card.fields.heating = $(heating).text();
    card.fields.ceiling = $(ceiling).text();
    card.fields.cnt_aparts = $(cnt_aparts).text();
    card.fields.condition = $(condition).text();
    card.fields.closed_territory = $(closed_territory).text();
    card.fields.parking = $(parking).text();
    card.fields.price = $(price).text().replace(/\s/g, '');
    card.fields.room1 = $(room1).parent().parent().find('.BuildingPrices-cell').eq(3).text().replace(/\s/g, '');
    card.fields.room2 = $(room2).parent().parent().find('.BuildingPrices-cell').eq(3).text().replace(/\s/g, '');
    card.fields.room3 = $(room3).parent().parent().find('.BuildingPrices-cell').eq(3).text().replace(/\s/g, '');
    card.fields.room4 = $(room4).parent().parent().find('.BuildingPrices-cell').eq(3).text().replace(/\s/g, '');
    card.fields.room2flors = $(room2flors).parent().parent().find('.BuildingPrices-cell').eq(3).text().replace(/\s/g, '');
    card.fields.area = $(area).text();
    card.fields.developer = $(developer).text();
    return card;
};
export default parser;