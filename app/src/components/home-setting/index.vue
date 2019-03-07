<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Language from '@/components/language/index.vue'

@Component({
  components: {
    Language
  },
  directives: {
    /**
     * 自定义指令，当浏览器窗口被改变大小时，动态修改设置弹出层的高度
     * @todo 是否需要在 unbind 中解注册事件，暂不考虑先
     */
    setting: {
      bind(el) {
        el.addEventListener('click', e => {
          e.stopPropagation()
        })
        const fn = () => {
          el.style.height = window.innerHeight - 70 + 'px'
          el.style.maxHeight = window.innerHeight - 70 + 'px'
          el.style.overflow = 'auto'
        }
        fn()
        window.onresize = fn
      }
    }
  }
})
export default class HomeSetting extends Vue {
  @Prop(Boolean) visible!: boolean

  isSoundEnabled: boolean = false

  @Watch('isSoundEnabled')
  soundEnabledChange(value) {
    if (value) {
      this.$emit('requestAudio')
    }
  }
}
</script>
