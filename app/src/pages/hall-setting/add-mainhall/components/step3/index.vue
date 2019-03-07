<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {Form} from 'element-ui'
import { PartnerType } from '../../index.vue'

@Component
export default class AddMainhallStep3 extends Vue {
  @Prop(Array) partnerTypes!: PartnerType[]
  @Prop({default: false}) disabled!: boolean
  toNext(callback) {
    const formData: any = {partner_list: []}
    this.partnerTypes.map(partnerType => {
      formData.partner_list = [...formData.partner_list, ...partnerType.checks]
    })
    callback(formData)
  }
  mounted() {
    this.$on('toNext', this.toNext)
  }
  checkAll(partnerType, val) {
    partnerType.checks = val ? partnerType.children.map(v => v.id) : []
    partnerType.isIndeterminate = false
  }
  checkedChange(partnerType, val) {
    let checkedCount = val.length
    partnerType.checkAll = checkedCount === partnerType.children.length
    partnerType.isIndeterminate = checkedCount > 0 && checkedCount < partnerType.children.length
  }
}
</script>