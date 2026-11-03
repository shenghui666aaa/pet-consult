const request = require('../../utils/request');
const app = getApp();

const STATUS_TEXT = { pending: '待接诊', accepted: '已接诊', closed: '已关闭' };

Page({
  data: {
    id: '',
    consult: { pet: {}, statusText: '' },
    messages: [],
    inputText: '',
    lastMsgId: ''
  },

  onLoad(options) {
    this.myOpenid = app.globalData.openid || wx.getStorageSync('openid');
    this.setData({ id: options.id });
    this.loadConsult();
    this.loadMessages();
    this.timer = setInterval(() => this.loadMessages(), 3000);
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  async loadConsult() {
    try {
      const consult = await request('/api/consults/' + this.data.id);
      consult.pet = JSON.parse(consult.petSnapshot || '{}');
      consult.statusText = STATUS_TEXT[consult.status] || consult.status;
      this.setData({ consult });
    } catch (e) {}
  },

  async loadMessages() {
    try {
      const messages = await request('/api/consults/' + this.data.id + '/messages');
      messages.forEach(m => {
        m.mine = m.from_openid === this.myOpenid;
        if (m.type === 'image') m.contentUrl = request.fullUrl(m.content);
      });
      const lastMsgId = messages.length ? 'msg-' + messages[messages.length - 1].id : '';
      this.setData({ messages, lastMsgId });
    } catch (e) {}
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  async sendText() {
    const text = this.data.inputText.trim();
    if (!text) return;
    this.setData({ inputText: '' });
    try {
      await request('/api/consults/' + this.data.id + '/messages', { method: 'POST', data: { type: 'text', content: text } });
      this.loadMessages();
    } catch (e) {}
  },

  async sendImage() {
    try {
      const res = await wx.chooseMedia({ count: 1, mediaType: ['image'] });
      wx.showLoading({ title: '发送中' });
      const data = await request.upload(res.tempFiles[0].tempFilePath);
      await request('/api/consults/' + this.data.id + '/messages', { method: 'POST', data: { type: 'image', content: data.url } });
      wx.hideLoading();
      this.loadMessages();
    } catch (e) {
      wx.hideLoading();
    }
  },

  previewImage(e) {
    wx.previewImage({ urls: [e.currentTarget.dataset.url] });
  }
});
