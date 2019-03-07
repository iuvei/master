<template lang="pug" src="./index.pug"></template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { Form } from 'element-ui'
import _ from 'lodash'

@Component({
  components: {}
})
export default class SelectAll extends Vue {
  @Prop()
  options!: any
  @Prop()
  name!: string
  @Prop()
  index!: number
  @Prop()
  checkedDefut!: any
  @Watch('checkedDefut')
  checkChange(newVal, oldVal) {
    this.checkList = newVal || []
    this.getIndeterminate()
  }
  @Emit('onchange')
  onChange(list, key) {}

  indeterminate: boolean = true
  checkAll: boolean = false
  checkList = this.checkedDefut

  mounted() {
    this.$nextTick(() => this.getIndeterminate())
  }
  getIndeterminate() {
    this.indeterminate = true
    this.checkAll = false
    if (this.checkedDefut.length === this.options.length) {
      this.indeterminate = false
      this.checkAll = true
    }
    if (this.checkedDefut.length === 0) {
      this.indeterminate = false
      this.checkAll = false
    }
  }

  onCheckAllChange(val) {
    let list: any = []
    this.options.map((v: any) => {
      list.push(`${v.game_type}_${v.partner_id}`)
    })
    this.checkList = val ? list : []
    this.indeterminate = false
    this.onChange(this.checkList, this.index)
  }
  handleCheckBoxChange(value) {
    let checkedCount = value.length
    this.checkAll = checkedCount === this.options.length
    this.indeterminate = checkedCount > 0 && checkedCount < this.options.length
    this.onChange(this.checkList, this.index)
  }
}
</script>
