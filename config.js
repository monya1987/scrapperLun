import buddhaParser from './parsers/buddhapizza';
import pizzaOdUaParser from './parsers/pizzaOdUa';

export default [
  {
    name: 'buddhapizza',
    url: 'https://buddhapizza.com/',
    nameOrig: 'Buddha Pizza',
    contacts: [
      {
        address: '',
        pickup: false,
        workHours: '11.00 - 22.30',
        phones: ['+380 (67) 485 33 88'],
      }
    ],
    logo: 'https://buddhapizza.com/img/og-image.jpg',
    deliveryTime: 60, // in minutes
    parser: buddhaParser
  },
  {
    name: 'pizzaodua',
    url: 'https://pizza.od.ua/menu/pizza/',
    nameOrig: 'Pizza.od.ua',
    contacts: [
      {
        address: 'ул. Ак. Вильямса 62 А',
        pickup: true,
        workHours: '10.00 - 00.00',
        phones: ['+38 (048) 700 51 51', '+38 (063) 700 51 51'],
      },
      {
        address: 'ул. Успенская, 40',
        pickup: true,
        workHours: '10.00 - 00.00',
        phones: ['+38 (048) 700 51 51', '+38 (063) 700 51 51'],
      }
    ],
    logo: 'https://buddhapizza.com/img/og-image.jpg',
    deliveryTime: 60, // in minutes
    parser: pizzaOdUaParser
  }
]