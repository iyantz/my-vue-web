import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/user'
import useSettingsStore from '@/store/settings'
import usePermissionStore from '@/store/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  // Development mode: initialize routes before navigation
  if (import.meta.env.DEV) {
    if (!window.__ROUTES_INITIALIZED__) {
      to.meta.title && useSettingsStore().setTitle(to.meta.title)
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()
      
      // Set default admin role and permissions
      userStore.roles = ['admin']
      userStore.permissions = ['*:*:*']
      
      // Initialize routes before navigation
      const accessRoutes = await permissionStore.generateRoutes(['admin'])
      accessRoutes.forEach(route => {
        if (!isHttp(route.path)) {
          router.addRoute(route)
        }
      })
      window.__ROUTES_INITIALIZED__ = true
      // Redirect to the same route to ensure proper rendering
      next({ ...to, replace: true })
      return
    }
    next()
    return
  }

  // Production mode: normal auth flow
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route)
              }
            })
            next({ ...to, replace: true })
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (isWhiteList(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
