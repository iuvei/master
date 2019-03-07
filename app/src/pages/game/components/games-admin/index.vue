<template lang="pug" src="./index.pug"></template>

<script lang="tsx">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'
import api from '@/api'
import _ from 'lodash'
import { namespace, State } from 'vuex-class'
import datetimePicker from '@/components/datetime-picker/index.vue'
const USER = namespace('user')

@Component({
  components: {
    datetimePicker
  }
})
export default class GamesAdmin extends Vue {
  @State timeZone
  @USER.State btnAuth
  /**
   * 1.编辑游戏开关
   * 2.编辑维护开关
   */
  authorizedButtons = { id_1: 11, id_2: 12 }
  /** 根据登录时返回的权限信息控制按钮的显示和隐藏 */
  get unauthorizedBtnDic() {
    return _.mapValues(this.authorizedButtons, val => {
      return !!this.permissions[val]
    })
  }
  @Prop(Object) permissions: any
  //筛选框配置
  @Prop({
    default() {
      return 'gameAdmin'
    }
  })
  activeName!: any

  isLoading: Boolean = false
  tableData: Object[] = []
  gameType: Object[] = [
    { label: '全部', value: '' },
    { label: '电子', value: '1' },
    { label: '视讯', value: '2' },
    { label: '体育', value: '3' },
    { label: '电竞', value: '4' },
    { label: '彩票', value: '5' },
    { label: '棋牌', value: '6' }
  ]

  // 弹窗参数
  isDialogVisible: Boolean = false
  isSaveLoading: Boolean = false
  dialog: any = {}
  dialogform: any = {
    visible: false,
    game_type: '',
    partner_id: '',
    partner_name: '',
    maintainingTime: ''
  }
  timer: any

  clearable: Boolean = false

  // 弹窗表单验证
  rules = {
    maintainingTime: [{ required: false, message: '必填字段' }, { validator: this.valueTime }]
  }

  $refs!: {
    dialogForm: Form
  }

  get tableHead() {
    return [
      {
        label: '游戏类型',
        prop: 'game_type',
        minWidth: '140',
        formatter: (row, column, value: number, index): string => {
          let t: any = _.find(this.gameType, { value: String(value) })
          return t ? t.label : value.toString()
        }
      },
      {
        label: 'api名称',
        prop: 'show_name',
        minWidth: '140'
      }
    ]
  }

  mounted() {
    this.requestTable()
    this.timer = setInterval(() => {
      this.requestTable()
    }, 60000)
  }

  beforeDestroy() {
    if (this.timer) window.clearInterval(this.timer)
  }
  requestTable() {
    this.isLoading = true

    api
      .getGamePartner()
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

  change(newVal, row, type) {
    this.dialogform.visible = false
    this.dialog = row
    this.dialog.type = type
    if (type == 'status') {
      if (!row.status) {
        this.dialog.text = '确定打开该游戏吗'
      } else {
        this.dialog.text = '关闭游戏，则所有厅的前端都隐藏该游戏的全部入口，确定关闭吗'
      }
    }
    if (type == 'maintaining') {
      if (!row.maintaining) {
        this.dialog.text = '确定该游戏进行临时维护吗'
      } else {
        this.dialog.text = '确定结束该游戏的临时维护吗'
      }
    }
    if ((this.unauthorizedBtnDic['id_1'] && type == 'status') || (this.unauthorizedBtnDic['id_2'] && type == 'maintaining')) {
      this.isDialogVisible = true
    } else {
      this.$message.error('该功能暂无权限，不能进行操作')
    }
  }

  onDialogSaveClick() {
    this.isSaveLoading = true
    let data: any = {}
    if (this.dialogform.visible) {
      data = JSON.parse(JSON.stringify(this.dialogform))
      data = {
        start_time: this.dialogform.maintainingTime[0] || '',
        end_time: this.dialogform.maintainingTime[1] || '',
        game_type: this.dialogform.game_type,
        partner_id: this.dialogform.partner_id
      }
      api
        .setGameMaintain(data)
        .then((response: any) => {
          if (response.code === 0) {
            this.dialogform = {
              visible: false,
              game_type: '',
              partner_name: '',
              partner_id: '',
              maintainingTime: ''
            }
            this.requestTable()
            this.isSaveLoading = false
            this.isDialogVisible = false
          } else {
            this.isSaveLoading = false
            this.$message.error(response.mag)
          }
        })
        .catch(error => {
          this.isSaveLoading = false
        })
    } else {
      if (this.dialog.type == 'status') {
        data = {
          id: this.dialog.id,
          status: !this.dialog.status
        }
      } else {
        data = {
          id: this.dialog.id,
          maintaining: !this.dialog.maintaining
        }
      }
      api
        .postGamePartner(data)
        .then((response: any) => {
          if (response.code === 0) {
            this.requestTable()
            this.isSaveLoading = false
            this.isDialogVisible = false
          }
        })
        .catch(error => {
          this.isSaveLoading = false
        })
    }
  }

  settime(row) {
    if (!this.unauthorizedBtnDic.id_2) {
      this.$alert('您没有修改权限！')
      return false
    }
    if (row.start_time && row.end_time) {
      this.dialogform.maintainingTime = [row.start_time, row.end_time]
    } else {
      this.dialogform.maintainingTime = []
    }
    this.dialogform.partner_name = this.textFormat(row.partner_name, row.game_type)
    this.dialogform.game_type = row.game_type
    this.dialogform.partner_id = row.partner_id
    this.clearable = !row.maintaining
    this.dialogform.visible = true
    this.isDialogVisible = true
  }

  onResetFields() {
    if (this.dialogform.visible) {
      this.$refs.dialogForm.resetFields()
    }
    this.isDialogVisible = false
  }

  onValidate() {
    if (this.dialogform.visible) {
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          this.onDialogSaveClick()
        }
      })
    } else {
      this.onDialogSaveClick()
    }
  }

  textFormat(value, type) {
    let t: any = _.find(this.gameType, { value: String(type) })
    t = typeof t == 'undefined' ? '' : t.label
    return value + t
  }

  valueTime(rule, value, callback) {
    if (new Date(value[1]).getTime() <= this.timeZone.value) {
      callback(new Error('结束时间需大于当前时间'))
    } else if (new Date(value[0]).getTime() >= new Date(value[1]).getTime()) {
      callback(new Error('开始时间小于结束时间'))
    } else {
      callback()
    }
  }
}
</script>
<style scoped lang="stylus">
.settime
  color #409eff
  cursor pointer
</style>

