import axios from 'axios';

export const sendSlackMessage = (text) =>
  axios.post(
    'https://slack.com/api/chat.postMessage',
    {
      channel: process.env.SLACK_CHANNEL_ID,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
      },
    },
  );
