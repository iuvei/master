<template lang="pug" src="./index.pug"></template> <style src="./index.styl"></style>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import api from '@/api'
import _ from 'lodash'
import DayPicker from '@/components/day-picker/index.vue'
import datetimePicker from '@/components/datetime-picker/index.vue'
import { namespace, State } from 'vuex-class'
const USER = namespace('user')
import ExportMixin from '@/mixins/export-mixin.tsx'

@Component({
  components: {
    DayPicker,
    datetimePicker
  }
})
export default class extends Mixins(ExportMixin) {
  @State timeZone
  @USER.State btnAuth
  $refs!: {
    dayPicker: any
  }
  activeName = 'repair'
  repairListName = 'esport'
  tabsName = [
    {
      label: '第三方游戏数据补单',
      name: 'repair'
    },
    {
      label: '补单记录',
      name: 'record'
    }
  ]
  tabsRepair = [
    {
      label: '电竞',
      value: 'esport'
    },
    {
      label: '视讯',
      value: 'live'
    },
    {
      label: '体育',
      value: 'sport'
    },
    {
      label: '棋牌',
      value: 'card'
    },
    {
      label: '彩票',
      value: 'lottery'
    },
    {
      label: '电游',
      value: 'egame'
    }
  ]
  data: any = []
  tableData: any = []
  dialogVisible = false
  game_name = ''
  game_id = ''
  time_begin = ''
  time_end = ''
  game_type = ''
  form: any = {
    //补单记录相关变量
    recordDate: [],
    date_begin: '',
    date_end: '',
    username: '',
    status: 0
  }
  recordData = []
  recordOptions = [
    {
      label: '全部',
      value: 0
    },
    {
      label: '补单中',
      value: 1
    },
    {
      label: '已完成',
      value: 2
    }
  ]
  statusList: any = [
    {
      label: '已完成',
      value: 2
    },
    {
      label: '补单中',
      value: 1
    }
  ]
  recordTable = [
    {
      label: '游戏平台',
      prop: 'partner_name'
    },
    {
      label: '补单拉取注单数量',
      prop: 'bet_count'
    },
    {
      label: '补单操作时间',
      prop: 'created_at'
    },
    {
      label: '操作人',
      prop: 'creator_name'
    }
  ]

  exportModuleKeyName: string = 'ORDER_REPAIR_LOG'

  get pickerOptions() {
    return {
      disabledDate: time => {
        let curDate = new Date(this.timeZone.value).getTime()
        let start = new Date(curDate - 3600 * 1000 * 24 * 2).getTime()
        return time.getTime() > curDate || time.getTime() < start
      }
    }
  }
  /**
   * 1.编辑显示开关
   * 2.编辑排序
   */
  authorizedButtons = { id_1: 28, id_2: 58 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  unauthorizedBtnDic = { id_1: false }
  created() {
    this.$unauthorizedBtns(this.btnAuth, this.$route.path, this.authorizedButtons).then(data => (this.unauthorizedBtnDic = data))
    this.init()
  }
  init() {
    this.tableData = []
    api.repairList().then((res: any) => {
      if (res.code == 0) {
        let list: any = [] //获取接口的大类
        for (let key in res.data) {
          list.push(key)
        }
        let list2: any = [] //应该显示的大类，去掉不显示的大类
        this.tabsRepair.map((v: any) => {
          list.map((l: any) => {
            if (v.value == l) {
              list2.push(v)
            }
          })
        })
        this.tabsRepair = list2
        for (const key in res.data) {
          res.data[key].filter((v: any) => {
            if (v.begin_time == '' && v.end_time == '') {
              v.date = []
            } else {
              v.date = [v.begin_time, v.end_time]
            }
          })
        }
        this.data = res.data
        this.tableData = res.data[`${this.repairListName}`]
      }
    })
  }
  handleClick(v) {
    if (v.name == 'record') {
      this.onQueryClick()
    }
  }
  repairListClick() {
    this.init()
  }
  /**补单事件 */
  doRepair(v) {
    this.game_name = v.game_name
    this.game_id = v.game_id
    this.time_begin = v.date[0]
    this.time_end = v.date[1]
    this.game_type = v.game_type
    if (new Date(this.time_end).getTime() > this.timeZone.value - 1800 * 1000) {
      this.$message.error('结束时间最大为当前时间前30分钟')
      return
    }
    if (new Date(this.time_begin).getTime() < this.timeZone.value - 24 * 3600 * 1000) {
      this.$message.error('最大查询范围为最近24小时')
      return
    }
    this.dialogVisible = true
  }
  clickRepair() {
    let parmas = {
      time_begin: this.time_begin,
      time_end: this.time_end,
      partner_id: this.game_id,
      game_type: this.game_type
    }
    api.repair(parmas).then((res: any) => {
      if (res.code == 0) {
        this.$message.success('补单成功！')
      } else {
        this.$message.error(res.msg)
      }
    })
    this.init()
    this.dialogVisible = false
  }
  handleClose() {
    this.dialogVisible = false
  }
  /**补单记录相关事件 */

  onQueryClick() {
    let parmas = this.genParams()
    api.repairRecord(parmas).then((res: any) => {
      if (res.code == 0 && res.data) {
        this.recordData = res.data
      }
    })
  }
  onResetClick() {
    this.form.username = ''
    this.form.status = ''
    this.$refs.dayPicker[0].reset()
    this.onQueryClick()
  }

  onDownloadClick() {
    console.log('this.isExporting', this.isExporting)
    if (this.isExporting) return

    const exportConfig = {
      api_params: this.genParams(),
      module_id: this.getModuleId(this.exportModuleKeyName)
    }

    this.isExporting = true
    api
      .exportingReport(exportConfig)
      .then(res => {
        this.isExporting = false
        if (res.code === 0) {
          this.onExportSuccess()
        } else {
          this.$message.error(res.msg)
        }
      })
      .catch(() => (this.isExporting = false))
  }

  genParams() {
    let params: any = {
      date_begin: this.form.recordDate[0],
      date_end: this.form.recordDate[1],
      username: this.form.username,
      status: this.form.status
    }

    /** 过滤空值字段 */
    params = _.pickBy(params, val => val !== '')
    return params
  }
}
</script>
