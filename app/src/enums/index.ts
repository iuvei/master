/** HTTP 状态码 */
export const HTTPStatusCode = {
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404
}

/** 状态码为200时，返回的code特殊处理 */
export const ResponseCode = {
  KickLine: 1901009 //踢线
}

/** 错误提示信息 */
export const ErrorMessage = {
  [1000]: '参数错误',
  [1000000]: '用户名或密码错误，请重新输入 ！'
}

/** 排序类型 */
export const OrderType = {
  ascending: 'asc',
  descending: 'desc'
}

/** 全局事件名 */
export const EventType = {}
