import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { scrapeHotDeal } from './scraper/hotdeal.js';
import { scrapeCryptoFearIndex } from './scraper/btc-fear-index.js';
import { scrapeHibikiIn } from './scraper/whisky-in.js';
import { scrapeNewBalance } from './scraper/newbalance.js';
import { TIMEZONE } from './utils.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config();

(async () => {
  console.log(
    '🚀 Start scraping',
    dayjs().tz(TIMEZONE).format('YYYY.MM.DD HH:mm'),
  );
  scrapeCryptoFearIndex();
  scrapeHotDeal();
  scrapeHibikiIn();
  scrapeNewBalance();
})();
