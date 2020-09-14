var watermark = require('image-watermark');


import data from '../public/data/records';
import config from './config.js';
const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
const https = require('https');
const path = require('path');


var options = {
    'ratio': 0.6,// Should be less than one
    'opacity': 0.6, //Should be less than one
    'override-image' : true,
    'align' : 'ltr',
    'position': 'South',
};
watermark.addWatermark('./test/24231.jpg', './test/logo.png', options);
