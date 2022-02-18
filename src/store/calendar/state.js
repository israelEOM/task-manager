import {
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'

export default {
  calendarView: 'month',
  selectedDate: today(),
  locale: 'en-us',
  maxDays: 1,
  bordered: false,
  fiveDayWorkWeek: false,
  firstDayMonday: false,
  shortMonthLabel: false,
  showDayOfYearLabel: false,
  shortWeekdayLabel: false,
  shortIntervalLabel: false,
  hour24Format: false,
  hideHeader: false,
  noScroll: false,
  showMonthLabel: true,
  showWorkWeeks: false,
  noDefaultHeaderBtn: false,
  noDefaultHeaderText: false,
  intervalRange: {
    min: 0,
    max: 24
  },
  intervalRangeStep: 1,
  intervalHeight: 60,
  resourceHeight: 60,
  resourceWidth: 100,
  dayHeight: 100,
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  typeOptions: ['Inspection', 'Monthly Checks', 'Meter Readings'],
  intervalOptions: [{
    label: 'Every day',
    value: 1
  },
  {
    label: 'Every week',
    value: 7
  },
  {
    label: 'Every quarter',
    value: 14
  },
  {
    label: 'Every month',
    value: 30
  }
  ],
  cityProperties: [{
    city: 'London',
    properties: [{
      name: '10 Downing Street',
      color: 'green'
    },
    {
      name: '221B Baker Street',
      color: 'orange'
    }
    ]
  },
  {
    city: 'Leeds',
    properties: [{
      name: '46 Victoria Street',
      color: 'teal'
    },
    {
      name: '33 Regent Park Road',
      color: 'purple'
    },
    {
      name: '23 Hessle Road',
      color: 'blue-grey'
    }
    ]
  }
  ]
}
