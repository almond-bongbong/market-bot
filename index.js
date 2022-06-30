import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { sendSlackMessage } from './utils.js';

const TIMEZONE = 'Asia/Seoul';
const KEYWORDS = ['면도기', '쉬크', '스타일러', '에어드레서', '딜라이트', '질레트', '우산'];

dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config();

const getLinkByKey = async (key) => {
  const originUrl = `https://www.fmkorea.com${key}`;
  const { data } = await axios.get(originUrl);
  const $ = cheerio.load(data);
  const link = $('.xe_content > a').attr('href');
  return { originUrl, link };
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    console.log(
      '🚀 Start scraping',
      dayjs().tz(TIMEZONE).format('YYYY.MM.DD HH:mm'),
    );
    const { data } = await axios.get('https://www.fmkorea.com/hotdeal');
    const $ = cheerio.load(data);
    const itemElements = $('.fm_best_widget > ul > li').toArray();

    const findItems = itemElements
      .map((item) => {
        const key = $(item).find('.title a').attr('href');
        const title = $(item).find('.title a').text().trim();
        const regDateText = $(item).find('.regdate').text().trim();
        const isRegisteredIn24hour = regDateText.includes(':');
        let createdAt;

        if (isRegisteredIn24hour) {
          const datetime = dayjs.tz(
            `${dayjs().tz(TIMEZONE).format('YYYY-MM-DD')} ${regDateText}`,
            TIMEZONE,
          );
          createdAt = datetime.isAfter(dayjs().tz(TIMEZONE))
            ? datetime.subtract(1, 'day')
            : datetime;
        } else {
          createdAt = dayjs.tz(regDateText, TIMEZONE).endOf('day');
        }

        return { key, title, createdAt };
      })
      .filter(
        (item) =>
          KEYWORDS.some((k) => item.title.includes(k)) &&
          item.createdAt.isAfter(dayjs().tz(TIMEZONE).subtract(32, 'minutes')),
      );

    await delay(1000);

    for (const item of findItems) {
      const { link, originUrl } = await getLinkByKey(item.key);
      item.link = link;
      item.originUrl = originUrl;
      await delay(1000);
    }

    if (findItems.length) {
      console.log(`🔍 Found ${findItems.length} items`);
    }

    const message =
      findItems.length > 0 &&
      findItems.map((item) => `🔍 ${item.title}\n🔗 ${item.link}\n🔗 ${item.originUrl}`).join('\n\n');

    if (message) await sendSlackMessage(message);
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
