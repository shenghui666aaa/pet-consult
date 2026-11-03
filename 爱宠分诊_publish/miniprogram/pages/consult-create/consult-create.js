const request = require('../../utils/request');

Page({
  data: {
    pets: [],
    petNames: [],
    selectedPetIndex: -1,
    selectedPetName: '',
    symptom: '',
    images: [],     // 相对路径，提交给后端
    imageUrls: [],  // 完整 URL，用于显示
    submitting: false
  },

  onLoad() {
    this.loadPets();
  },

  async loadPets() {
    try {
      const pets = await request('/api/pets');
      const petNames = pets.map(p => {
        const extra = p.breed || p.species;
        return extra ? `${p.name}（${extra}）` : p.name;
      });
      this.setData({ pets, petNames });
    } catch (e) {}
  },

  onPetChange(e) {
    const i = Number(e.detail.value);
    this.setData({ selectedPetIndex: i, selectedPetName: this.data.petNames[i] });
  },

  onSymptom(e) {
    this.setData({ symptom: e.detail.value });
  },

  async addImage() {
    try {
      const res = await wx.chooseMedia({ count: 1, mediaType: ['image'] });
      wx.showLoading({ title: '上传中' });
      const data = await request.upload(res.tempFiles[0].tempFilePath);
      wx.hideLoading();
      this.setData({
        images: [...this.data.images, data.url],
        imageUrls: [...this.data.imageUrls, request.fullUrl(data.url)]
      });
    } catch (e) {
      wx.hideLoading();
    }
  },

  removeImage(e) {
    const i = e.currentTarget.dataset.index;
    const images = this.data.images.slice();
    const imageUrls = this.data.imageUrls.slice();
    images.splice(i, 1);
    imageUrls.splice(i, 1);
    this.setData({ images, imageUrls });
  },

  async submit() {
    const { pets, selectedPetIndex, symptom, images } = this.data;
    if (selectedPetIndex < 0) return wx.showToast({ title: '请选择宠物', icon: 'none' });
    if (!symptom.trim()) return wx.showToast({ title: '请填写症状描述', icon: 'none' });

    this.setData({ submitting: true });
    try {
      const consult = await request('/api/consults', {
        method: 'POST',
        data: { petId: pets[selectedPetIndex].id, symptom, images }
      });
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.redirectTo({ url: '/pages/consult-result/consult-result?id=' + consult.id }), 800);
    } catch (e) {
      this.setData({ submitting: false });
    }
  }
});
