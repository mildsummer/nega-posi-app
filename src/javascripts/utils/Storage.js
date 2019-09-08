/**
 * localStorageを使うラッパークラス
 * localStorageが使えない場合はメモリ上で管理(Safariのプライベートモードなど)
 */
class Storage {
  constructor() {
    this.enableLocalStorage = true;
    try {
      window.localStorage.setItem('test', '0');
      window.localStorage.removeItem('test', '0');
    } catch (e) {
      this.enableLocalStorage = false;
      this.data = {};
    }
  }

  /**
   * 値を設定
   * @param key
   * @param value
   */
  setItem(key, value) {
    if (this.enableLocalStorage) {
      window.localStorage.setItem(key, value);
    } else {
      this.data[key] = value;
    }
  }

  /**
   * 値を取得
   * @param key
   * @returns {*}
   */
  getItem(key) {
    let value;
    if (this.enableLocalStorage) {
      value = window.localStorage.getItem(key);
      value = value === 'true' ? true : value;
      value = value === 'false' ? false : value;
    } else {
      value = this.data[key];
    }
    return value;
  }

  /**
   * 値を削除
   * @param key
   */
  removeItem(key) {
    if (this.enableLocalStorage) {
      window.localStorage.removeItem(key);
    } else {
      delete this.data[key];
    }
  }
}

export default new Storage();
