<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class FourCheckbox extends Vue {
  /** 数据源 */
  @Prop(Array) options!: any

  @Prop(Boolean) isAllSelected!: boolean

  @Prop(Boolean) isAllIndeterminated!: boolean

  @Prop({ type: Boolean, default: false })
  disabled!: boolean

  optionData: any = this.options

  isAllIndeterminate: boolean = this.isAllIndeterminated || false

  isAllSelect: boolean = this.isAllSelected || false

  @Watch('options')
  onOptionsChanged(val) {
    this.optionData = val
    this.isAllIndeterminate = this.isAllIndeterminated
    this.isAllSelect = this.isAllSelected
  }
  // 全选的情况
  handleCheckAllChange(value) {
    // 改变当前状态
    this.traversingArray(this.optionData, value)
    this.isAllIndeterminate = false
  }

  // 一级菜单点击
  // index:点击选中的optionData对应的下标
  handleCheckGroupChange(index) {
    // 改变当前子菜单的状态
    const { children, model } = this.optionData[index]
    this.traversingArray(children, model)
    this.optionData[index].indeterminate = false

    // 判断是否是全选状态
    this.selectAllFun()
  }

  // 二级菜单点击
  //groupIndex: 一级菜单的下标
  // childIndex:二级菜单的下标
  handleCheckChildChange(groupIndex, childIndex) {
    // 改变当前的子菜单的状态
    let { children, model } = this.optionData[groupIndex]['children'][childIndex]
    this.traversingArray(children, model)
    this.optionData[groupIndex]['children'][childIndex].indeterminate = false

    // 判断一级菜单是否全选
    this.selectAllGroupFun(groupIndex)

    // 判断是否是全选状态
    this.selectAllFun()
  }

  // 三级菜单点击
  //groupIndex: 一级菜单的下标
  // childIndex:二级菜单的下标
  // i:三级菜单的下标
  handleCheckInnerChildChange(groupIndex, childIndex, i) {
    // 改变当前子菜单的状态
    let { children, model } = this.optionData[groupIndex]['children'][childIndex]['children'][i]
    this.optionData[groupIndex]['children'][childIndex]['children'][i].indeterminate = false
    children && this.traversingArray(children, model)

    // 对二级菜单的影响
    const erChildren = this.optionData[groupIndex]['children'][childIndex].children
    let count = 0
    let bool = false
    erChildren.map((obj: any) => {
      if (obj.model) {
        count++
      }
      if (obj.children) {
        bool = true
      }
    })

    const tempLength = erChildren.length
    this.optionData[groupIndex]['children'][childIndex].model = bool ? count === tempLength : count === tempLength || (!children && true)
    this.optionData[groupIndex]['children'][childIndex].indeterminate = count > 0 && count < tempLength

    // 对一级菜单的影响
    this.selectAllGroupFun(groupIndex)

    // 判断是否是全选状态
    this.selectAllFun()
  }

  handleCheckSingleChildChange(groupIndex, childIndex, i, iIner) {
    // 对三级菜单的影响
    let { children } = this.optionData[groupIndex]['children'][childIndex]['children'][i]
    let cou = 0
    children.map((obj: any) => {
      if (obj.model) {
        cou++
      }
    })
    const tempLen = children.length
    this.optionData[groupIndex]['children'][childIndex]['children'][i].model = cou === tempLen || true
    this.optionData[groupIndex]['children'][childIndex]['children'][i].indeterminate = cou > 0 && cou < tempLen

    // 对二级菜单的影响
    const erChildren = this.optionData[groupIndex]['children'][childIndex].children
    let count = 0
    erChildren.map((obj: any) => {
      if (obj.model) {
        count++
      }
    })
    const tempLength = erChildren.length
    this.optionData[groupIndex]['children'][childIndex].model = count === tempLength
    this.optionData[groupIndex]['children'][childIndex].indeterminate = count > 0 && count < tempLength

    // 对一级菜单的影响
    this.selectAllGroupFun(groupIndex)

    // 判断是否是全选状态
    this.selectAllFun()
  }

  // 遍历数组，一直遍历到最里面的数组
  // children：数组
  // value：改变model的状态值
  traversingArray(children, value) {
    children &&
      children.map(child => {
        child.model = value
        child.indeterminate = false
        if (child.children) {
          this.traversingArray(child.children, value)
        }
      })
  }

  // 判断全选的方法
  selectAllFun() {
    let count = 0
    let bool = false
    this.optionData.map((obj: any) => {
      if (obj.model) {
        count++
      }
      if (obj.indeterminate) {
        bool = true
      }
    })
    const tempLength = this.optionData.length
    this.isAllSelect = count === tempLength
    this.isAllIndeterminate = (count > 0 && count < tempLength) || bool
  }

  // 判断一级菜单全选的方法
  selectAllGroupFun(groupIndex) {
    let count = 0
    let bool = false
    this.optionData[groupIndex]['children'].map((obj: any) => {
      if (obj.model) {
        count++
      }
      if (obj.indeterminate) {
        bool = true
      }
    })
    const tempLength = this.optionData[groupIndex]['children'].length
    this.optionData[groupIndex].model = count === tempLength
    this.optionData[groupIndex].indeterminate = (count > 0 && count < tempLength) || bool
  }

  /*
  * 四级checkbox选择总说明
    1.全选时
    2.一级菜单点击：a.对下影响：改变自己所以子菜单的状态，b:对上影响：是否全选
    3.二级菜单点击：a.对下影响：改变自己所以子菜单的状态，b：对上影响：①.一级菜单是否全选，②.是否全选
    4.三级菜单点击：a.对上影响：①.二级菜单是否全选，②.一级菜单是否全选 ③.是否全选
  *
  */

  // 给class为checkbox-children动态添加display为flex
  getFlex(check) {
    const { children } = check
    let tmp = 'table'
    let bool = false
    if (children) {
      try {
        children.map((obj: any) => {
          if (!obj.children) {
            tmp = 'flex'
          } else {
            bool = true
            throw ''
          }
        })
      } catch (e) {}
    }
    return bool ? 'table' : tmp
  }
}
</script>
