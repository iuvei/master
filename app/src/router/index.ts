import Vue from 'vue'
import Router from 'vue-router'
import state from '@/store/modules/user/state'
import { find } from 'lodash'

Vue.use(Router)

const Home = () => import('@/pages/home/index.vue')

interface Route {
  path: string
  name?: string
  component: any
  meta: Meta
  children?: CHildRoute[]
}

interface CHildRoute {
  path: string
  component: any
  meta: Meta
  props?: (route: any) => any
}

interface Meta {
  title: string
  icon?: string
  permission?: boolean
  show?: boolean
  hidden?: boolean
}

const routes: Route[] = [
  {
    path: '/login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '登录',
      permission: true
    }
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: '首页',
      permission: true
    }
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '公告消息',
      icon: 'icon-gonggaoxiaoxi',
      show: false
    },
    children: [
      {
        path: 'notice',
        meta: {
          title: '公告消息',
          icon: 'icon-gonggaoxiaoxi',
          show: false
        },
        component: () => import('@/pages/notice/index.vue')
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '厅主管理',
      icon: 'icon-tingzhuguanli',
      show: false
    },
    children: [
      {
        path: 'mainhall-manage',
        meta: {
          title: '厅主管理',
          icon: 'icon-tingzhuguanli',
          show: false
        },
        component: () => import('@/pages/hall-setting/mainhall-manage/index.vue')
      },
      {
        path: 'add-mainhall',
        meta: {
          title: '新增厅主',
          icon: 'icon-tingzhuguanli',
          show: false
        },
        component: () => import('@/pages/hall-setting/add-mainhall/index.vue')
      },
      {
        path: 'navigation',
        meta: {
          title: '导航栏设置',
          icon: 'icon-tingzhuguanli',
          show: false,
          hidden: true
        },
        component: () => import('@/pages/hall-setting/navigation/index.vue')
      },
      {
        path: 'domain-management',
        meta: {
          title: '厅主域名管理',
          icon: 'icon-tingzhuguanli',
          show: false
        },
        component: () => import('@/pages/hall-setting/domain-management/index.vue')
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '运营中心',
      icon: 'icon-yunyingzhongxin',
      show: false
    },
    children: [
      {
        path: 'maintain-setting',
        meta: {
          title: '全网维护设置',
          icon: 'icon-yunyingzhongxin',
          show: false
        },
        component: () => import('@/pages/operate-hub/maintain-setting/index.vue')
      },
      {
        path: 'transfer-abnormal',
        meta: {
          title: '转账异常',
          icon: 'icon-yunyingzhongxin',
          show: false
        },
        component: () => import('@/pages/operate-hub/transfer-abnormal/index.vue')
      },
      {
        path: 'transfer-record',
        meta: {
          title: '转账记录',
          icon: 'icon-yunyingzhongxin',
          show: false
        },
        component: () => import('@/pages/operate-hub/transfer-record/index.vue')
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '游戏管理',
      icon: 'icon-youxiguanli',
      show: false
    },
    children: [
      {
        path: 'game-account',
        component: () => import('@/pages/game/game-account/index.vue'),
        meta: {
          title: '游戏账号管理',
          icon: 'icon-youxiguanli',
          show: false
        }
      },
      {
        path: 'games-administration',
        component: () => import('@/pages/game/games-administration/index.vue'),
        meta: {
          title: '游戏管理',
          icon: 'icon-youxiguanli',
          show: false
        }
      },
      {
        path: 'add-recom',
        component: () => import('@/pages/game/components/add-recom/index.vue'),
        meta: {
          title: '添加推荐游戏',
          icon: 'icon-youxiguanli',
          show: false,
          hidden: true
        }
      },
      {
        path: 'activity-manage',
        component: () => import('@/pages/game/activity-manage/index.vue'),
        meta: {
          title: 'API活动管理',
          icon: 'icon-youxiguanli',
          show: false
        }
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '注单管理',
      icon: 'icon-editbook',
      show: false
    },
    children: [
      {
        path: 'order-esports',
        component: () => import('@/pages/order/order-esports/index.vue'),
        meta: {
          title: '电竞注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-live',
        component: () => import('@/pages/order/order-live/index.vue'),
        meta: {
          title: '视讯注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-sport',
        component: () => import('@/pages/order/order-sport/index.vue'),
        meta: {
          title: '体育注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-lottery',
        component: () => import('@/pages/order/order-lottery/index.vue'),
        meta: {
          title: '彩票注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-cards',
        component: () => import('@/pages/order/order-cards/index.vue'),
        meta: {
          title: '棋牌注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-egame',
        component: () => import('@/pages/order/order-egame/index.vue'),
        meta: {
          title: '电游注单',
          icon: 'icon-editbook',
          show: false
        }
      },
      {
        path: 'order-repair',
        component: () => import('@/pages/order/order-repair/index.vue'),
        meta: {
          title: '游戏数据补单',
          icon: 'icon-editbook',
          show: false
        }
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '财务报表',
      icon: 'icon-xinghao',
      show: false
    },
    children: [
      {
        path: 'general-statement',
        component: () => import('@/pages/statement/general-statement/index.vue'),
        meta: {
          title: '总报表',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'game-statement',
        component: () => import('@/pages/statement/game-statement/index.vue'),
        meta: {
          title: '游戏报表',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'unsettle-statement',
        component: () => import('@/pages/statement/unsettle-statement/index.vue'),
        meta: {
          title: '未结算报表',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'api-statement',
        component: () => import('@/pages/statement/api-statement/index.vue'),
        meta: {
          title: 'api对账报表',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'receipt-summary',
        component: () => import('@/pages/statement/receipt-summary/index.vue'),
        meta: {
          title: '出入款汇总',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'tips-summary',
        component: () => import('@/pages/statement/tips-summary/index.vue'),
        meta: {
          title: '红包小费报表',
          icon: 'icon-xinghao',
          show: false
        }
      },
      {
        path: 'report-download',
        component: () => import('@/pages/statement/report-download/index.vue'),
        meta: {
          title: '数据下载',
          icon: 'icon-xinghao',
          show: false,
          hidden: true,
          permission: true
        }
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '系统管理',
      icon: 'icon-user',
      show: false
    },
    children: [
      {
        path: 'account-settings',
        meta: {
          title: '账号设置',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/account-settings/index.vue')
      },
      {
        path: 'role',
        meta: {
          title: '角色管理',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/role/index.vue')
      },
      {
        path: 'master-log',
        meta: {
          title: '总后台日志',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/master-log/index.vue')
      },
      {
        path: 'admin-log',
        meta: {
          title: '厅主后台日志',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/admin-log/index.vue')
      },
      {
        path: 'member-log',
        meta: {
          title: '会员日志',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/member-log/index.vue')
      },
      {
        path: 'agent-log',
        meta: {
          title: '代理日志',
          icon: 'icon-user',
          show: false
        },
        component: () => import('@/pages/system/agent-log/index.vue')
      }
    ]
  },
  {
    path: '/',
    component: Home,
    meta: {
      title: '支付设置',
      icon: 'icon-money',
      show: false
    },
    children: [
      {
        path: 'pay',
        meta: {
          title: '支付设置',
          icon: 'icon-money',
          show: false
        },
        component: () => import('@/pages/pay/index.vue')
      }
    ]
  },
  {
    path: '*',
    component: () => import('@/pages/404/index.vue'),
    meta: {
      title: '404',
      permission: true
    }
  }
]

updatedMenu()

const router = new Router({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  let hasLogin = false, // 是否需要登录
    hasPermission = true, // 是否有访问权限
    isExistence = true // 是否存在该页面
  if (to.path !== '/' && to.path !== '/login' && to.path !== '/404' && to.path !== '/*') {
    if (state.token.length === 0) {
      /** 权限判定前，先进行是否需要登录判定 */
      hasLogin = true
    } else {
      const allPages = routes
          .map(v => v.children || [])
          .reduce((p, c) => {
            return [...p, ...c]
          }) /** 所有路由页面 */,
        thisPage = find(allPages, { path: to.path.replace('/', '') }) /** 该路由对应的页面 */
      /** 是否存在该路由？若存在则进行权限判定 */
      thisPage ? (hasPermission = !!thisPage.meta.permission) : (isExistence = false)
    }
  }
  if (isExistence) {
    if (hasLogin) {
      /** 若需要登录，去到登录页 */
      next({ path: '/login' })
    } else if (hasPermission) {
      // 路由发生变化修改页面标题
      if (to.meta.title) {
        if (to.matched.length > 1) {
          document.title = to.matched[0].meta.title + ' - ' + to.meta.title
        } else {
          document.title = '总后台管理系统 - ' + to.meta.title
        }
      } else {
        document.title = '总后台管理系统 - ' + to.matched[0].meta.title
      }
      next()
    } else {
      /** 没有权限，弹出提示，回到原页面 */
      Vue.prototype.$alert('您没有该权限！')
      next({ path: from.path, query: from.query })
    }
  } else {
    /** 该路由不存在 */
    next({ path: '*' })
  }
})

export default router

/** 更新菜单权限 */
export function updatedMenu() {
  const { btnAuth } = state // 请求到的权限集合
  routes.forEach((route: any) => {
    // 遍历当前所有的一级菜单路由，若设置权限为true，则无需进行权限判定
    if (!route.meta.permission) {
      const menu: any = find(btnAuth, { name: route.meta.title }) // 从btnAuth中获取当前一级菜单对应的权限
      route.meta.show = !!menu // 若menu存在，该一级菜单展示
      menu &&
        route.children &&
        route.children.length &&
        route.children.forEach(child => {
          // 遍历二级菜单，设置权限
          child.meta.permission = false // 默认设置二级菜单无权限
          const item = find(menu.children || [], { url: `/${child.path}` }), // 获取权限集合里对应路由是否存在
            permission = !!item || 'hidden' in child.meta // 二级路由权限：权限中存在 OR 被设置了是否隐藏
          child.meta.permission = permission
          child.meta.show = permission ? !child.meta.hidden : false
          route.meta.show = permission
        })
    }
  })
}
