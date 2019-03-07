<template lang="pug" src="./index.pug"></template>

<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import VueClipboard from 'vue-clipboard2'
import api from '@/api'
import { find } from 'lodash'
import Step1 from './components/step1/index.vue'
import Step2 from './components/step2/index.vue'
import Step3 from './components/step3/index.vue'

Vue.use(VueClipboard)

@Component({
  components: { Step1, Step2, Step3 }
})
export default class AddMainhall extends Vue {
  $refs!: {
    step1: any
    step2: any
    step3: any
  }
  step: number = 1
  stepLen: number = 4
  formData: any = {}
  /** @todo 紧急联系方式，应从后台获取 */
  emergencyContacts: string[] = []
  /** 第三方api */
  partnerTypes: PartnerType[] = [
    { name: '电子', code: 1, isIndeterminate: false, checkAll: true, checks: [], children: [] },
    { name: '视讯', code: 2, isIndeterminate: false, checkAll: true, checks: [], children: [] },
    { name: '体育', code: 3, isIndeterminate: false, checkAll: true, checks: [], children: [] },
    { name: '电竞', code: 4, isIndeterminate: false, checkAll: true, checks: [], children: [] },
    { name: '彩票', code: 5, isIndeterminate: false, checkAll: true, checks: [], children: [] },
    { name: '棋牌', code: 6, isIndeterminate: false, checkAll: true, checks: [], children: [] }
  ]
  loading: boolean = false
  dialogVisible: boolean = false
  /** 成功后的弹窗信息字段 */
  successInfo: any = {
    company_name: '',
    admin_name: '',
    admin_password: '',
    domains: [],
    agent: '',
    agent_password: '',
    shareholder: '',
    shareholder_password: '',
    is_use_googlekey: false,
    status: 1
  }
  mounted() {
    this.getEmergencyList()
    this.getGamePartner()
  }
  /** 上一步 */
  prev() {
    this.step--
  }
  /** 下一步 */
  next() {
    /** 根据步骤到对应的组件进行字段校验，并把组件的表单数据存到父组件的表单数据里，进入下一步 */
    switch (this.step) {
      case 1:
        this.$refs.step1.$emit('toNext', formData => {
          this.saveFormData(formData)
          this.step++
        })
        break
      case 2:
        this.$refs.step2.$emit('toNext', formData => {
          this.saveFormData(formData)
          this.step++
        })
        break
      case 3:
        this.$refs.step3.$emit('toNext', formData => {
          this.saveFormData(formData)
          this.step++
        })
        break
      default:
        this.step++
    }
  }
  /** 获取紧急联系方式 */
  getEmergencyList() {
    api.getEmergencyList().then((res: any) => {
      if (res.code === 0) {
        this.emergencyContacts = res.data || []
      }
    })
  }
  /** 获取所有api */
  getGamePartner() {
    api.getGamePartner().then((res: any) => {
      if (res.code === 0) {
        ;(res.data || []).map(partner => {
          const parent = find(this.partnerTypes, { code: partner.game_type }) as PartnerType
          const { game_type, id, partner_id, partner_name, status, show_name } = partner
          if (status) {
            parent.children.push({ game_type, id, partner_id, partner_name, show_name })
            parent.checks.push(id)
          }
        })
      }
    })
  }
  /** 保存到表单数据 */
  saveFormData(formData) {
    this.formData = {
      ...this.formData,
      ...formData
    }
  }
  /** 提交 */
  submit() {
    if (this.loading) return false
    this.loading = true
    api
      .postHall(this.formData)
      .then((res: any) => {
        this.loading = false
        if (res.code === 0) {
          this.successInfo = {
            company_name: res.data.company_name || '',
            admin_name: res.data.admin_name || '',
            admin_password: res.data.admin_password || '',
            domains: res.data.domains || [],
            agent: res.data.agent || '',
            agent_password: res.data.agent_password || '',
            shareholder: res.data.shareholder || '',
            shareholder_password: res.data.shareholder_password || '',
            is_use_googlekey: this.formData.is_use_googlekey,
            status: this.formData.status
          }
          this.dialogVisible = true
        } else {
          this.$message.error(res.msg || '创建失败，请重新添加or联系开发！')
        }
      })
      .catch(err => {
        this.loading = false
        this.$message.error('创建失败，请重新添加or联系开发！')
      })
  }
  domainsFormat() {
    let arr: any = []
    this.successInfo.domains.map((v: any) => {
      arr = arr.concat([`厅主域名: admin.${v}`, `PC域名: www.${v}`, `H5域名: m.${v}`, `代理域名: agent.${v}`])
    })
    return arr
  }
  /** 复制的文本 */
  get copyText() {
    const text = [
      `厅主名称: ${this.successInfo.company_name || ''}`,
      `后台登录账号: ${this.successInfo.admin_name || ''}`,
      `后台账号密码: ${this.successInfo.admin_password || ''}`,
      this.domainsFormat().join('\n'),
      `默认股东账号: ${this.successInfo.shareholder || ''}`,
      `默认股东账号密码: ${this.successInfo.shareholder_password || ''}`,
      `默认代理账号: ${this.successInfo.agent || ''}`,
      `默认股东代理密码: ${this.successInfo.agent_password || ''}`,
      `谷歌验证码: ${this.successInfo.is_use_googlekey ? '启用' : '停用'}`,
      `厅主状态: ${this.successInfo.status ? '启用' : '停用'}`
    ]
    return text.join('\n')
  }
  onCopySuccess(e) {
    this.$message.success('复制成功！')
  }
  onCopyError(e) {
    this.$message.error('复制失败！')
  }
  /** 新增成功后，跳转到厅主管理 */
  goto() {
    this.$router.push('/mainhall-manage')
  }
}

interface Partner {
  game_type: number
  id: number
  partner_id: number
  partner_name: string
  show_name: string
}
export interface PartnerType {
  name: string
  code: number
  isIndeterminate: boolean
  checkAll: boolean
  checks: number[]
  children: Partner[]
}
</script>
