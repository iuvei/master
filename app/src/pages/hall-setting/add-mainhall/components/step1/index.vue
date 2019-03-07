<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {Form} from 'element-ui'

@Component
export default class AddMainhallStep1 extends Vue {
  @Prop(Array) emergencyContacts!: string[]
  @Prop({default:()=> ({})}) data!: any
  @Prop({default: false}) disabled!: boolean
  $refs!: {
    form: Form
  }
  formData: any = {
    company_name: this.data.company_name || '',
    admin_name: this.data.admin_name || '',
    emergency: this.data.emergency || this.emergencyContacts[0] || '',
    emergency_code: this.data.emergency_code || '',
    mobile: this.data.mobile || '',
    wechat: this.data.wechat || '',
    skype: this.data.skype || '',
    email: this.data.email || '',
    remark: this.data.remark || ''
  }
  formRules = {
    company_name: [
      { required: true, message: '厅主名称不能为空！', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] }
    ],
    admin_name: [
      { required: true, message: '厅主登录账号不能为空！', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] }
    ],
    emergency: [
      { required: true, message: '请选择紧急联系方式！', trigger: 'blur' },
      { min: 1, max: 50, message: '长度不超过50个字符', trigger: 'blur' }
    ],
    emergency_code: [
      { required: true, message: '紧急联系号码不能为空！', trigger: ['blur', 'change'] },
      { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] }
    ],
    mobile: [ { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] } ],
    wechat: [ { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] } ],
    skype: [ { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] } ],
    email: [
      { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] },
      { validator: this.validateOfEmail, trigger: ['blur', 'change'] }
    ],
    remark: [ { min: 1, max: 50, message: '长度不超过50个字符', trigger: ['blur', 'change'] } ]
  }
  toNext(callback) {
    this.$refs.form.validate(valid=> {
      valid && callback(this.formData)
    })
  }
  mounted() {
    this.$on('toNext', this.toNext)
  }
  @Watch('emergencyContacts')
  updateEmergencyContacts() {
    if(!this.formData.emergency) {
      this.formData.emergency = this.emergencyContacts[0] || ''
    }
  }
  /** 表单验证： 邮箱 */
  validateOfEmail(rule, value, callback) {
    if(value === '' || /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
      callback()
    } else {
      callback(new Error('邮箱格式不正确！'))
    }
  }
}
</script>