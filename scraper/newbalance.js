import axios from 'axios';
import qs from 'querystring';
import { sendSlackMessage } from '../utils.js';

const WANTED_SHOES = [
  'M991GL',
  'M991EKS (MEN)',
  'M991NV (MEN)',
  'M990GY3',
  'M990VS3',
  'M991UKF',
];

export const scrapeNewBalance = async () => {
  try {
    const { data } = await axios.post(
      'https://www.nbkorea.com/product/searchResultFilter.action',
      qs.stringify({
        pageNo: 1,
        pageSize: 100,
        schWord: '',
        prodPart: '',
        cIdx: '1283',
        cateGrpCode: '250110',
        supGroupCode: '',
        chgGather: 'N',
        emphasis: 'N',
        compareView: 'N',
        'subCateIdx[]': '1283',
        resultSort: '01',
        moreBtnObj: 'moreList',
        appendObj: 'prodList',
        cateSummaryYn: 'N',
        gTagList: '',
        soldOutYn: '',
        pagingYn: 'false',
        clothesYn: 'N',
      }),
    );
    const wantedShoes = data.resultList.filter((item) =>
      WANTED_SHOES.includes(item.DisplayName),
    );
    const canBuyShoes = wantedShoes.filter((item) => item.SoldOutYn === 'N');

    if (canBuyShoes.length > 0) {
      const message = canBuyShoes.map((item) => {
        const link = `https://www.nbkorea.com/product/productDetail.action?styleCode=${item.StyleCode}&colCode=${item.ColCode}&cIdx=${item.CIdx}`;
        return `${item.DisplayName} 구매가능: ${link}`;
      });
      await sendSlackMessage(
        message.join('\n'),
        process.env.SLACK_HOTDEAL_CHANNEL_ID,
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
