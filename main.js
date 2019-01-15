const axios = require('axios');

// Replace values here
const TOKEN = "";
const CHANNEL = "G2HU2PWJW";
const MESSAGE = "test";

const slackAPI = axios.create({
  baseURL: 'https://slack.com/api'
});

const getChannelMembers = async (channelId) => {
  const { data } = await slackAPI.get(
    `/conversations.members?token=${TOKEN}&channel=${CHANNEL}`
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
    `/chat.postMessage?token=${TOKEN}&channel=${channelId}&text=${message}`
  );
  if (!data.ok) console.error(data.error);
  return data;
}

const run = async () => {
  try {
    const membersIds = await getChannelMembers(CHANNEL);
    const nbMembers = membersIds.length;

    console.log(`${nbMembers} members in the channel ${CHANNEL}`);

    const promises = membersIds.map(async (memberId, index) => {
      const channelId = await openDirectMessageChannel(memberId);
      console.log(`Open direct message channel ${channelId} with user ${memberId}`);
      return postMessage(MESSAGE, channelId).then(() => {
        console.log(`Message sent to user ${memberId} (${index+1}/${nbMembers})`);
      });
    });

    await Promise.all(promises);
    console.log(`Message sent to all users`);
  } catch (error) {
    console.error(error)
  }
}

run();

