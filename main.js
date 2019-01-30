const axios = require('axios');
const _ = require("lodash");
const sleep = require("await-sleep");
const Promise = require("bluebird");

// Replace values here
const TOKEN = "YOUR_TOKEN_HERE";

const slackAPI = axios.create({
  baseURL: 'https://slack.com/api'
});

const getUsers = async () => {
  const { data } = await slackAPI.get(
    `/users.list?token=${TOKEN}`
  );
  if (!data.ok) console.error(data.error);
  return data.members;
}

const openDirectMessageChannel = async (userId) => {
  const { data } = await slackAPI.post(
    `/im.open?token=${TOKEN}&user=${userId}`
  );
  if (!data.ok) console.error(data.error);
  return data.channel.id;
}

const postMessage = async (message, channelId) => {
  const { data } = await slackAPI.post(
    `/chat.postMessage?token=${TOKEN}&channel=${channelId}&text=${encodeURIComponent(message)}`
  );
  if (!data.ok) console.error(data.error);
  return data;
}

const run = async () => {
  try {
    const users = await getUsers();
    const members = _.filter(users, user => {
      return user.is_admin === false && user.deleted === false;
    });

    console.log("Members Count", members.length);

    await Promise.map(members, async (member, index) => {
      const message = "YOUR_MESSAGE_HERE";
      const channelId = await openDirectMessageChannel(member.id);

      console.log(`[${index}] Open direct message channel ${channelId} with user ${member.id}`);

      await postMessage(message, channelId);

      console.log(`[${index}] Message sent to user ${member.id}`)

      await sleep(1000);
    }, {
      concurrency: 1
    });

    console.log(`Message sent to all users`);
  } catch (error) {
    console.error(error)
  }
}

run();
