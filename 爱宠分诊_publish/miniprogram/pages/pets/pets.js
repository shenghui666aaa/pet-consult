const request = require('../../utils/request');

Page({
  data: {
    pets: [],
    loading: true
  },

  onShow() {
    this.loadPets();
  },

  async loadPets() {
    try {
      const pets = await request('/api/pets');
      pets.forEach(p => { p.photoUrl = request.fullUrl(p.photo); });
      this.setData({ pets, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  addPet() {
    wx.navigateTo({ url: '/pages/pet-edit/pet-edit' });
  },

  editPet(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/pet-edit/pet-edit?id=' + id });
  },

  goConsult() {
    wx.navigateTo({ url: '/pages/consult-create/consult-create' });
  }
});
