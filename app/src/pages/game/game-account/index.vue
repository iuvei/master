<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="tsx">
import { Vue, Component } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import config from '@/config'

@Component({})
export default class GamesAccount extends Vue {
  // 游戏种类
  gameType: Object[] = []

  data: any = {
    id: '',
    name: '',
    config: []
  }
  // 表个配置
  isLoading: Boolean = false
  tableData: any = []

  // 分页配置
  sizes: number[] = [20, 50, 100, 200]
  page: number = 1
  size: number = 20
  total: number = 0

  // 弹窗配置
  isDialogVisible: boolean = false
  isSaveLoading: boolean = false

  $refs!: {
    formAdd: Form
  }

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    // let params = {
    //   page: this.page,
    //   page_size: this.size
    // }

    // params = _.assign(params)

    api
      .getGameType({})
      .then((response: any) => {
        this.isLoading = false

        if (response.code === 0) {
          this.tableData = response.data
        } else {
          this.tableData = []
        }
      })
      .catch(error => {
        this.isLoading = false
      })
  }
  // 编辑按钮
  onEditClick(row) {
    this.data.id = row.id
    this.data.name = row.show_name
    this.data.config = []
    api.getGameConfig({ id: row.id }).then((response: any) => {
      if (response.code === 0 && response.data) {
        for (let key in response.data) {
          this.data.config.push({
            key,
            value: response.data[key]
          })
        }
      } else {
        this.data.config = []
      }
    })
    this.isDialogVisible = true
  }

  // 编辑保存
  onDialogSaveClick() {
    this.isSaveLoading = true
    let data: any = {
      id: this.data.id,
      config: {}
    }
    this.data.config.map(item => {
      data.config[item.key] = item.value
    })
    data.config = JSON.stringify(data.config)
    api.postGameConfig(data).then((response: any) => {
      if (response.code === 0 && response.data) {
        this.$message.success('修改成功！')
        this.isSaveLoading = false
      } else {
        this.$message.success('修改失败！')
        this.isSaveLoading = false
      }
    })
    this.isDialogVisible = false
  }

  onPageSizeChange(size: number) {
    this.size = size
    this.requestTable()
  }

  onCurrentChange(page: number) {
    this.page = page
    this.requestTable()
  }
}
</script>
