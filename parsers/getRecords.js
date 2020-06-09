const parser = ($, record) => {
    const card = {fields: {}, rooms: {}};

    // Selectors
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
    const priceChart = '#prices-chart .BuildingChart-columns[data-chart="usd"] .BuildingChart-column';
    const room1 = '.BuildingPrices-cell:contains(1-комнатные)';
    const room2 = '.BuildingPrices-cell:contains(2-комнатные)';
    const room3 = '.BuildingPrices-cell:contains(3-комнатные)';
    const room4 = '.BuildingPrices-cell:contains(4-комнатные)';
    const room2flors = '.BuildingPrices-cell:contains(Двухуровневые)';
    const area = '.BuildingContacts-breadcrumbs a:last-child';
    const developer = '.BuildingContacts-developer-name span';
    const buildingLabel = '.BuildingGallery .label';
    const finalDate = '.BuildingPrices-chips :last-child';
    const updated = '.Building-subtitle';
    const purchaseConditions = '#building-action .BuildingAction-item[style^="--color: 250,180,0"] .BuildingAction-description';
    const houseImagesSelector = '.BuildingGallery-slider img';
    const buildingDocs = '.BuildingDocuments-items a';
    const buildingProgress = '.BuildingConstruction-item';
    const buildingVideo = '.BuildingGallery-preview';
    const buildingAction = '#building-action .BuildingAction-item[style^="--color: 0,190,113"] .BuildingAction-description';
    const location = $('.BuildingLocation-route').attr('href');
    const buildingVideoCopter = $('.BuildingExternal a[href^="https://www.youtube.com/"]').attr('href');

    const cropSubStrings = (str, arr) => {
        let res = str.trim();
        arr.map((arrStr) => {
            res = res.replace(arrStr, '').trim();
        });
        return res;
    };

    const getPrice = () => {
        const months = {0: 'января', 1: 'февраля', 2: 'марта', 3: 'апреля', 4: 'мая', 5: 'июня', 6: 'июля', 7: 'августа', 8: 'сентября', 9: 'октября', 10: 'ноября', 11: 'декабря',};
        const today = new Date();
        const nowYear = today.getFullYear(); // 2020
        const nowMonth = today.getMonth(); // 2
        let res = {};
        const text = $(purchaseConditions).text().replace(/&nbsp;/g, ' ');
        if (text) {
            let toMonth = 0;
            Object.keys(months).map(month => {
                if (text.includes(months[month])) {
                    toMonth = Number(month);
                }
            });
            let getPercent = text.match(/\d\d%/g);
            if (getPercent) {getPercent = getPercent[0]}
            let year = text.match(/20\d\d/g);
            if (year) {year = year[0]}
            const monthsInYears = (year - nowYear) * 12;
            console.log('Рассрочка - ', text, text.match(/\d\d месяцев/g));
            res.totalMonths = monthsInYears + toMonth - nowMonth;
            if (text.match(/\d\d месяцев/g)) {
                const aaa = text.match(/\d\d месяцев/g)[0].replace(' месяцев', '')
                if (aaa) {
                    res.totalMonths = Number(aaa);
                }
            }
            if (getPercent) {
                res.percent = Number(getPercent.substring(0, getPercent.length - 1));
            }
        }
        return res;
    };

    const houseImages = [];
    $(houseImagesSelector).each(function () {
        let imagePath = $(this).attr('src');
        if (imagePath) {
            houseImages.push(imagePath);
        }
    });

    const documents = [];
    $(buildingDocs).each(function () {
        documents.push($(this).text().trim());
    });

    const progress = [];
    $(buildingProgress).each(function () {
        const res = {};
        res.title = $(this).find('.BuildingConstruction-name').text().trim();
        res.descr = $(this).find('.BuildingConstruction-info .placeholder').text().trim();
        res.withDocs = 'Ввод в зксплуатацию: ' + $(this).find('.BuildingConstruction-state').text();
        progress.push(res);
    });

    const priceStat = [];
    $(priceChart).each(function () {
        const res = {};
        res.price = $(this).find('.BuildingChart-bar').attr('data-price');
        res.month = $(this).find('.BuildingChart-scale').text();
        priceStat.push(res);
    });
    console.log(record.title);
    card.id = record.id;
    card.billCalc = getPrice();
    card.post_title = record.title;
    card.post_name = record.title;
    card.priceStat = priceStat;
    card.houseImages = houseImages;
    card.progres = progress;
    card.documents = documents;
    card.location = location && location.match(/\d\d.\d*/g);
    card.updated = $(updated).text().match(/\d{2}(\D)\d{2}\1\d{4}/g);
    card.finalDate = $(finalDate).text().trim();
    card.purchaseConditions = $(purchaseConditions).text().trim();
    card.buildingLabel = $(buildingLabel).text().trim();
    card.post_content = $(description).html() && $(description).html().replace('\\', '/');
    card.address = $(address).text().trim();
    card.video = $(buildingVideo).attr('data-video');
    card.videoCopter = buildingVideoCopter && buildingVideoCopter.replace('https://www.youtube.com/watch?v=', '');
    card.area = cropSubStrings($(area).text(), ['р-н']);
    card.developer = $(developer).text().trim();
    card.action = $(buildingAction).text();
    card.price = cropSubStrings($(price).text().trim(), ['Цена:', 'грн/м²']).match(/\d\d \d\d\d/g);

    const getFieldValue = (node) => {
        return node.parent().find('.BuildingAttributes-value').text().trim();
    };
    card.fields.houseClass = getFieldValue($(houseClass));
    card.fields.cnt_houses = getFieldValue($(cnt_houses));
    card.fields.floors = getFieldValue($(floors));
    card.fields.technologies = getFieldValue($(technologies));
    card.fields.walls = getFieldValue($(walls));
    card.fields.warming = getFieldValue($(warming));
    card.fields.heating = getFieldValue($(heating));
    card.fields.ceiling = getFieldValue($(ceiling));
    card.fields.cnt_aparts = getFieldValue($(cnt_aparts));
    card.fields.condition = getFieldValue($(condition));
    card.fields.closed_territory = getFieldValue($(closed_territory));
    card.fields.parking = getFieldValue($(parking));

    const getRoomsValue = (selector, index) => {

        let res = $(selector).parent().parent().find('.BuildingPrices-cell').eq(index).find('span[data-currency="uah"]').text();
        res = cropSubStrings(res, ['от', 'грн', 'м²']);
        if (res.includes('тыс.')) {
            res = res.replace('тыс.', '000')
        }
        if (res.includes('млн')) {
            res = res.replace(' млн', '')
            console.log(1, res);
            if (Number.isInteger(Number(res))) {
                res = res+' 000 000'.replace('.',' ');
                console.log(2, res);
            } else {
                res = (Number(res).toFixed(3)+' 000').replace('.',' ')
                console.log(2, res);
            }
        }
        return res;
    };

    card.rooms.room1 = $(room1).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    card.rooms.room2 = $(room2).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    card.rooms.room3 = $(room3).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    card.rooms.room4 = $(room4).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    card.rooms.room2flors = $(room2flors).parent().parent().find('.BuildingPrices-cell').eq(3).text();
    card.rooms.room1Price = getRoomsValue(room1, 2);
    card.rooms.room2Price = getRoomsValue(room2, 2);
    card.rooms.room3Price = getRoomsValue(room3, 2);
    card.rooms.room4Price = getRoomsValue(room4, 2);
    card.rooms.room2florsPrice = getRoomsValue(room2flors, 2);
    return card;
};
export default parser;