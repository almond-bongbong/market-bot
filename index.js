import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { sendSlackMessage } from './utils.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config();

const KEYWORDS = ['면도기', '쉬크', '스타일러', '에어드레서', '제로'];

const getLinkByKey = async (key) => {
  const { data } = await axios.get(`https://www.fmkorea.com${key}`);
  const $ = cheerio.load(data);
  return $('.xe_content > a').attr('href');
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    console.log('🚀 Start scraping', dayjs().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm'));
    const { data } = await axios.get('https://www.fmkorea.com/hotdeal');
    const $ = cheerio.load(data);
    const itemElements = $('.fm_best_widget > ul > li').toArray();

    const findItems = itemElements
      .map((item) => {
        const key = $(item).find('.title a').attr('href');
        const title = $(item).find('.title a').text().trim();
        const regDateText = $(item).find('.regdate').text();
        const isTodayRegistered = regDateText.includes(':');
        const createdAt = isTodayRegistered
          ? dayjs(`${dayjs().tz('Asia/Seoul').format('YYYY.MM.DD')} ${regDateText}`)
          : dayjs(regDateText).tz('Asia/Seoul').endOf('day');

        return { key, title, createdAt };
      })
      .filter(
        (item) =>
          KEYWORDS.some((k) => item.title.includes(k)) &&
          item.createdAt.isAfter(dayjs().subtract(30, 'minutes')),
      );

    await delay(1000);

    for (const item of findItems) {
      item.link = await getLinkByKey(item.key);
      await delay(1000);
    }

    const message =
      findItems.length > 0 &&
      findItems.map((item) => `🔍 ${item.title}\n${item.link}`).join('\n\n');

    if (message) await sendSlackMessage(message);
  } catch (error) {
    console.error(error);
  }
})();
