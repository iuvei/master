<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Form } from 'element-ui'
import DayPicker from '@/components/day-picker/index.vue'
import FourCheckbox from './../four-checkbox/index.vue'
import { defaultCipherList } from 'constants'

@Component({
  components: {
    DayPicker,
    FourCheckbox
  }
})
export default class Pay extends Vue {
  // 表单对象
  @Prop(Object) form!: any

  // form配置项
  @Prop(Object) item!: any

  // 表单验证规则
  @Prop(Object) rules!: any

  // 是否是行内表现
  @Prop({
    type: Boolean,
    default: true
  })
  isInline!: boolean

  $refs!: {
    form: Form
  }
  btnFun(btn) {
    const { way, event } = btn
    switch (way) {
      case 'reset':
        this.resetFields()
      default:
        event(this.form)
    }
  }

  resetFields() {
    this.$refs['form'].resetFields()
  }
}
</script>
