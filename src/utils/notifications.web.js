// Web fallback: Push notifications are not supported on standard Web
export async function registerForPushNotificationsAsync() {
  console.log('Push notifications are not supported on Web.');
  return null;
}
