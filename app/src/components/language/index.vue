<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'

@Component
export default class Language extends Vue {
  @Mutation updateLocale

  locale: string = this.$store.state.locale

  list = [
    { label: 'zh-CN', text: '简体中文', img: require('./img/zh-CN.png') },
    { label: 'zh-TW', text: '繁體中文', img: require('./img/zh-TW.png') },
    { label: 'en-US', text: 'English', img: require('./img/en-US.png') },
    { label: 'ms-MY', text: '马来西亚', img: require('./img/ms-MY.jpg') }
  ]

  onChange(label: string) {
    this.updateLocale(label)
  }
}
</script>
