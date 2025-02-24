<template>
  <div v-if="Object.keys(iframeList).length > 0" class="iframe-container">
    <template v-for="(item, index) in iframeList" :key="index">
      <iframe
        v-show="item.path === activeIframePath"
        :src="item.url"
        :frameborder="0"
        class="iframe-main"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import useTagsViewStore from '@/store/tagsView'

const tagsViewStore = useTagsViewStore()
const iframeList = computed(() => tagsViewStore.iframeViews)
const activeIframePath = computed(() => tagsViewStore.activeIframePath)
</script>

<style lang="scss" scoped>
.iframe-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  .iframe-main {
    width: 100%;
    height: 100%;
  }
}
</style>
