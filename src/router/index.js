import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dataVideo',
    component: () => import(/* webpackChunkName: "dataVideo" */  '../views/dataVideo/dataVideo.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import(/* webpackPrefetch: true */ '../views/test/test.vue')
  },
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
