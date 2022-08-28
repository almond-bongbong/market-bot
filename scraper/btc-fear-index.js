import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendSlackMessage } from '../utils.js';

export const scrapeCryptoFearIndex = async () => {
  try {
    const { data } = await axios.get(
      'https://alternative.me/crypto/fear-and-greed-index/',
    );
    const $ = cheerio.load(data);
    const fngElements = $('.fng-value').toArray();
    const nowFngValue = Number($(fngElements[0]).find('.fng-circle').text());
    const message = `BTC Fear Index is low : ${nowFngValue}`;

    console.log(message);
    if (nowFngValue <= 15) {
      await sendSlackMessage(message, process.env.SLACK_BTC_CHANNEL_ID);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
