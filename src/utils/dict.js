import useDictStore from '@/store/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType) => {
      res.value[dictType] = [];
      const dicts = useDictStore().getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else if (import.meta.env.DEV) {
        // Initialize dictionary in development mode
        useDictStore().initDict();
        res.value[dictType] = useDictStore().getDict(dictType);
      }
    });
    return toRefs(res.value);
  })();
}
