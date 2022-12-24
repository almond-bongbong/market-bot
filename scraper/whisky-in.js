import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendSlackMessage } from '../utils.js';

export const scrapeHibikiIn = async () => {
  try {
    const { data } = await axios.get(
      'https://www.pocketcu.co.kr/product/detail/2022080021854?cateTyp=A&chldMealEvtYn=null',
    );
    const $ = cheerio.load(data);
    const contentDiv = $('#contents > .sub');
    const className = contentDiv.attr('class');

    if (className.indexOf('sold_out') === -1) {
      await sendSlackMessage(
        '히비키 입고되었습니다. \n https://www.pocketcu.co.kr/product/detail/2022080021854?cateTyp=A&chldMealEvtYn=null',
        process.env.SLACK_HOTDEAL_CHANNEL_ID,
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};