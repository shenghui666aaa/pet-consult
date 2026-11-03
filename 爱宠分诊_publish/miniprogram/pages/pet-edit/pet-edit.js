const request = require('../../utils/request');

Page({
  data: {
    id: '',
    form: { name: '', species: '', breed: '', gender: '', age: '', weight: '', photo: '' },
    photoUrl: '',
    speciesOptions: ['猫', '狗', '其他'],
    genderOptions: ['公', '母'],
    saving: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const pet = await request('/api/pets/' + id);
      this.setData({
        form: {
          name: pet.name, species: pet.species, breed: pet.breed,
          gender: pet.gender, age: String(pet.age), weight: pet.weight, photo: pet.photo
        },
        photoUrl: request.fullUrl(pet.photo)
      });
      wx.setNavigationBarTitle({ title: '编辑宠物' });
    } catch (e) {}
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onSpecies(e) {
    this.setData({ 'form.species': this.data.speciesOptions[e.detail.value] });
  },

  onGender(e) {
    this.setData({ 'form.gender': this.data.genderOptions[e.detail.value] });
  },

  async choosePhoto() {
    try {
      const res = await wx.chooseMedia({ count: 1, mediaType: ['image'] });
      const filePath = res.tempFiles[0].tempFilePath;
      wx.showLoading({ title: '上传中' });
      const data = await request.upload(filePath);
      wx.hideLoading();
      this.setData({ 'form.photo': data.url, photoUrl: request.fullUrl(data.url) });
    } catch (e) {
      wx.hideLoading();
    }
  },

  async save() {
    const { form, id } = this.data;
    if (!form.name) {
      wx.showToast({ title: '请填写宠物名字', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      const body = { ...form, age: Number(form.age) || 0 };
      if (id) {
        await request('/api/pets/' + id, { method: 'PUT', data: body });
      } else {
        await request('/api/pets', { method: 'POST', data: body });
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (e) {
      this.setData({ saving: false });
    }
  }
});
