const request = require('../../utils/request');

Page({
  data: {
    id: '',
    consult: { pet: {}, symptom: '' },
    aiLines: [],
    imageUrls: [],
    done: false
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.load();
    this.timer = setInterval(() => this.load(), 2000);
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  async load() {
    try {
      const consult = await request('/api/consults/' + this.data.id);
      consult.pet = JSON.parse(consult.petSnapshot || '{}');
      const done = !!consult.ai_result;
      const imageUrls = JSON.parse(consult.images || '[]').map(u => request.fullUrl(u));
      this.setData({
        consult,
        aiLines: done ? consult.ai_result.split('\n') : [],
        imageUrls,
        done
      });
      if (done && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    } catch (e) {}
  },

  previewImage(e) {
    wx.previewImage({ urls: this.data.imageUrls, current: e.currentTarget.dataset.url });
  }
});
