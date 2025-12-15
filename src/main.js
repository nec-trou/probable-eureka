import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'

import StackSelection from './views/StackSelection.vue'
import CandidateInfo from './views/CandidateInfo.vue'
import Interview from './views/Interview.vue'
import LiveCoding from './views/LiveCoding.vue'
import Results from './views/Results.vue'
import Feedback from './views/Feedback.vue'
import Help from './views/Help.vue'

const routes = [
  { path: '/', component: StackSelection },
  { path: '/candidate', component: CandidateInfo },
  { path: '/interview', component: Interview },
  { path: '/livecoding', component: LiveCoding },
  { path: '/results', component: Results },
  { path: '/feedback', component: Feedback },
  { path: '/help', component: Help }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
