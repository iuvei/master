<template lang="pug" src="./index.pug"></template> <style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace, Action } from 'vuex-class'
import { Form } from 'element-ui'
import HomeSetting from '@/components/home-setting/index.vue'
import api from '@/api'

const USER = namespace('user')

@Component({
  components: {
    HomeSetting
  }
})
export default class HomeHearder extends Vue {
  @State isMeunCollapse
  @Mutation switchMeunCollapse

  @USER.State username
  @USER.Mutation updateToken
  @USER.Mutation deleteAuthorizedBtns
  @USER.Mutation updateRoleId

  @State timeZone
  @Mutation updateTimeZone
  @Action getTimeZone

  btns = []

  formPassword = {
    oldPassword: '',
    newPassword: '',
    newPassword2: ''
  }
  warningNumber: any = ''
  rulesPassword = {
    oldPassword: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入旧密码'
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 16 个字符',
        trigger: 'blur'
      }
    ],
    newPassword: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入新密码'
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 16 个字符',
        trigger: 'blur'
      }
    ],
    newPassword2: [
      {
        required: true,
        trigger: 'blur',
        validator: this.validatePassword2
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 32 个字符',
        trigger: 'blur'
      }
    ]
  }

  /** 侧边设置是否显示 */
  isSettingVisible: boolean = false

  /** 对话框是否显示 */
  isDialogVisible: boolean = false

  /** 是否正在保存数据中，防止保存按钮多次误点 */
  isSaveLoading: boolean = false

  $refs!: {
    formPassword: Form
    homeSetting: any
  }
  timer: any = null
  timer2: any
  created() {
    this.getTimeZone()
  }
  mounted() {
    /** @todo 设置栏弹出后，点击任意位置关闭设置层，这里没有解注册，待优化 */
    document.body.addEventListener('click', () => {
      this.isSettingVisible = false
    })
    window.addEventListener('resize', this.onWindowSizeChange)
    this.getWarningNumber()
    this.timer2 = setInterval(() => {
      this.getWarningNumber()
    }, 30000)
  }
  @Watch('timeZone.startUp')
  timerStart(newVal, oldVal) {
    // 秒定时器开启，只在请求后状态false->true时触发一次
    if (!oldVal && newVal) {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        const timeZone = { ...this.timeZone, value: this.timeZone.value + 1000 }
        this.updateTimeZone(timeZone)
      }, 1000)
    }
  }
  get dateFormat() {
    const { name, utc, value } = this.timeZone
    return `${name}（${utc}）${new Date(value).format('yyyy-MM-dd hh:mm:ss')}`
  }

  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this.timer2) clearInterval(this.timer2)

    window.removeEventListener('resize', this.onWindowSizeChange)
  }

  /** 监听窗口大小改变回调，自动判断收缩菜单栏 */
  onWindowSizeChange() {
    if (document.body.offsetWidth <= 1200 && !this.isMeunCollapse) {
      this.switchMeunCollapse(true)
    } else if (document.body.offsetWidth > 1200 && this.isMeunCollapse) {
      this.switchMeunCollapse(false)
    }
  }

  requestChangePassword() {
    this.isSaveLoading = true

    let params = {
      old: this.formPassword.oldPassword,
      new: this.formPassword.newPassword
    }

    api
      .changePassword(params)
      .then((response: any) => {
        this.isSaveLoading = false

        if (response.code === 0) {
          this.$message.success('密码修改成功，请重新登录 ！')

          // 清空 store 存储的 token
          this.updateToken()
          this.deleteAuthorizedBtns()
          this.updateRoleId()

          // 跳转登录页
          this.$router.push('/login')
        } else {
          this.$message.error('密码修改失败，请重试 ！')
        }
      })
      .catch(error => {
        this.isSaveLoading = false
        this.$message.error('密码修改失败，请重试 ！')
      })
  }

  requestLogout() {
    api
      .logout()
      .then((response: any) => {
        if (response.code === 0) {
          this.$message.success('退出登录成功 ！')

          // 清空 store 存储的 token
          this.updateToken()
          this.deleteAuthorizedBtns()
          this.updateRoleId()

          // 跳转登录页
          // this.$router.push('/login')
          window.location.href = '/login'
        }
      })
      .catch(error => {})
  }

  onToggleClick() {
    this.switchMeunCollapse(!this.isMeunCollapse)
  }

  onAdminClick(command: string) {
    switch (command) {
      case 'password':
        // 移除表单项的校验结果
        this.$refs.formPassword && this.$refs.formPassword.clearValidate()
        this.formPassword = {
          oldPassword: '',
          newPassword: '',
          newPassword2: ''
        }
        this.isDialogVisible = true
        break
      case 'logout':
        this.$confirm('确定要退出登录吗 ?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.requestLogout()
          })
          .catch(() => {})
        break
    }
  }

  onSettingClick(e: Event) {
    e.stopPropagation()
    this.isSettingVisible = !this.isSettingVisible
  }

  toggleFullScreen() {
    document.webkitFullscreenElement ? document.webkitExitFullscreen() : document.documentElement.webkitRequestFullScreen()
  }

  /** 验证重复输入密码 */
  validatePassword2(rule, value, callback) {
    if (value === '') {
      callback(new Error('请重复输入新密码'))
    } else if (value !== this.formPassword.newPassword) {
      callback(new Error('两次输入密码不一致!'))
    } else {
      callback()
    }
  }

  /** 验证修改密码表单 */
  validateFormPassword() {
    this.$refs.formPassword.validate(valid => {
      if (valid) this.requestChangePassword()
    })
  }

  onDialogSaveClick() {
    this.validateFormPassword()
  }

  /** 用户点击键盘回车 */
  onEnterClick() {
    this.validateFormPassword()
  }

  getWarningNumber() {
    api.getTransferExceptionNum().then((response: any) => {
      if (response.code === 0 && response.data.num) {
        this.warningNumber = response.data.num
        this.requestAudio()
      } else {
        this.warningNumber = ''
      }
    })
  }
  requestAudio() {
    let _dom: any = document.getElementById('transfer')
    if (this.$refs.homeSetting.isSoundEnabled) {
      _dom
        .play()
        .then(() => {
          _dom.onended = () => {}
        })
        .catch(err => {})
    }
  }

  onWarningNumber() {
    if (this.warningNumber) {
      this.$router.push({ path: '/transfer-abnormal' })
    }
  }
}
</script>
