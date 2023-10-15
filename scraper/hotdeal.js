import dayjs from 'dayjs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { delay, sendSlackMessage, TIMEZONE } from '../utils.js';

const KEYWORDS = ['쉬크', '시크', '스타일러', '고등어', '제로'];

const getLinkByKey = async (key) => {
  const originUrl = `https://www.fmkorea.com${key}`;
  const { data } = await axios.get(originUrl);
  const $ = cheerio.load(data);
  const link = $('.xe_content > a').attr('href');
  return { originUrl, link };
};

export const scrapeHotDeal = async () => {
  try {
    // const { data } = await axios.get('https://www.fmkorea.com/hotdeal');
    const { data } = await axios.get('https://m.fmkorea.com/index.php?mid=hotdeal&page=1');
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
      .filter((item) => {
        const hasKeyword = KEYWORDS.some((k) => item.title.includes(k));
        const isCreatedIn32minutes = item.createdAt.isAfter(
          dayjs().tz(TIMEZONE).subtract(32, 'minutes'),
        );

        return hasKeyword && isCreatedIn32minutes;
      });

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
