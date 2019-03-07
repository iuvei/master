/**
 * 项目全部 API 接口定义，每个接口需要描述清楚作用，方便查找
 *
 * @author : zhenda.li
 */

import http from '@/utils/http'

export default {
  /**
   * 登录
   * @param params 请求参数
   */
  login(params: any) {
    return http.post('/auth/login', params)
  },

  /**
   * 登出
   */
  logout() {
    return http.post('/auth/logout')
  },

  /**
   * 修改密码
   * @param params 请求参数
   */
  changePassword(params: any) {
    return http.put('/account/password', params)
  },

  /**
   * 获取时区
   */
  timezone() {
    return http.get('/timezone')
  },

  /**
   * 获取支付列表
   * @param params 请求参数
   */
  payList(params: any) {
    return http.get('/pay/list', params)
  },

  /**
   * 编辑支付渠道设置
   * @param params 请求参数
   */
  putPayInfo(params: any) {
    return http.put('/pay/info', params)
  },

  /**
   * 获取全部支付渠道列表
   * @param params 请求参数
   */
  payChannel(params?: any) {
    return http.get('/pay/channel', params)
  },

  /**
   * 新增支付
   * @param params 请求参数
   */
  postPayInfo(params: any) {
    return http.post('/pay/info', params)
  },

  /**
   * 编辑支付
   * @param params 请求参数
   */
  editPay(params: any) {
    return http.put('/pay/info', params)
  },

  /**
   * 获取客户列表
   * @param params 请求参数
   */
  hallList(params: any) {
    return http.get('/hall/list', params)
  },

  /**
   * 设置厅主的开厅时间
   * @param params 请求参数
   */
  editHallStartTime(params?: any) {
    return http.put('/hall/start-time', params)
  },

  /**
   * 获取M令牌信息
   * @param params 请求参数
   */
  mtoken(params?: any) {
    return http.get('/hall/mtoken', params)
  },

  /**
   * 修改M令牌信息
   * @param params 请求参数
   */
  editMtoken(params: any) {
    return http.put('/hall/mtoken', params)
  },

  /**
   * 修改厅主状态
   * @param params 请求参数
   */
  changeHallStatus(params: any) {
    return http.put('/hall/status', params)
  },

  /**
   * 修改厅主密码
   * @param params 请求参数
   */
  editHallPassword(params: any) {
    return http.put('/hall/admin-password', params)
  },

  /**
   * 获取游戏列表
   * @param params 请求参数
   */
  hallGames(params?: any) {
    return http.get('/hall/game', params)
  },

  /**
   * 获取游戏列表
   * @param params 请求参数
   */
  editHallGames(params?: any) {
    return http.put('/hall/game', params)
  },

  /**
   *  系统管理 - 角色管理页 新增时获取权限列表
   * @param params 请求参数
   */
  roleAuth(params?: any) {
    return http.get('/role/auth_list', params)
  },

  /**
   *  系统管理 - 角色管理页 新增角色 | 编辑角色
   * @param params 请求参数
   */
  editRoleAuth(params?: any) {
    return http.put('/role/edit_role_auth', params)
  },

  /**
   *  系统管理 - 角色管理页 删除角色
   * @param params 请求参数
   */
  deleteRoleAuth(params?: any) {
    return http.delete('/role/del_role', params)
  },

  /** 获取路由下所有的按钮权限 */
  getAccessList(params?: any) {
    return http.get('/access/access_list', params)
  },

  /**
   *  系统管理 - 角色管理页 角色列表
   * @param params 请求参数
   */
  roleList(params: any) {
    return http.get('/role/role_list', params)
  },
  /**
   *  系统管理 - 厅主日志
   * @param params 请求参数
   */
  logAdmin(params?: any) {
    return http.get('/log/admin', params)
  },
  /**
   *  系统管理 - 代理日志
   * @param params 请求参数
   */
  logAgent(params?: any) {
    return http.get('/log/agent', params)
  },

  /**
   *  系统管理 - 总后台日志
   * @param params 请求参数
   */
  logMaster(params?: any) {
    return http.get('/log/master', params)
  },

  // 三级联动的菜单
  logSelect(params?: any) {
    return http.get('/log/select', params)
  },

  // 三级联动的菜单
  logSelectList(params?: any) {
    return http.get('/log/select_list', params)
  },
  /**
   *  系统管理 - 会员日志
   * @param params 请求参数
   */
  logUser(params?: any) {
    return http.get('/log/user', params)
  },

  /**
   *  系统管理 - 会员和代理日志的操作类型的数据
   * @param params 请求参数
   */
  logType(params?: any) {
    return http.get('/log/type', params)
  },

  /** [get] 全网维护中心*/
  getMaintainList(params?: any) {
    return http.get('/maintain/list', params)
  },

  /** [put] 全网维护中心
   *     修改维护开关
   */
  editMaintainOff(params?: any) {
    return http.put('/maintain/switch', params)
  },

  /** [put] 全网维护中心
   *     修改维护起止时间
   */
  editMaintainTime(params?: any) {
    return http.put('/maintain/time', params)
  },

  /** [put] 全网维护中心
   *     获取厅主帐号
   */
  getUsernameList() {
    return http.get('/hall/name_list')
  },

  /* [公告消息]
   *    * 发送人
   */
  noticeAcceptList(params?: any) {
    return http.get('/notice/search', params)
  },

  /* [获取公告消息]
   * @param params 请求参数
   */
  getNoticeList(params?: any) {
    return http.get('/notice/search_list', params)
  },

  /* [获取公告消息]
   * @param params 请求参数
   */
  getNoticeName(params?: any) {
    return http.get('/hall/name', params)
  },

  /**
   * [新增] 公告消息
   * @param params 请求参数
   */
  addNotice(params?: any) {
    return http.post('/notice', params)
  },

  /**
   * [删除] 公告消息
   * @param params 请求参数
   */
  deleteNotice(params?: any) {
    return http.post('/notice/revert', params)
  },
  /**
   * [查看] 消息状态
   * @param params 请求参数
   */
  messageNotice(params?: any) {
    return http.get('/notice/sum', params)
  },

  /** 厅主管理 - 新增厅主 */
  postHall(params) {
    return http.post('/hall', params)
  },

  /** 厅主管理 - 获取紧急联系方式列表 */
  getEmergencyList() {
    return http.get('/emergency_list')
  },

  /**厅主管理-厅主管理
   * [get] 获取厅主
   */
  getMainhallUsernameList(params?: any) {
    return http.get('/hall/search', params)
  },

  /**厅主管理-厅主管理
   * [get] 紧急联系方式
   */
  getMainhallEmergencyList(params?: any) {
    return http.get('/emergency_list', params)
  },

  /**厅主管理-厅主管理
   * [get] 表格数据
   */
  getMainhallList(params?: any) {
    return http.get('/hall/list', params)
  },

  /**厅主管理-厅主管理
   * [修改] 运营时间
   */
  editMainhallTime(params?: any) {
    return http.put('/hall/start_time', params)
  },

  /**厅主管理-厅主管理
   * [修改] google验证
   */
  editGoogleValid(params?: any) {
    return http.put('/google_switch', params)
  },

  /**厅主管理-厅主管理
   * [get] 游戏开关
   */
  getGameOffList(params?: any) {
    return http.get('/game_switch', params)
  },
  /**厅主管理-厅主管理
   * [get] 游戏列表
   */
  gamesList(params?: any) {
    return http.get('/game_switch_list', params)
  },

  /**厅主管理-厅主管理
   * [set] 游戏开关
   */
  setGameOff(params?: any) {
    return http.put('/game_switch', params)
  },

  /**厅主管理-厅主管理
   * [get] 资料
   */
  getInformationList(params?: any) {
    return http.get('/hall_info', params)
  },

  /**厅主管理-厅主管理
   * [set] 资料
   */
  setInformation(params?: any) {
    return http.put('/hall_info', params)
  },

  /**厅主管理
   * [set] 状态
   */
  setBaseStatus(params?: any) {
    return http.put('/hallsetting/status', params)
  },

  /**厅主管理-基础设置
   * [get] 开启短信通道
   */
  getBaseSms(params?: any) {
    return http.get('/hallsetting/sms', params)
  },

  /**厅主管理-基础设置
   * [set] 开启短信通道
   */
  setBaseSms(params?: any) {
    return http.put('/hallsetting/sms', params)
  },

  /**厅主管理-基础设置
   * [set] 修改密码
   */
  setBasePassword(params?: any) {
    return http.put('/hallsetting/password', params)
  },

  /**厅主管理-费用设置
   * [get] 包底费用
   */
  getBaseCost(params?: any) {
    return http.get('/costsetting/monthly', params)
  },

  /**厅主管理-费用设置
   * [set] 包底费用
   */
  setBaseCost(params?: any) {
    return http.put('/costsetting/monthly', params)
  },

  /**厅主管理-基础设置
   * [get] 谷歌账号管理
   */
  getGoogleUser(params?: any) {
    return http.get('/google/list', params)
  },

  /**厅主管理-基础设置-谷歌账号管理
   * [set] 解绑
   */
  setBaseGoogleUnbind(params?: any) {
    return http.put('/google/status', params)
  },

  /**
   * 导航栏设置
   */
  getNavigation(params?: any) {
    return http.get('/menu/list', params)
  },
  /**
   * 导航栏设置 获取游戏大类和小类
   */
  gameNavigation(params?: any) {
    return http.get('/menu/list/gameapi', params)
  },
  /**新增一级导航 （PC端和PC端电子导航栏） */
  addNavigation(params?: any) {
    return http.put('/menu/list/add', params)
  },
  /**新增一级导航 （PC端和PC端电子导航栏） */
  pcNavigation(params?: any) {
    return http.put('/menu/list/pcmenu', params)
  },
  /**编辑一级导航 （获该一级导航下的二级导航） */
  setApiInfo(params?: any) {
    return http.get('/menu/list/setapiinfo', params)
  },

  /**编辑一级导航 （PC端和PC端电子导航栏） */
  editNavigation(params?: any) {
    return http.put('/menu/list/editmenu', params)
  },
  /**删除一级导航 （PC端和PC端电子导航栏） */
  deleteNavigation(params?: any) {
    return http.delete('/menu/list/remove', params)
  },
  /**保存排序 前端是否显示 */
  settingNavigation(params?: any) {
    return http.put('/menu/list/setting', params)
  },
  /**厅主管理
   * 导航栏设置 保存
   */
  saveNavigation(params?: any) {
    return http.put('/menu/list/setapi', params)
  },
  /**
   * 获取游戏管理列表
   * @param params 请求参数
   */
  getGamePartner(params?: any) {
    return http.get('/game/partner_config', params)
  },
  /**
   * 更新游戏管理列表
   * @param params 请求参数
   */
  postGamePartner(params?: any) {
    return http.post('/game/partner_config', params)
  },
  /**
   * 获取游戏类型列表
   * @param params 请求参数
   */
  getGameType(params?: any) {
    return http.get('/game/partner/list', params)
  },
  /**
   * 获取游戏类型列表
   * @param params 请求参数
   */
  getGamehallpartner(params?: any) {
    return http.get('/game/hall_partner', params)
  },
  /**
   * 获取游戏配置列表
   * @param params 请求参数
   */
  getGameConfig(params?: any) {
    return http.get('/game/partner/setting', params)
  },
  /**
   * 更新游戏配置列表
   * @param params 请求参数
   */
  postGameConfig(params?: any) {
    return http.post('/game/partner/setting', params)
  },
  /**
   * 收入款汇总 - 查询
   */
  cashTradeBalance2(params: any) {
    return http.get('/cash/transfer', params)
  },
  /**
   * 获取热门API配置
   */
  getHotSetting(params: any) {
    return http.get('/game/hot_setting/list', params)
  },
  /**
   * 修改热门API配置
   */
  postHotSetting(params: any) {
    return http.post('/game/hot_setting', params)
  },
  /**
   * 获取推荐游戏列表
   */
  getGameLabel(params: any) {
    return http.get('/game/recommend', params)
  },
  /**
   * 获取游戏合作方
   */
  getApiList() {
    return http.get('/game/partner_config')
  },
  /**
   * 添加推荐游戏
   */
  putApiList(params: any) {
    return http.put('/game/recommend', params)
  },
  /**
   * 修改推荐游戏
   */
  postrecommend(params: any) {
    return http.post('/game/recommend', params)
  },
  /**
   * 游戏合作方
   */
  delectGameLabel(params: any) {
    return http.delete('/game/recommend', params)
  },
  /**
   * 收入款汇总 - 查询
   */
  getHallList() {
    return http.get('/cash/hall_list')
  },
  /** 账号设置 - 查询列表 */
  getAdminList(params: any) {
    return http.get('/admin/admin_list', params)
  },
  /** 账号设置 - 新增账号 */
  putAdmin(params: any) {
    return http.put('/admin/admin', params)
  },
  /** 账号设置 - 编辑账号 */
  patchAdmin(params: any) {
    return http.patch('/admin/admin', params)
  },
  /** 账号设置 - 删除账号 */
  deleteAdmin(params: any) {
    return http.delete('/admin/admin', params)
  },
  /**
   * 注单查询-获取第三方游戏列表
   *
   */
  partnerList() {
    return http.get('/game/partner_list')
  },
  /**
   * 注单查询-获取第三方注单列表
   *  @param type 注单类型
   */
  partnerOrderList(type: string, params?: any) {
    return http.get(`/order/${type}`, params)
  },
  /**注单查询-游戏数据补单 */
  repairList() {
    return http.get('/order/partner_list')
  },
  repair(params: any) {
    return http.post('/order/repair', params)
  },
  repairRecord(params: any) {
    return http.get('/order/repair', params)
  },
  /** 财务报表 - 总报表 - 查询列表 */
  getStateAll(params: any) {
    return http.get('/state/all', params)
  },
  /** 财务报表 - 总报表 - 获取所有厅主信息 */
  getCashHallList() {
    return http.get('/cash/hall_list')
  },
  /** 财务报表 - 游戏报表 - 获取所有游戏信息 */
  getHallGameType() {
    return http.get('/game/type')
  },
  /** 财务报表 - 游戏报表 - 查询列表 */
  getStateGame(params: any) {
    return http.get('/state/game', params)
  },
  /** 财务报表 - 未完成报表 - 查询列表 */
  getStateUnsettle(params: any) {
    return http.get('/state/game/unsettle', params)
  },
  /**
   * 财务报表 - 红包小费查询
   */
  tipsList(params?: any) {
    return http.get('/cash/tips', params)
  },
  /**
   * 财务报表 - 游戏列表
   */
  tipsGameList() {
    return http.get('/cash/game_list')
  },
  /**
   * 获取游戏列表
   */
  getGameList(params: any) {
    return http.get('/games', params)
  },
  /**
   * 获取游戏标签
   */
  getTagList(params: any) {
    return http.get('/game/tags', params)
  },
  /**
   * 编辑游戏标签
   */
  postTagList(params: any) {
    return http.post('/game/tag', params)
  },
  /**
   * 删除游戏标签
   */
  delectTagList(params: any) {
    return http.delete('/game/tag', params)
  },
  /**
   * 增加游戏标签
   */
  putTagList(params: any) {
    return http.put('/game/tag', params)
  },
  /**
   * 编辑游戏的属性
   */
  postGameLabel(params: any) {
    return http.post('/game', params)
  },
  /**
   * 编辑游戏的标签
   */
  postGametag(params: any) {
    return http.post('/game_tag', params)
  },
  /**
   * 获取API活动列表
   */
  getActive(params: any) {
    return http.get('/game/active', params)
  },
  /**
   * 获取API活动类型
   */
  getActiveType() {
    return http.get('/game/active/type')
  },
  /**
   * 修改活动状态
   */
  patchActive(params: any) {
    return http.patch('/game/active', params)
  },
  /**
   * 删除活动
   */
  deleteActive(params: any) {
    return http.delete('/game/active', params)
  },
  /**
   * 新增活动
   */
  putActive(params: any) {
    return http.put('/game/active/add', params)
  },
  /**
   * 修改活动
   */
  postActive(params: any) {
    return http.post('/game/active', params)
  },
  /** 厅主管理-域名管理-厅主名称列表 */
  domainHallNameList() {
    return http.get('/hall/name_list')
  },
  /** 厅主管理-域名管理-域名管理列表 */
  domainManagementList(params: any) {
    return http.get('/domain/list', params)
  },
  /** 厅主管理-域名管理-添加域名 */
  addDomain(params: any) {
    return http.post('/domain', params)
  },
  /** 厅主管理-域名管理-域名停用/启用 */
  domainStatus(params: any) {
    return http.put('/domain/status', params)
  },
  /** 厅主管理-域名管理-域名编辑 */
  domainEdit(params: any) {
    return http.put('/domain', params)
  },
  /** 游戏管理-维护时间设置 */
  setGameMaintain(params: any) {
    return http.put('/game/Maintain_time', params)
  },
  /** 获取厅主名称id */
  getTransfer(params: any) {
    return http.get('/transfer', params)
  },
  /** 总后台日志详情的接口*/
  logMasterInfo(params: any) {
    return http.get('/log/master_info', params)
  },
  /** 总后台日志详情的接口*/
  logAdminInfo(params: any) {
    return http.get('/log/admin_info', params)
  },
  /** 转账记录  补单检测*/
  getTransferSupplement(params: any) {
    return http.post('/transfer/getTransferSupplement', params)
  },
  /** 转账记录  处理转账*/
  transferHandle(params: any) {
    return http.post('/transfer/handle', params)
  },
  /** 转账记录  - 获取所有钱包信息 */
  getWalletList() {
    return http.get('/transfer/walletList')
  },
  /** 转账记录  - 获取所有钱包信息 */
  getTransferStatus() {
    return http.get('/transfer/status')
  },
  /** 获取预警转账订单消息 */
  getTransferExceptionNum() {
    return http.get('/transfer/exceptionNum')
  },
  /** 提交导出请求 */
  exportingReport(params: any) {
    return http.put('/export/log', params)
  },
  /** 获取可导出的模块 */
  availableExportModule() {
    return http.get('/export/module')
  },
  /** 获取导出记录 */
  exportHistory(params: any) {
    return http.get('/export/log', params)
  },
  /** 该接口用于生成关于下载操作的后台日志 */
  backgroundExportingLog(params: any) {
    return http.post('/export/log', params)
  },
  /** 电子/棋牌游戏管理->获取列表 */
  chessGameList(params: any) {
    return http.get('/game/chess_game_list', params)
  },
  /** 电子/棋牌游戏管理->获取API */
  gameApi(params: any) {
    return http.patch('/game/game_api', params)
  },
  /** 电子/棋牌游戏管理->新增游戏 */
  addGame(params: any) {
    return http.post('/game/add_game', params)
  },
  /** 电子/棋牌游戏管理->新增游戏 */
  editGame(params: any) {
    return http.put('/game/add_game', params)
  },
  /** 电子/棋牌游戏管理->删除游戏 */
  deleteGame(params: any) {
    return http.delete('/game/del_game', params)
  }
}
