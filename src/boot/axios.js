import {
  boot
} from 'quasar/wrappers'
import Plugin from '@quasar/quasar-ui-qcalendar/src/QCalendarDay.js'
import '@quasar/quasar-ui-qcalendar/src/css/calendar-day.sass'
import axios from 'axios'

import mitt from 'mitt'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: 'https://api.example.com'
})

const emitter = mitt()

export default boot(({
  app
}) => {
  app.config.globalProperties.$axios = axios

  app.config.globalProperties.$api = api

  app.config.globalProperties.emitter = emitter

  app.use(Plugin)
})

export {
  api
}
