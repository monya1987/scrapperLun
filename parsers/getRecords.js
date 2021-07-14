const transliter = require('transliter');

const cropSubStrings = (str, arr) => {
    let res = str.trim();
    arr.map((arrStr) => {
        res = res.replace(arrStr, '').trim();
    });
    return res;
};
const getFieldValue = (node) => {
    return node.parent().find('.BuildingAttributes-value').text().trim();
};

const getPriceInNumber = (text) => {
    let res = cropSubStrings(text, ['от', 'грн', 'м²', '≈', '$', ' ']);
    if (res.includes('тыс.')) {
        res = res.replace('тыс.', '000')
    }
    if (res.includes('млн')) {
        res = res.replace(' млн', '');
        if (Number.isInteger(Number(res))) {
            res = res+' 000 000'.replace('.',' ');
        } else {
            res = (Number(res).toFixed(3)+' 000').replace('.',' ')
        }
    }
    return res;
};

const parser = ($, record) => {
    const card = {};
    card._id = record._id;
    card.title = record.title;
    card.slug = transliter.slugify(record.title);
    card.plans = [];
    console.log(record.title);
    // Selectors
    const fields = '.BuildingAttributes-items .BuildingAttributes-item';
    const address = '.BuildingLocation .UISubtitle-content';
    const rooms = 'div[data-table="0"] .BuildingPrices-table a';
    const cnt_aparts = '.BuildingAttributes-name:contains(Количество квартир)';
    const price = '.BuildingPrices-price[data-currency="usd"]';
    const priceChart = '.Arrows[data-currency="usd"] .BuildingChart-column';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const developer = '.BuildingContacts-developer-name span';
    const buildingLabel = '.BuildingGallery .UILabel';
    const finalDate = '.BuildingPrices-date ~ .UIChips .UIChip';
    const updated = '.BuildingPrices .UISubtitle-content';
    const purchaseConditions = '#building-action .BuildingAction-item[style^="--color: 250,180,0"] .BuildingAction-description';
    const houseImagesSelector = '.BuildingGallery-slider img';
    const buildingDocs = '.BuildingDocuments .UICardLink';
    const buildingProgress = '.BuildingConstruction-item';
    const buildingActions = '#building-action';
    const location = $('script').filter(function() {
        return ($(this).html().indexOf('window.params =') > -1);
    });
    const phone = 'a[data-testid="contacts-phone"]';
    const video = '.BuildingGallery-preview';
    card.phone = $(phone).attr("href") ? $(phone).attr("href").replace('tel:', '') : null;
    card.developer = $(developer).text().trim();
    card.developerSlug = transliter.slugify(card.developer);
    card.purchaseConditions = $(purchaseConditions).text().trim();
    card.buildingLabel = $(buildingLabel).text().trim();
    card.area = cropSubStrings($(area).text(), ['р-н']);
    card.address = $(address).text().trim();
    card.price = $(price).first().text().replace(/ /g, '').match(/\d\d\d+/g);
    card.totalAparts = getFieldValue($(cnt_aparts));
    card.updated = $(updated).text().match(/\d{2}(\D)\d{2}\1\d{4}/g);
    card.video = $(video) ? $(video).attr('data-video') : false;
    // card.copterPhoto = $('.UITabs-tab[data-tab="panorama"]');
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    card.rating = [getRandomArbitrary(3, 6), getRandomArbitrary(10, 233)];
    if (location && location.html()) {
        const res = location.html().match(/center:(.*)], bounds:/g);
        const locationJSON = JSON.parse(res[0].replace('center: ', '').replace(', bounds:', ''));
        if (locationJSON) {
            card.location = [locationJSON[1], locationJSON[0]]
        }
    }
    card.actions = [];
    card.paymentPlan = [];

    $(buildingActions).not('.hidden').find('script').each(function () {
        const data = JSON.parse($(this).html());
        if (data) {
            const {name, startDate, endDate, description} = data;
            if (!name.match(/(Первый взнос от \d+)/g)) {
                if (!name.match(/(Кредит под \d+)/g)) {
                    const event = {name, startDate, endDate, description};
                    card.actions.push(event);
                }
            }
        }

    });

    $(buildingActions).first().find('.UICardLink-content').each(function () {
        const action = {};
        action.label = $(this).find('.UICardLink-title').text().trim();
        action.value = $(this).find('.UICardLink-description').text().trim();
        if (action.label.includes('Рассрочка')) {
            card.paymentPlan.push(action);
        }
    });

    card.finalDate = [];
    $(finalDate).each(function () {
        card.finalDate.push($(this).text().trim());
    });

    card.documents = [];
    $(buildingDocs).each(function () {
        const document = {};
        document.label = $(this).find('.UICardLink-title').text().trim();
        document.value = $(this).find('.UICardLink-description').text().trim();
        card.documents.push(document);
    });
    card.progress = [];
    $(buildingProgress).each(function () {
        const item = {};
        let imagePath = $(this).find('.BuildingConstruction-image:last-child img').attr('data-src');
        item.title = $(this).find('.BuildingConstruction-name').text().trim();
        item.description = $(this).find('.BuildingConstruction-info .placeholder').first().text().trim();
        item.date = $(this).find('.BuildingConstruction-state').text();
        if (imagePath && imagePath.indexOf('https://img.lunstatic.net/construction-800x450/') !== -1) {
            imagePath = imagePath.replace('https://img.lunstatic.net/construction-800x450/', '');
            item.image = imagePath;
        }
        card.progress.push(item);
    });
    card.priceStat = [];
    $(priceChart).each(function () {
        const res = {};
        res.price = $(this).find('.BuildingChart-bar').attr('data-price');
        res.month = $(this).find('.BuildingChart-scale').text();
        card.priceStat.push(res);
    });
    card.withFinishing = false;
    card.fields = [];
    $(fields).each(function () {
        const field = {};
        field.label = $(this).find('.BuildingAttributes-name').text().trim();
        field.value = $(this).find('.BuildingAttributes-value').text();
        if (field.value === 'с ремонтом') {
            card.withFinishing = true;
        }
        card.fields.push(field);
    });
    card.houseImages = [];
    $(houseImagesSelector).each(function () {
        let imagePath = $(this).attr('src');
        if (imagePath && imagePath.indexOf('https://img.lunstatic.net/building-800x600/') !== -1) {
            imagePath = imagePath.replace('https://img.lunstatic.net/building-800x600/', '');
            card.houseImages.push(imagePath);
        }
    });
    card.rooms = [];
    $(rooms).each(function () {
        const room = {};
        const priceSelector = $(this).find('.BuildingPrices-subrow .BuildingPrices-main [data-currency="usd"]').text().trim();
        const priceRange = $(this).find('.BuildingPrices-subrow .BuildingPrices-additional [data-currency="usd"]').text().trim().replace(/ /g, '').match(/\d\d\d+/g);
        room.title = $(this).find('.BuildingPrices-subrow .BuildingPrices-main').first().text().trim();
        room.price = priceSelector;
        room.priceRange = priceRange;
        room.priceNum = getPriceInNumber(priceSelector);
        room.meter = $(this).find('.BuildingPrices-subrow .BuildingPrices-additional').first().text().trim();
        card.rooms.push(room);
    });

    return card;
};
export default parser;