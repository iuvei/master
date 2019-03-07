<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import api from '@/api'
@Component({
  components: {}
})
export default class BaseSetting extends Vue {
  @Prop() data!: any
  @Prop() unauthorizedBtnDic!: boolean
  dialogVisible: boolean = false
  activeName: string = 'hall'
  form: any = {
    status: '',
    checkList: [],
    company_name: '',
    sms_id: '',
    config: {}
  }
  formPassword: any = {
    password_one: '',
    password_two: ''
  }
  smsList: any = []
  googleData: any = []
  $refs!: {
    form
    formPassword
  }
  get disabled() {
    return this.unauthorizedBtnDic
  }
  submit() {
    switch (this.activeName) {
      case 'hall':
        this.saveHall()
        break
      case 'password':
        this.changePassword()
        break
      case 'sms':
        this.saveSms()
        break
      case 'google':
        this.dialogVisible = false
        break
    }
  }
  // 厅状态设置
  saveHall() {
    const { status, checkList } = this.form
    if (status === 2 && checkList.length === 0) {
      this.$message.error('请选择您要冻结的终端')
      return
    } else {
      let params = {
        hall_id: this.data.id,
        hall_status: status
      }
      if (status === 2 && checkList.includes('admin')) params = Object.assign({ admin_status: 1 }, params)
      if (status === 2 && checkList.includes('user')) params = Object.assign({ user_status: 1 }, params)
      api.setBaseStatus(params).then((res: any) => {
        if (res.code === 0) {
          this.$message.success('厅状态设置成功！')
          this.dialogVisible = false
          const parent: any = this.$parent
          parent && parent.requestTable()
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
  // 修改密码
  changePassword() {
    this.$refs.formPassword.validate(valid => {
      if (valid) {
        let params = {
          hall_id: this.data.id,
          ...this.formPassword
        }
        api.setBasePassword(params).then((res: any) => {
          if (res.code === 0) {
            this.$message.success('密码修改成功！')
            this.formPassword = {
              password_one: '',
              password_two: ''
            }
            this.dialogVisible = false
            const parent: any = this.$parent
            parent && parent.requestTable()
          } else {
            this.$message.error(res.msg)
          }
        })
      } else {
        return false
      }
    })
  }
  // 短信通道保存
  saveSms() {
    const { sms_id, config } = this.form
    let params = {
      hall_id: this.data.id,
      sms_id,
      config
    }
    api.setBaseSms(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('保存成功！')
        this.dialogVisible = false
        const parent: any = this.$parent
        parent && parent.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  // 显示弹框并初始化数据
  show() {
    this.dialogVisible = true
    this.activeName = 'hall'
    for (let k in this.form) {
      if (k === 'checkList') {
        this.form[k] = []
        if (this.data.status === 2 && this.data.is_admin_freeze) this.form[k].push('admin')
        if (this.data.status === 2 && this.data.is_user_freeze) this.form[k].push('user')
      } else {
        this.form[k] = this.data[k]
      }
    }
    this.requestGetBaseSms({ hall_id: this.data.id })
    this.requestGetGoogleUser()
  }
  handleClick() {
    this.$nextTick(() => this.$refs.form.clearValidate(() => {}))
  }
  changeSms(value) {
    let checked = this.smsList.filter(v => v.sms_id === value)
    this.form.config = checked.length > 0 ? checked[0].config : {}
  }
  /**[set] 基础设置-短信平台 */
  requestGetBaseSms(params) {
    api.getBaseSms(params).then((res: any) => {
      if (res.code === 0 && res.data && res.data.length > 0) {
        this.smsList = res.data
        let checked = this.smsList.filter(v => v.status === 1)
        this.form.sms_id = checked.length > 0 ? checked[0].sms_id : res.data[0].sms_id
        this.form.config = checked.length > 0 ? checked[0].config : res.data[0].config
      } else {
        this.$message.error(res.msg)
        this.smsList = []
        this.form.sms_id = ''
        this.form.config = {}
      }
    })
  }
  /**[get] 基础设置-google账号管理 */
  requestGetGoogleUser() {
    let params = {
      hall_id: this.data.id
    }
    api.getGoogleUser(params).then((res: any) => {
      if (res.code === 0 && res.data && res.data.length > 0) {
        this.googleData = res.data
      } else {
        this.googleData = []
      }
    })
  }
  /** 谷歌账号解绑 */
  unBind(row) {
    const { user_id } = row
    api.setBaseGoogleUnbind({ user_id }).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('保存成功！')
        this.requestGetGoogleUser()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /** 密码验证 */
  validatorPassword(rule, value, callback) {
    if (!/^(?:\d+|[a-zA-Z]){6,16}$/.test(value) && value) {
      callback(new Error('密码长度6-16位字母或数字组成'))
    } else {
      callback()
    }
  }
  /** 重复密码验证 */
  validatorPasswordTwo(rule, value, callback) {
    if (!/^(?:\d+|[a-zA-Z]){6,16}$/.test(value) && value) {
      callback(new Error('密码长度6-16位字母或数字组成'))
    } else if (value !== this.formPassword.password_one) {
      callback(new Error('两次密码不一致'))
    } else {
      callback()
    }
  }
}
</script>
