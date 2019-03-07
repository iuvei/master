<template lang="pug" src="./index.pug"></template>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import { namespace } from 'vuex-class'
const USER = namespace('user')

@Component({
  components: {}
})
export default class ApiSetting extends Vue {
  @USER.State btnAuth
  /**
   * 1.编辑显示开关
   * 2.编辑排序
   */
  authorizedButtons = { id_1: 14, id_2: 15 }
  get unauthorizedBtnDic() {
    return _.mapValues(this.authorizedButtons, val => {
      return !!this.permissions[val]
    })
  }
  @Prop(Object) permissions: any

  //筛选框配置
  @Prop({
    default() {
      return 'apiSetting'
    }
  })
  activeName!: any

  isLoading: Boolean = false
  tableData: any = []
  gameType: Object[] = [
    { label: '全部', value: '' },
    { label: '电子', value: '1' },
    { label: '视讯', value: '2' },
    { label: '体育', value: '3' },
    { label: '电竞', value: '4' },
    { label: '彩票', value: '5' },
    { label: '棋牌', value: '6' }
  ]
  zhuText = {
    0: '此模块对应控制前端：①PC客户端-电子和棋牌API首页侧边导航热门的内容；②H5客户端--首页热门的设置',
    1: '此模块对应控制前端：①PC客户端-首页-电子游艺模块显示有打开热门标识的API,及对应排序；②PC客户端-电子和棋牌API首页-侧边电子游艺导航栏下的内容；③H5客户端--首页电子游艺导航栏的内容',
    2: '此模块对应控制前端：①PC客户端-首页-真人热门模块的排序受此排序控制；②PC客户端-电子和棋牌API首页-侧边真人视讯导航栏下的内容；③H5客户端--首页真人视讯导航栏的内容',
    3: '此模块对应控制前端：①PC客户端-电子和棋牌API首页-侧边体育导航栏下的内容；②H5客户端--首页体育导航栏的内容',
    4: '此模块对应控制前端：①PC客户端-电子和棋牌API首页-侧边电竞导航栏下的内容；②H5客户端--首页电竞导航栏的内容',
    5: '此模块对应控制前端：①PC客户端-电子和棋牌API首页-侧边彩票导航栏下的内容；②H5客户端--首页彩票导航栏的内容',
    6: '此模块对应控制前端：①PC客户端-电子和棋牌API首页-侧边棋牌导航栏下的内容；②H5客户端--首页棋牌导航栏的内容'
  }

  tabPosition: string = '0'

  isSaveLoading: Boolean = false

  get tableHead() {
    return [
      {
        label: '游戏类型',
        prop: 'game_type',
        formatter: (row, column, value: string, index): string => {
          let t: any = _.find(this.gameType, { value: String(value) })
          return t ? t.label : value.toString()
        }
      },
      {
        label: 'api名称',
        prop: 'show_name'
      }
    ]
  }

  mounted() {
    this.requestTable()
  }

  requestTable() {
    this.isLoading = true

    api
      .getHotSetting({ game_type: this.tabPosition })
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

  onDialogSaveClick() {
    this.isSaveLoading = true
    let data: any = {}
    data.list = []
    let sortIf: boolean = true
    if (this.tableData.length > 0) {
      data.game_type = this.tabPosition
      this.tableData.map((item: any) => {
        if (!/^[1-9][0-9]*$/.test(item.sort) || item.sort > 99) {
          sortIf = false
          this.isSaveLoading = false
          this.$message.error('排序号为正整数且首位数字不为0并且不大于99')
        }
        data.list.push({
          id: item.id,
          is_hot: item.is_hot,
          sort: item.sort
        })
      })
    }

    if (sortIf) {
      api
        .postHotSetting(data)
        .then((response: any) => {
          if (response.code === 0) {
            this.$message.success('保存成功！')
            this.requestTable()
            this.isSaveLoading = false
          } else {
            this.isSaveLoading = false
            this.$message.error(response.msg)
          }
        })
        .catch(error => {})
    }
  }

  handleClick(tab, event) {
    this.requestTable()
  }

  change(val) {
    if (!/^[1-9][0-9]*$/.test(val) || val > 99) {
      this.$message.error('排序号为正整数且首位数字不为0且排序号不大于99')
    }
  }

  changeHot(row) {
    let data: any = {}
    data.game_type = this.tabPosition
    data.list = [{ id: row.id, is_hot: row.is_hot, sort: row.sort }]
    api
      .postHotSetting(data)
      .then((response: any) => {
        if (response.code === 0) {
          this.requestTable()
        } else {
          row.is_hot = !row.is_hot
          this.$message.error(response.msg)
        }
      })
      .catch(error => {})
  }
}
</script>
