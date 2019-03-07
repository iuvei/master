const state = {
  token: sessionStorage.getItem('token') || '', // 用户 token，保存在 SessionStorage 中，关闭页面后失效
  username: sessionStorage.getItem('username') || '', // 用户名
  btnAuth: JSON.parse(sessionStorage.getItem('btnAuth') as string) || JSON.parse(localStorage.getItem('btnAuth') as string), // 页面内按钮权限
  roleId: Number(localStorage.getItem('roleId')) || -2
}

export default state
