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
    let res = cropSubStrings(text, ['от', 'грн', 'м²', '≈']);
    if (res.includes('тыс.')) {
        res = res.replace('тыс.', '000')
    }
    if (res.includes('млн')) {
        res = res.replace(' млн', '')
        if (Number.isInteger(Number(res))) {
            res = res+' 000 000'.replace('.',' ');
        } else {
            res = (Number(res).toFixed(3)+' 000').replace('.',' ')
        }
    }
    console.log(`getPriceInNumber ${res}`);
    return res;
};

const parser = ($, record) => {
    const card = {};
    card.id = record.id;
    card.title = record.title;
    card.slug = transliter.slugify(record.title);
    card.plans = [];

    // Selectors
    const fields = '.BuildingAttributes-items .BuildingAttributes-item';
    const address = '.BuildingLocation .UISubtitle-content';
    const rooms = '#prices div[data-table="0"] .BuildingPrices-table a';
    const cnt_aparts = '.BuildingAttributes-name:contains(Количество квартир)';
    const price = '.BuildingPrices-range';
    const priceChart = '#prices-chart .Arrows[data-currency="usd"] .BuildingChart-column';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const developer = '.BuildingContacts-developer-name span';
    const buildingLabel = '.BuildingGallery .label';
    const finalDate = '.BuildingPrices-date ~ .UIChips .UIChip';
    const updated = '.BuildingPrices .UISubtitle-content';
    const purchaseConditions = '#building-action .BuildingAction-item[style^="--color: 250,180,0"] .BuildingAction-description';
    const houseImagesSelector = '.BuildingGallery-slider img';
    const buildingDocs = '.BuildingDocuments .UICardLink';
    const buildingProgress = '.BuildingConstruction-item';
    const buildingActions = '#building-action .UICardLink-content';
    const description = $('.BuildingDescription-text');
    const location = $('script[type="application/ld+json"]').last().html();
    // const buildingVideo = '.BuildingGallery-preview'; 46.385094135978
    // const buildingVideoCopter = $('.BuildingExternal a[href^="https://www.youtube.com/"]').attr('href');


    card.developer = $(developer).text().trim();
    card.developerSlug = transliter.slugify(card.developer);
    card.purchaseConditions = $(purchaseConditions).text().trim();
    card.buildingLabel = $(buildingLabel).text().trim();
    card.area = cropSubStrings($(area).text(), ['р-н']);
    card.address = $(address).text().trim();
    card.price = cropSubStrings($(price).text().trim(), ['Цена:', 'грн/м²']).match(/\d\d \d\d\d/g);
    card.totalAparts = getFieldValue($(cnt_aparts));
    card.updated = $(updated).text().match(/\d{2}(\D)\d{2}\1\d{4}/g);
    card.description = $(description).html() && $(description).html().replace('\\', '/');
    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    card.rating = [getRandomArbitrary(3, 6), getRandomArbitrary(10, 233)];
    if (location) {
        const locationJSON = JSON.parse(location);
        if (locationJSON && locationJSON.location && locationJSON.location.geo) {
            card.location = [locationJSON.location.geo.latitude, locationJSON.location.geo.longitude]
        }
    }
    card.actions = [];
    card.paymentPlan = [];
    $(buildingActions).each(function () {
        const action = {};
        action.label = $(this).find('.UICardLink-title').text().trim();
        action.value = $(this).find('.UICardLink-description').text().trim();
        if (action.label.includes('Акция')) {
            card.actions.push(action);
        } else {
            card.paymentPlan.push(action);
        }

    });

    card.finalDate = [];
    $(finalDate).each(function () {
        card.finalDate.push($(this).find('.UIChip-content').text().trim());
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
    card.fields = [];
    $(fields).each(function () {
        const field = {};
        field.label = $(this).find('.BuildingAttributes-name').text().trim();
        field.value = $(this).find('.BuildingAttributes-value').text();
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
        const priceSelector = $(this).find('.BuildingPrices-subrow .BuildingPrices-cell [data-currency="uah"]').first().text().trim();
        room.title = $(this).find('.BuildingPrices-subrow .BuildingPrices-cell').first().text().trim();
        room.price = priceSelector;
        room.priceNum = getPriceInNumber(priceSelector);
        room.meter = $(this).find('.BuildingPrices-subrow:nth-child(3) .BuildingPrices-cell').first().text().trim();
        card.rooms.push(room);
    });




    // const getPrice = () => {
    //     const months = {0: 'января', 1: 'февраля', 2: 'марта', 3: 'апреля', 4: 'мая', 5: 'июня', 6: 'июля', 7: 'августа', 8: 'сентября', 9: 'октября', 10: 'ноября', 11: 'декабря',};
    //     const today = new Date();
    //     const nowYear = today.getFullYear(); // 2020
    //     const nowMonth = today.getMonth(); // 2
    //     let res = {};
    //     const text = $(purchaseConditions).text().replace(/&nbsp;/g, ' ');
    //     if (text) {
    //         let toMonth = 0;
    //         Object.keys(months).map(month => {
    //             if (text.includes(months[month])) {
    //                 toMonth = Number(month);
    //             }
    //         });
    //         let getPercent = text.match(/\d\d%/g);
    //         if (getPercent) {getPercent = getPercent[0]}
    //         let year = text.match(/20\d\d/g);
    //         if (year) {year = year[0]}
    //         const monthsInYears = (year - nowYear) * 12;
    //         console.log('Рассрочка - ', text, text.match(/\d\d месяцев/g));
    //         res.totalMonths = monthsInYears + toMonth - nowMonth;
    //         if (text.match(/\d\d месяцев/g)) {
    //             const aaa = text.match(/\d\d месяцев/g)[0].replace(' месяцев', '')
    //             if (aaa) {
    //                 res.totalMonths = Number(aaa);
    //             }
    //         }
    //         if (getPercent) {
    //             res.percent = Number(getPercent.substring(0, getPercent.length - 1));
    //         }
    //     }
    //     return res;
    // };
    //
    // card.billCalc = getPrice();
    // card.priceStat = priceStat;
    // card.houseImages = houseImages;
    // card.progres = progress;
    // card.documents = documents;
    // card.location = location && location.match(/\d\d.\d*/g);
    // card.post_content = $(description).html() && $(description).html().replace('\\', '/');
    // card.video = $(buildingVideo).attr('data-video');
    // card.videoCopter = buildingVideoCopter && buildingVideoCopter.replace('https://www.youtube.com/watch?v=', '');




    // card.fields.houseClass = getFieldValue($(houseClass));
    // card.fields.cnt_houses = getFieldValue($(cnt_houses));
    // card.fields.floors = getFieldValue($(floors));
    // card.fields.technologies = getFieldValue($(technologies));
    // card.fields.walls = getFieldValue($(walls));
    // card.fields.warming = getFieldValue($(warming));
    // card.fields.heating = getFieldValue($(heating));
    // card.fields.ceiling = getFieldValue($(ceiling));
    // card.fields.cnt_aparts = getFieldValue($(cnt_aparts));
    // card.fields.condition = getFieldValue($(condition));
    // card.fields.closed_territory = getFieldValue($(closed_territory));
    // card.fields.parking = getFieldValue($(parking));
    // card.rooms.room1 = $(room1).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    // card.rooms.room2 = $(room2).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    // card.rooms.room3 = $(room3).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    // card.rooms.room4 = $(room4).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    // card.rooms.room2flors = $(room2flors).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    // card.rooms.room1Price = getRoomsValue(room1, 2);
    // card.rooms.room2Price = getRoomsValue(room2, 2);
    // card.rooms.room3Price = getRoomsValue(room3, 2);
    // card.rooms.room4Price = getRoomsValue(room4, 2);
    // card.rooms.room2florsPrice = getRoomsValue(room2flors, 2);
    return card;
};
export default parser;