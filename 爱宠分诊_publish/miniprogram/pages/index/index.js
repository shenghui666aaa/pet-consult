const request = require('../../utils/request');
const app = getApp();

Page({
  data: {
    openid: ''
  },

  onLoad() {
    this.login();
  },

  // wx.login 拿 code → 后端换取 openid，返回 token 存本地
  login() {
    wx.login({
      success: async ({ code }) => {
        try {
          const data = await request('/api/login', { method: 'POST', data: { code } });
          wx.setStorageSync('token', data.token);
          wx.setStorageSync('openid', data.openid);
          app.globalData.openid = data.openid;
          this.setData({ openid: data.openid });
        } catch (e) {
          console.error('登录失败', e);
        }
      },
      fail: (e) => console.error('wx.login 失败', e)
    });
  },

  goOwner() {
    wx.navigateTo({ url: '/pages/pets/pets' });
  },

  goList() {
    wx.navigateTo({ url: '/pages/consult-list/consult-list' });
  }
});
