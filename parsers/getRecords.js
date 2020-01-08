const card = {
    ID: 1,
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
    const start_date = '';
    const price = '.BuildingPrices-range';
    const room1 = '.BuildingPrices-cell:contains(1-комнатные)';
    const room2 = '.BuildingPrices-cell:contains(2-комнатные)';
    const room3 = '.BuildingPrices-cell:contains(3-комнатные)';
    const room4 = '.BuildingPrices-cell:contains(4-комнатные)';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const developer = '.BuildingContacts-developer-name span';
    const street = '';
    card.ID = 1;
    card.guid = 1;
    card.post_title = $(title).text();
    card.post_name = encodeURI($(title).text());
    card.post_content = $(description).innerHTML;
    card.fields.address = $(address).text();
    card.fields.houseClass = $(houseClass).parent().find('.BuildingAttributes-value').text();
    card.fields.cnt_houses = $(street).text();
    card.fields.floors = $(street).text();
    card.fields.technologies = $(street).text();
    card.fields.walls = $(street).text();
    card.fields.warming = $(street).text();
    card.fields.heating = $(street).text();
    card.fields.ceiling = $(street).text();
    card.fields.cnt_aparts = $(street).text();
    card.fields.condition = $(street).text();
    card.fields.closed_territory = $(street).text();
    card.fields.parking = $(street).text();
    card.fields.start_date = $(street).text();
    card.fields.price = $(street).text();
    card.fields.studios = $(street).text();
    card.fields['1room'] = $(room1).parent().find('.BuildingPrices-cell').text();
    card.fields['2room'] = $(street).text();
    card.fields['3room'] = $(street).text();
    card.fields.area = $(street).text();
    card.fields.developer = $(street).text();
    return card;
};
export default parser;