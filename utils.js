import axios from 'axios';

export const TIMEZONE = 'Asia/Seoul';

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const sendSlackMessage = (text, channel) =>
  axios.post(
    'https://slack.com/api/chat.postMessage',
    {
      channel,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
      },
    },
  );
