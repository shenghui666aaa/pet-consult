// 封装 wx.request 调用本地后端
// 真机调试时用电脑的局域网 IP（手机与电脑连同一 WiFi）
const BASE_URL = 'http://192.168.1.9:3000';

function request(path, options = {}) {
  const { method = 'GET', data = {} } = options;
  const token = wx.getStorageSync('token');
  const header = { 'Content-Type': 'application/json' };
  if (token) header.Authorization = 'Bearer ' + token;

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method,
      data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const msg = (res.data && res.data.error) || '请求失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '无法连接服务器', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 上传文件（图片），返回 { url }（url 为相对路径 /uploads/xxx）
function upload(filePath) {
  const token = wx.getStorageSync('token');
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + '/api/upload',
      filePath,
      name: 'file',
      header: { Authorization: 'Bearer ' + token },
      success(res) {
        let data = {};
        try { data = JSON.parse(res.data); } catch (e) {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          wx.showToast({ title: (data && data.error) || '上传失败', icon: 'none' });
          reject(data);
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 把后端返回的相对路径（如 /uploads/xxx.jpg）拼成完整 URL
function fullUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return BASE_URL + path;
}

module.exports = request;
module.exports.upload = upload;
module.exports.fullUrl = fullUrl;
