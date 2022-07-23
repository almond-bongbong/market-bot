import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendSlackMessage } from 'utils.js';

export const scrapeCryptoFearIndex = async () => {
  try {
    const { data } = await axios.get(
      'https://alternative.me/crypto/fear-and-greed-index/',
    );
    const $ = cheerio.load(data);
    const fngElements = $('.fng-value').toArray();
    const nowFngValue = Number($(fngElements[0]).find('.fng-circle').text());

    if (nowFngValue <= 15) {
      await sendSlackMessage(
        `BTC Fear Index is low : ${nowFngValue}`,
        process.env.SLACK_BTC_CHANNEL_ID,
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
