const request = require('../../utils/request');

const STATUS_TEXT = { pending: '待接诊', accepted: '已接诊', closed: '已关闭' };

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
      const list = await request('/api/consults/doctor');
      list.forEach(c => {
        c.pet = JSON.parse(c.petSnapshot || '{}');
        c.statusText = STATUS_TEXT[c.status] || c.status;
      });
      this.setData({ list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  async accept(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await request('/api/consults/' + id + '/accept', { method: 'POST' });
      wx.showToast({ title: '已接诊', icon: 'success' });
      this.load();
    } catch (e) {}
  },

  goChat(e) {
    wx.navigateTo({ url: '/pages/chat/chat?id=' + e.currentTarget.dataset.id });
  }
});
