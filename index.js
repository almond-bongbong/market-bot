import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const KEYWORDS = ['면도기', '쉬크', '삼성'];

const getLinkByKey = async (key) => {
  const { data } = await axios.get(`https://www.fmkorea.com${key}`);
  const $ = cheerio.load(data);
  return $('.xe_content > a').attr('href');
};

(async () => {
  try {
    const { data } = await axios.get('https://www.fmkorea.com/hotdeal');
    const $ = cheerio.load(data);
    const itemElements = $('.fm_best_widget > ul > li').toArray();

    const findItems = itemElements
      .map((item) => {
        const key = $(item).find('.title a').attr('href');
        const title = $(item).find('.title a').text().trim();
        return { key, title };
      })
      .filter((item) => KEYWORDS.some((k) => item.title.includes(k)));

    const links = await Promise.all(
      findItems.map((item) => getLinkByKey(item.key)),
    );
    findItems.forEach((item, i) => (item.link = links[i]));

    console.log(findItems);

    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: process.env.SLACK_CHANNEL_ID,
        text: 'Hello world',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
        },
      },
    );
  } catch (error) {
    console.error(error);
  }
})();
