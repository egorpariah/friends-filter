export default class VkApi {
  constructor(apiId) {
    this.init = new Promise((resolve, reject) => {
      VK.init({
        apiId: apiId,
      });

      VK.Auth.login((data) => {
        if (data.session) {
          resolve(data);
        } else {
          reject(new Error('Не удалось авторизоваться'));
        }
      });
    });
  }

  getApi(method, params) {
    return new Promise((resolve, reject) => {
      VK.api(method, params, (data) => {
        if (!data.error) {
          resolve(data.response);
        } else {
          reject(new Error(data.error));
        }
      });
    });
  }
}
