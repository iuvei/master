<template lang="pug" src="./index.pug"></template>
<style scoped lang="stylus" src="./index.styl"></style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { Mutation, namespace } from 'vuex-class'
import api from '@/api'
import { updatedMenu } from '@/router'

const USER = namespace('user')

@Component
export default class Login extends Vue {
  @USER.Mutation updateToken
  @USER.Mutation updateUsername
  @USER.Mutation updateAuthorizedBtns
  @USER.Mutation updateRoleId

  form = {
    username: localStorage.getItem('username') || '',
    password: ''
  }

  rules = {
    username: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入用户名'
      }
    ],
    password: [
      {
        required: true,
        trigger: 'blur',
        message: '请输入密码'
      },
      {
        min: 6,
        max: 16,
        message: '长度在 6 到 16 个字符',
        trigger: 'blur'
      }
    ]
  }

  isRememberUsername: boolean = true

  isLogining: boolean = false

  $refs!: {
    form: Form
  }

  /** 验证表单 */
  validateForm() {
    this.$refs.form.validate(valid => {
      if (valid) this.requestLogin()
    })
  }

  /** 请求登录 */
  requestLogin() {
    this.isLogining = true

    // 记住用户名，没选中则清空
    if (this.isRememberUsername) {
      localStorage.setItem('username', this.form.username)
    } else {
      localStorage.removeItem('username')
    }

    api
      .login(this.form)
      .then((response: any) => {
        this.isLogining = false
        const { code, data, msg } = response
        if (response.code === 0) {
          const { token, user, menu } = data
          const { username, role } = user
          this.updateToken(token)
          this.updateUsername(username)
          this.updateAuthorizedBtns(menu)
          this.updateRoleId(role)
          updatedMenu()
          this.$router.push('/')
        } else {
          this.$message.error(msg)
        }
      })
      .catch(error => {
        this.isLogining = false
      })
  }

  onLoginClick() {
    this.validateForm()
  }

  /** 用户点击键盘回车 */
  onEnterClick() {
    this.validateForm()
  }
}
</script>
