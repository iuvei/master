<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Form } from 'element-ui'

@Component
export default class AddMainhallStep2 extends Vue {
  @Prop({ default: () => ({}) })
  data!: any
  @Prop({ default: false })
  disabled!: boolean
  $refs!: {
    form: Form
  }
  formData: any = {
    domains: this.data.domains && this.data.domains.length ? [...this.data.domains] : [''],
    is_use_googlekey: typeof this.data.is_use_googlekey === 'boolean' ? this.data.is_use_googlekey : false,
    status: typeof this.data.status === 'number' ? this.data.status : 1
  }
  domainRule: any[] = [{ required: true, message: '域名不能为空！', trigger: ['blur', 'change'] }, { validator: this.validDomain, trigger: ['blur', 'change'] }]
  toNext(callback) {
    this.$refs.form.validate(valid => {
      valid && callback(this.formData)
    })
  }
  mounted() {
    this.$on('toNext', this.toNext)
  }
  addDomain() {
    this.formData.domains = Array.from({ length: this.formData.domains.length + 1 }, (d, i) => this.formData.domains[i] || '')
  }
  deleteDomain(index) {
    this.formData.domains = this.formData.domains.filter((v, i) => i !== index)
  }
  validDomain(rule, value, callback) {
    if (/^[\d\w-_]*\.[\d\w-_]*$/.test(value)) {
      callback()
    } else {
      callback(new Error('域名格式不正确！'))
    }
  }
}
</script>