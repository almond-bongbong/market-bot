import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { scrapeHotDeal } from './scraper/hotdeal.js';
import { scrapeCryptoFearIndex } from './scraper/btc-fear-index.js';
import { TIMEZONE } from './utils.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config();

(async () => {
  console.log(
    '🚀 Start scraping',
    dayjs().tz(TIMEZONE).format('YYYY.MM.DD HH:mm'),
  );
  scrapeHotDeal();
  scrapeCryptoFearIndex();
})();
