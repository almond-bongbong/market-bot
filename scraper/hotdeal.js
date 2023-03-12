import dayjs from 'dayjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { delay, sendSlackMessage, TIMEZONE } from '../utils.js';

const KEYWORDS = [
  // '면도날',
  // '쉬크',
  '스타일러',
  '에어드레서',
  // '질레트',
];

const getLinkByKey = async (key) => {
  const originUrl = `https://www.fmkorea.com${key}`;
  const { data } = await axios.get(originUrl);
  const $ = cheerio.load(data);
  const link = $('.xe_content > a').attr('href');
  return { originUrl, link };
};

export const scrapeHotDeal = async () => {
  try {
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

    const message =
      findItems.length > 0 &&
      findItems
        .map(
          (item) => `🔍 ${item.title}\n🔗 ${item.link}\n🔗 ${item.originUrl}`,
        )
        .join('\n\n');

    if (message)
      await sendSlackMessage(message, process.env.SLACK_HOTDEAL_CHANNEL_ID);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
