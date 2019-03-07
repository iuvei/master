/**
 * 封装全局帮助接口函数
 *
 * @author : zhenda.li
 */

import Vue from 'vue'
import { toPairs, find, keys, cloneDeep } from 'lodash'
import api from '@/api'

/** 是否是调试模式 */
const isDebug = process.env.NODE_ENV !== 'production'

/** 拓展 Vue 原型方法 */

/** 增加打印方法，调试用，生成环境无效 */
Vue.prototype.$log = (message?: any, ...optionalParams: any[]) => {
  if (isDebug) console.log(message, ...optionalParams)
}

/** 增加 EventBus 对象，可全局派发事件通信，事件名需在 enums 中的 EventType 中统一定义 */
Vue.prototype.$event = new Vue()

/**
 * 验证当前页面按钮的权限，控制显示和隐藏
 * @param routes 登录成功后，返回的路由权限信息，从 User Model 里直接获取
 * @param url 当前页面的路由，例如 '/agent-management'
 * @param pageButtons 当前路由下，受权限控制的所有按钮的 id,此 id 于后端约定的名称保持一致
 * @returns object 根据 pageButtons 传入的 id 数组，返回对象，key 为 id ，value 为 bool，true 显示按钮，false 隐藏按钮
 */
Vue.prototype.$unauthorizedBtns = (routes: { [key: string]: any }[] = [], url: string = '', pageButtons: { [key: string]: number } = {}): Promise<any> => {
  const subLevelChildren: any = []
  const unauthorizedBtnDic = [{}, ...keys(pageButtons)].reduce((p, c) => ({ ...p, [c as string]: false }))

  routes.map(route => {
    route.children && route.children.length && route.children.map(subChild => subLevelChildren.push(subChild))
  })

  const onePage = subLevelChildren.find(sub => sub.url === url) || {}

  return api.getAccessList({ menu_id: onePage.id }).then((res: any) => {
    if (res.code === 0) {
      toPairs(pageButtons).map(([key, id], index) => {
        const btn: any = find(res.data || [], { id })
        if (btn && btn.children) {
          unauthorizedBtnDic[key] = getCollectionOfPermissions(btn.children)
        } else {
          unauthorizedBtnDic[key] = !!btn
        }
      })
    }
    return unauthorizedBtnDic
  })
}
/** 递归：用于计算该路由下的所有子页面的权限 */
function getCollectionOfPermissions(permissions) {
  let collection: any = {}
  permissions.map(permission => {
    collection[permission.id] = permission.children && permission.children.length ? getCollectionOfPermissions(permission.children) : true
  })
  return collection
}

/** 拓展 Date 原型方法 */

/**
 * 对 Date 的扩展，将 Date 转化为指定格式的 String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *
 * e.g : (new Date()).format("yyyy-MM-dd hh:mm:ss.S") => 2006-07-02 08:09:04.423
 *       (new Date()).format("yyyy-M-d h:m:s.S")      => 2006-7-2 8:9:4.18
 *
 *  @param fmt 格式化公式
 */
Date.prototype.format = function(fmt: string): string {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  }
  return fmt
}

/**
 * 对 Date 的扩展，获取今天的日期，格式为 2018-01-01
 */
Date.prototype.getToday = function(): string {
  return this.format('yyyy-MM-dd')
}

/** 金额格式化，添加千分位 */
Vue.prototype.$toThousands = num => {
  if (/^[-]?[0-9]+(.[0-9]*)?$/.test(num)) {
    const sample: string = Math.abs(num).toFixed(2),
      negative = num < 0
    let split_sample: string[] = sample.split('.'),
      result = ''
    while (split_sample[0].length > 3) {
      result = ',' + split_sample[0].slice(-3) + result
      split_sample[0] = split_sample[0].slice(0, split_sample[0].length - 3)
    }
    if (split_sample[0]) {
      result = split_sample[0] + result
    }
    split_sample[0] = result
    return `${negative ? '-' : ''}${split_sample.join('.')}`
  } else {
    return '0.00'
  }
}

/** 删除对象中不需要的字段，并返回一个新对象 */
Vue.prototype.$deleteKeys = function(obj: Object, keys: string[]): Object {
  const newObj = cloneDeep(obj)
  keys.map(key => delete newObj[key])
  return newObj
}

/** 深拷贝 */
Vue.prototype.$deepCopy = function(value: any): any {
  return cloneDeep(value)
}
