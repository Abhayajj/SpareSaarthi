const axios = require('axios');

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
    console.log('Skipping push notification: Invalid or missing Expo push token');
    return;
  }

  try {
    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      },
      {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Push notification sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending push notification:', error.response?.data || error.message);
  }
};

module.exports = { sendPushNotification };
