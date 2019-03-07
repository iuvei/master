<template lang="pug" src="./index.pug"></template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import api from '@/api'
@Component({
  components: {}
})
export default class BaseInfo extends Vue {
  @Prop() hall_id!: any
  @Prop() unauthorizedBtnDic!: boolean
  dialogVisible: boolean = false
  form: any = {
    company_name: '',
    id: '',
    created_at: '',
    admin_name: '',
    emergency: '',
    user_count: '',
    agent_count: '',
    mobile: '',
    balance: '',
    wechat: '',
    emergency_code: '',
    email: '',
    skype: '',
    remark: ''
  }
  // 紧急联系方式选项
  emergencyList: string[] = []
  get disabled() {
    return this.unauthorizedBtnDic
  }
  get formList() {
    let arr: any = [
      { label: '厅主名称', prop: 'company_name', type: 'text', rules: [] },
      { label: 'ID', prop: 'id', type: 'text', rules: [], disabled: true },
      { label: '建立时间', prop: 'created_at', type: 'text', rules: [], disabled: true },
      { label: '登录帐号', prop: 'admin_name', type: 'text', rules: [], disabled: true },
      { label: '紧急联系方式', prop: 'emergency', type: 'select', rules: [{ required: true, message: '请选择紧急联系方式', trigger: ['blur', 'change'] }] },
      { label: '代理/会员数', prop: '', type: 'group', rules: [], disabled: true },
      { label: '联系电话', prop: 'mobile', type: 'text', rules: [{ required: false, validator: this.validatorMobile }] },
      { label: '站内会员账户余额', prop: 'balance', type: 'text', rules: [], disabled: true },
      { label: '微信', prop: 'wechat', type: 'text', rules: [{ required: false, validator: this.validatorWechat }] },
      {
        label: '紧急联系号码',
        prop: 'emergency_code',
        type: '',
        rules: [
          { required: true, message: '请输入紧急联系号码', trigger: ['blur', 'change'] },
          { validator: this.form.emergency === '手机号' ? this.validatorMobile : '' }
        ]
      },
      { label: '邮箱', prop: 'email', type: 'text', rules: [{ required: false, validator: this.validatorEmail }] },
      { label: 'skype', prop: 'skype', type: 'text', rules: [{ min: 0, max: 50, message: '最多50个字符' }] },
      { label: '备注', prop: 'remark', type: 'textarea', rules: [{ min: 0, max: 140, message: '最多140个字符' }] }
    ]
    return arr
  }
  mounted() {
    this.requestEmergencyList()
  }
  submit() {
    let form: any = this.$refs.form
    form.validate(valid => {
      if (valid) {
        this.requestInformation()
      } else {
        return false
      }
    })
  }
  /**[get] 资料 */
  requestInformationList() {
    let params = {
      hall_id: this.hall_id
    }
    api.getInformationList(params).then((res: any) => {
      if (res.code === 0 && res.data) {
        for (let k in this.form) {
          this.form[k] = res.data[k] || ''
        }
        this.dialogVisible = true
      }
    })
  }
  /**[set] 资料 */
  requestInformation() {
    let params = {
      hall_id: this.hall_id,
      ...this.form
    }
    api.setInformation(params).then((res: any) => {
      if (res.code === 0) {
        this.$message.success('设置资料成功！')
        this.dialogVisible = false
        const parent: any = this.$parent
        parent && parent.requestTable()
      } else {
        this.$message.error(res.msg)
      }
    })
  }
  /**[get] 紧急联系方式列表 */
  requestEmergencyList() {
    api.getMainhallEmergencyList().then((res: any) => {
      if (res.code === 0 && res.data) {
        this.emergencyList = res.data
      } else {
        this.emergencyList = []
      }
    })
  }
  /** 邮箱验证 */
  validatorEmail(rule, value, callback) {
    if (!/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value) && value) {
      callback(new Error('输入正确的邮箱'))
    } else {
      callback()
    }
  }
  /** 手机验证 */
  validatorMobile(rule, value, callback) {
    if (!/^1[3-9][0-9]{9}$/.test(value) && value) {
      callback(new Error('输入正确的手机格式'))
    } else {
      callback()
    }
  }
  /** 微信验证 */
  validatorWechat(rule, value, callback) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,20}$/.test(value) && value) {
      callback(new Error('以字母开头不能超过20个字符'))
    } else {
      callback()
    }
  }
}
</script>
