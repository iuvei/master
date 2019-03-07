<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>
<script lang="tsx">
import { Component, Vue } from 'vue-property-decorator'
import setNavigation from '../components/set-navigation/index.vue'

@Component({
  components: {
    setNavigation
  }
})
export default class Navigation extends Vue {
  $refs!: {
    setNavigation
    pcSetNavigation
  }
  activeName = 'pc'
  hall = {
    id: '',
    company_name: ''
  }
  tableHeadPc = [
    {
      label: '一级导航',
      prop: 'name',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return (
          <span>
            {val}
            {row.code !== 'home' && <i class="el-icon-rank" />}
          </span>
        )
      }
    },
    {
      label: '二级导航',
      prop: 'child_menu_list'
    }
  ]
  tableHeadPcEleOrH5 = [
    {
      label: '一级导航',
      prop: 'name',
      formatter: (row, column, val) => {
        const h = this.$createElement
        return (
          <span>
            {val}
            <i class="el-icon-rank" />
          </span>
        )
      }
    },
    {
      label: '对应游戏/api',
      prop: 'list_api_name'
    }
  ]
  tableData = []
  mounted() {
    const query = this.$route.query
    this.hall.id = query.hall_id
    this.hall.company_name = query.company_name
  }
  /**保存按钮事件 调用子组件中的保存事件 */
  saveChange() {
    if (typeof this.$refs.setNavigation != 'undefined') {
      this.$refs.setNavigation.saveChange(this.activeName)
    } else if (typeof this.$refs.pcSetNavigation != 'undefined') {
      this.$refs.pcSetNavigation.saveChange(this.activeName)
    }
  }
  /**新增一级导航按钮事件 调用子组件中的新增事件 */
  addNavigation() {
    this.$refs.pcSetNavigation.addNavigation()
  }
  handleClick() {}
  back() {
    // this.$router.push({
    // path:'/mainhall-manage'
    // })
    this.$router.go(-1)
  }
  preview() {
    this.$message.error('该功能正在开发中')
  }
}
</script>
