const parser = ($, url) => {
    const card = {};
    const name = '.BuildingContacts-title h1';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const street = '.BuildingLocation-address';

    card.title = $(name).text();
    return card;
};
export default parser;