import {defineStore} from "pinia";

const useDictStore = defineStore(
  'dict',
  {
    state: () => ({
      dict: new Array()
    }),
    actions: {
      // 获取字典
      getDict(_key) {
        if (_key == null && _key == "") {
          return null;
        }
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].key == _key) {
              return this.dict[i].value;
            }
          }
        } catch (e) {
          return null;
        }
      },
      // 设置字典
      setDict(_key, value) {
        if (_key !== null && _key !== "") {
          this.dict.push({
            key: _key,
            value: value
          });
        }
      },
      // 删除字典
      removeDict(_key) {
        var bln = false;
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].key == _key) {
              this.dict.splice(i, 1);
              return true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      },
      // 清空字典
      cleanDict() {
        this.dict = new Array();
      },
      // 初始字典
      initDict() {
        // Initialize common dictionary data
        const commonDicts = {
          sys_normal_disable: [
            { label: '正常', value: '0' },
            { label: '停用', value: '1' }
          ],
          sys_user_sex: [
            { label: '男', value: '0' },
            { label: '女', value: '1' },
            { label: '未知', value: '2' }
          ],
          sys_show_hide: [
            { label: '显示', value: '0' },
            { label: '隐藏', value: '1' }
          ],
          sys_yes_no: [
            { label: '是', value: 'Y' },
            { label: '否', value: 'N' }
          ],
          sys_notice_type: [
            { label: '通知', value: '1' },
            { label: '公告', value: '2' }
          ],
          sys_notice_status: [
            { label: '正常', value: '0' },
            { label: '关闭', value: '1' }
          ]
        };
        
        // Set dictionary data in store
        Object.entries(commonDicts).forEach(([key, value]) => {
          this.setDict(key, value);
        });
      }
    }
  })

export default  useDictStore
