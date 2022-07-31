import Vue from 'vue'
import VueRouter from 'vue-router'
import particleView from '../views/particleView.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'particleView',
    component: particleView
}]

const router = new VueRouter({
    routes
})

export default router
