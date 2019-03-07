export default {
  /**
   * 更新 Token，传空默认清空 token
   */
  updateToken(state: any, token: string | null) {
    state.token = token || ''
    sessionStorage.setItem('token', state.token)
  },

  /**
   * 更新用户名
   */
  updateUsername(state: any, username: string) {
    state.username = username
    sessionStorage.setItem('username', username)
  },

  /**
   * 更新用户权限
   */
  updateAuthorizedBtns(state: any, btnAuth: any) {
    state.btnAuth = btnAuth || []
    sessionStorage.setItem('btnAuth', JSON.stringify(state.btnAuth))
    localStorage.setItem('btnAuth', JSON.stringify(state.btnAuth))
  },

  /**
   * 更新用户权限
   */
  deleteAuthorizedBtns(state: any, btnAuth: any) {
    state.btnAuth = []
    sessionStorage.setItem('btnAuth', '[]')
    localStorage.setItem('btnAuth', '[]')
  },

  /**
   * 更新用户名的角色id
   */
  updateRoleId(state: any, roleId: number) {
    state.roleId = roleId || -2
    localStorage.setItem('roleId', String(roleId))
  }
}
