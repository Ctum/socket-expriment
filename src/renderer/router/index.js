import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/components/Index.vue')
    },
    {
      path: '/create-server',
      name: 'create-server',
      component: () => import('@/components/Server.vue')
    },
    {
      path: '/create-client',
      name: 'create-client',
      component: () => import('@/components/Client.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
