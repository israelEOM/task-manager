const routes = [{
  path: '/',
  component: () => import('layouts/CalendarLayout.vue'),
  children: [{
    path: '',
    component: () => import('pages/Calendar.vue')
  }]
},

// Always leave this as last one,
// but you can also remove it
{
  path: '/:catchAll(.*)*',
  component: () => import('pages/Error404.vue')
}
]

export default routes
