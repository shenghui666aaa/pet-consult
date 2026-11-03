const request = require('../../utils/request');

const STATUS_TEXT = { pending: '分析中', answered: '已分诊', accepted: '已接诊', closed: '已关闭' };

Page({
  data: {
    list: [],
    loading: true
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const list = await request('/api/consults');
      list.forEach(c => {
        c.pet = JSON.parse(c.petSnapshot || '{}');
        c.statusText = STATUS_TEXT[c.status] || c.status;
      });
      this.setData({ list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  goChat(e) {
    wx.navigateTo({ url: '/pages/consult-result/consult-result?id=' + e.currentTarget.dataset.id });
  }
});
