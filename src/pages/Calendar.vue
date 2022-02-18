<template>
  <div class="subcontent">
    <div class="row justify-center">
      <div class="q-pa-none">
        <h5 class="q-pa-none q-mt-sm q-ma-none">{{ months[new Date(selectedDate).getMonth()] }} {{ selectedDate.substr(0, 4) }}</h5>
      </div>
    </div>
    <navigation-bar
      @today="onToday"
      @prev="onPrev"
      @next="onNext"
    />

    <!-- display a task -->
    <q-dialog v-model="displayTask">
      <div>
        <q-card v-if="task">
          <q-toolbar :class="displayClasses(task)" :style="displayStyles(task)" style="min-width: 400px;">
            <q-toolbar-title>
              {{ task.type }}
            </q-toolbar-title>
            <q-btn flat round color="white" icon="delete" v-close-popup @click="deleteEvent(task)"></q-btn>
            <q-btn flat round color="white" icon="edit" v-close-popup @click="editEvent(task)"></q-btn>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
          <q-card-section class="inset-shadow">
            <div v-if="task.recurring" class="text-caption">{{ getEventDate(event) }}</div>
            {{ task.property }}
            <div v-if="task.time" class="text-caption">
              <div class="row full-width justify-start" style="padding-top: 12px;">
                <div class="col-12">
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Start Time:</strong>
                    </div>
                    <div class="col-7">
                      {{ task.time }}
                    </div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>End Time:</strong>
                    </div>
                    <div class="col-7">
                      {{ task.dateTimeEnd.slice(11, 16) }}
                    </div>
                  </div>
                  <div class="row full-width justify-start">
                    <div class="col-5" style="padding-left: 20px;">
                      <strong>Duration:</strong>
                    </div>
                    <div class="col-7">
                      {{ convertDurationTime(task.duration) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </q-dialog>

    <!-- add/edit a task -->
    <q-dialog v-model="addTask" no-backdrop-dismiss>
      <div>
        <q-form
          v-if="contextDay"
          ref='event'
          @submit="onSubmit"
          @reset="onReset"
        >
          <q-card v-if="addTask" style="min-width: 340px;">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>
                {{ addOrUpdateEvent }} Task
              </q-toolbar-title>
              <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-card-section class="inset-shadow">
              <q-select
                v-model="taskForm.type" :options="typeOptions"  label="Type"
                :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
              />
              <q-select
                v-model="taskForm.city" :options="cityProperties.map(e => { return e.city })"  label="City"
                :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
              />
              <q-select
                v-model="taskForm.property" :disable="taskForm.city" :options="properties"  label="Property"
                :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
              />
              <q-select
                v-if="taskForm.recurring"
                v-model="taskForm.frequency"
                :options="intervalOptions"
                label="Frequency"
                emit-value
                map-options
              />
              <q-field
                v-model="taskForm.recurring"
                style="padding-bottom: 20px;"
              >
                <q-checkbox
                  v-model="taskForm.recurring"
                  label="Is recurring"
                />
              </q-field>
                <q-input
                  v-model="taskForm.dateTimeStart"
                  ref="dateTimeStart"
                  label="Event start date and time"
                  mask="####-##-## ##:##"
                  :rules="[val => checkDateTimeStart() || 'Start time cannot come after end time']"
                  outlined
                  color="blue-6"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="taskForm.dateTimeStart" mask="YYYY-MM-DD HH:mm">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="taskForm.dateTimeStart" mask="YYYY-MM-DD HH:mm" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <q-input
                  v-model="taskForm.dateTimeEnd"
                  ref="dateTimeEnd"
                  label="Event end date and time"
                  mask="####-##-## ##:##"
                  :rules="[val => checkDateTimeEnd() || 'Start time cannot come after end time']"
                  color="blue-6"
                  outlined
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="taskForm.dateTimeEnd" mask="YYYY-MM-DD HH:mm">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>

                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="taskForm.dateTimeEnd" mask="YYYY-MM-DD HH:mm" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="OK" type="submit" color="primary"></q-btn>
              <q-btn flat label="Cancel" type="reset" color="primary" v-close-popup></q-btn>
            </q-card-actions>
          </q-card>
        </q-form>
      </div>
    </q-dialog>

    <div class="row justify-center">
      <div style="display: flex; width: 100%;">
        <q-calendar
          ref="calendar"
          v-model="selectedDate"
          animated
          bordered
          focusable
          hoverable
          no-active-date
          :mode="calendarView"
          :view="calendarView"
          :day-min-height="90"
          :day-height="0"
          :interval-minutes="60 * intervalRangeStep"
          @change="onChange"
          @moved="onMoved"
          @click-date="addEventMenu"
          @click-day="addEventMenu"
        >
          <!-- @click-day="addEventMenu"
          @click-date="addEventMenu"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay" -->
          <template #day="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="badgeClasses(event, 'day')"
                :style="badgeStyles(event, 'day')"
                @click.stop.prevent="showEvent(event)"
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.type + (event.time ? ' - ' + event.time : '') }}
                </div>
              </div>
            </template>
          </template>
          <template #day-header="{ scope: { timestamp } }">
            teste
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="badgeClasses(event, 'header')"
                :style="badgeStyles(event, 'header')"
                @click.stop.prevent="showEvent(event)"
                style="width: 100%; cursor: pointer; height: 14px; max-height: 14px"
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.type + (event.time ? ' - ' + event.time : '') }}
                </div>
              </div>
            </template>
          </template>

          <template #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }">
            <!-- {{ timeDurationHeight }} -->
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <q-badge
                class="my-event justify-center"
                :class="badgeClasses(event, 'body')"
                :style="badgeStyles(event, 'body', timeStartPos, timeDurationHeight)"
                @click.stop.prevent="showEvent(event)"
                :draggable="true"
                @dragstart="(e) => onDragStart(e, event)"
                @dragend="(e) => onDragEnd(e, event)"
                @dragenter="(e) => onDragEnter(e, event)"
                @touchmove="(e) => {}"
              >
                <span class="ellipsis">{{ event.type }}</span>
              </q-badge>
            </template>
        </template>

        </q-calendar>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import events from '../util/events'
import { isCssColor } from '../util/color'
import {
  QCalendar,
  addToDate,
  getTime,
  getDateTime,
  getDayIdentifier,
  getTimeIdentifier,
  parseTimestamp,
  makeDateTime,
  isBetweenDates,
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import { date, colors } from 'quasar'
import { stop, prevent, stopAndPrevent } from 'quasar/src/utils/event'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'
import { defineComponent } from 'vue'
import NavigationBar from '../components/NavigationBar.vue'

// const CURRENT_DAY = new Date()

const formDefault = {
  type: '',
  city: '',
  property: '',
  recurring: false,
  dateTimeStart: '',
  dateTimeEnd: '',
  bgcolor: '#0000FF'
}

// function getCurrentDay (day) {
//   const newDay = new Date(CURRENT_DAY)
//   newDay.setDate(day)
//   const tm = parseDate(newDay)
//   return tm.date
// }
export default defineComponent({
  name: 'MonthSlotDay',
  components: {
    NavigationBar,
    QCalendar
  },
  data () {
    return {
      // selectedDate: today(),
      addTask: false,
      contextDay: null,
      displayTask: false,
      task: null,
      taskForm: { ...formDefault },
      typeOptions: this.$store.state.calendar.typeOptions,
      intervalOptions: this.$store.state.calendar.intervalOptions,
      cityProperties: this.$store.state.calendar.cityProperties,
      months: this.$store.state.calendar.months,
      events: []
    }
  },
  mounted () {
    this.events = events
    this.emitter.on('add:task', (e) => {
      e.scope = {}
      e.scope.timestamp = parseTimestamp(today())
      this.addEventMenu(e)
    })
  },
  watch: {
    'taskForm.property' (val) {
      let color = null
      color = this.cityProperties.filter(
        e => { return e.city === this.taskForm.city }
      ).map(
        e => { return e.properties.filter(e => { return e.name === val })[0].color }
      )[0]

      this.taskForm.bgcolor = color
    }
  },
  computed: {
    ...mapGetters({
      locale: 'calendar/locale',
      titlebarHeight: 'common/titlebarHeight',
      maxDays: 'calendar/maxDays',
      bordered: 'calendar/bordered',
      fiveDayWorkWeek: 'calendar/fiveDayWorkWeek',
      firstDayMonday: 'calendar/firstDayMonday',
      shortMonthLabel: 'calendar/shortMonthLabel',
      showDayOfYearLabel: 'calendar/showDayOfYearLabel',
      shortWeekdayLabel: 'calendar/shortWeekdayLabel',
      shortIntervalLabel: 'calendar/shortIntervalLabel',
      hour24Format: 'calendar/hour24Format',
      hideHeader: 'calendar/hideHeader',
      noScroll: 'calendar/noScroll',
      showMonthLabel: 'calendar/showMonthLabel',
      showWorkWeeks: 'calendar/showWorkWeeks',
      noDefaultHeaderBtn: 'calendar/noDefaultHeaderBtn',
      noDefaultHeaderText: 'calendar/noDefaultHeaderText',
      intervalRange: 'calendar/intervalRange',
      intervalRangeStep: 'calendar/intervalRangeStep',
      intervalHeight: 'calendar/intervalHeight',
      resourceHeight: 'calendar/resourceHeight',
      resourceWidth: 'calendar/resourceWidth',
      dayHeight: 'calendar/dayHeight'
    }),
    selectedDate: {
      get () {
        return this.$store.state.calendar.selectedDate
      },
      set (date) {
        this.$store.commit('calendar/selectedDate', date)
      }
    },
    calendarView: {
      get () {
        return this.$store.state.calendar.calendarView
      },
      set (view) {
        this.$store.commit('calendar/calendarView', view)
      }
    },
    properties () {
      let data = []

      if (this.taskForm.city) {
        data = this.cityProperties.filter(
          e => { return e.city === this.taskForm.city }
        ).map(
          e => { return e.properties.map(e => { return e.name }) }
        )[0]
      }

      return data
    },
    eventsMap () {
      const map = {}
      if (this.events.length > 0) {
        this.events.forEach(event => {
          (map[event.date] = (map[event.date] || [])).push(event)
          if (event.days !== undefined) {
            let timestamp = parseTimestamp(event.date)
            let days = event.days

            do {
              timestamp = addToDate(timestamp, { day: 1 })
              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
              // already accounted for 1st day
            } while (--days > 1)
          }

          if (event.frequency !== undefined) {
            let timestamp = parseTimestamp(event.date)
            // let days = 365
            const end = addToDate(timestamp, { month: 3 })

            do {
              if (event.frequency === '30') {
                timestamp = addToDate(timestamp, { month: 1 })
              } else {
                timestamp = addToDate(timestamp, { day: event.frequency })
              }

              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
              // already accounted for 1st day
            } while (new Date(timestamp.date) < new Date(end.date))
            // } while (--days > 1)
          }
        })
      }
      // console.log(map)
      return map
    },
    addOrUpdateEvent () {
      if (this.contextDay && this.contextDay.bgcolor) {
        return 'Update'
      }
      return 'Add'
    }
  },
  methods: {
    badgeClasses (event, type) {
      return {
        [`text-white bg-${event.bgcolor}`]: true,
        'rounded-border': true
      }
    },
    badgeStyles (day, event) {
      const s = {}
      // s.left = day.weekday === 0 ? 0 : (day.weekday * this.parsedCellWidth) + '%'
      // s.top = 0
      // s.bottom = 0
      // s.width = (event.days * this.parsedCellWidth) + '%'
      return s
    },
    onToday () {
      this.$refs.calendar.moveToToday()
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },
    onMoved (data) {
      console.log('onMoved', data)
    },
    onChange (data) {
      console.log('onChange', data)
    },
    onClickDate (data) {
      console.log('onClickDate', data)
    },
    onClickDay (data) {
      console.log('onClickDay', data)
    },
    onClickWorkweek (data) {
      console.log('onClickWorkweek', data)
    },
    onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    },
    onClickHeadWorkweek (data) {
      console.log('onClickHeadWorkweek', data)
    },

    onSubmit () {
      this.saveEvent()
    },

    onReset () {

    },

    resetForm () {
      this.taskForm = { ...formDefault }
    },

    showEvent (task) {
      if (this.calendarView.indexOf('agenda') < 0) {
        console.log(this.calendarView.indexOf('agenda'))
        this.task = task
        console.log(this.task)
        this.displayTask = true
      }
    },

    addEventMenu ({ scope, event }) {
      console.log(scope)
      if (scope.timestamp.disabled === true || this.calendarView.indexOf('scheduler') > -1 || this.calendarView.indexOf('agenda') > -1) {
        return
      }
      this.resetForm()
      this.contextDay = { ...scope.timestamp }
      let timestamp
      if (this.contextDay.hasTime === true) {
        timestamp = this.adjustTimestamp(this.contextDay)
        const endTime = addToDate(timestamp, { hour: 1 })
        this.taskForm.dateTimeEnd = getDateTime(endTime)
      } else {
        timestamp = parseTimestamp(this.contextDay.date + ' 00:00')
      }
      this.taskForm.dateTimeStart = getDateTime(timestamp)
      this.taskForm.recurring = this.contextDay.hasTime === false
      this.taskForm.bgcolor = '#0000FF' // starting color
      this.addTask = true // show dialog
    },

    saveEvent () {
      this.$refs.event.validate().then((success) => {
        if (success) {
          // close the dialog
          this.addTask = false
          const form = { ...this.taskForm }
          console.log(form)
          let update = false
          if (this.contextDay.bgcolor) {
            // an update
            update = true
          } else {
            // an add
          }
          const data = {
            bgcolor: form.bgcolor,
            type: form.type,
            city: form.city,
            property: form.property,
            dateTimeStart: form.dateTimeStart,
            dateTimeEnd: form.dateTimeEnd,
            time: String(form.dateTimeStart).slice(11, 16),
            duration: this.getDuration(form.dateTimeStart, form.dateTimeEnd, 'minutes'),
            date: String(form.dateTimeStart).slice(0, 10).replace(/\//g, '-')
          }
          if (form.recurring === true) {
            data.frequency = form.frequency
          }
          if (update === true) {
            console.log('update')
            const index = this.findEventIndex(this.contextDay)
            if (index >= 0) {
              this.events.splice(index, 1, { ...data })
            }
          } else {
            // add to events array
            this.events.push(data)
          }

          console.log(this.events)

          this.contextDay = null
        }
      })
    },
    editEvent (task) {
      this.resetForm()
      this.contextDay = { ...task }

      console.log(task)
      this.taskForm.bgcolor = task.bgcolor
      this.taskForm.type = task.type
      this.taskForm.city = task.city
      this.taskForm.property = task.property
      this.taskForm.dateTimeStart = task.dateTimeStart
      this.taskForm.dateTimeEnd = task.dateTimeEnd
      this.taskForm.time = task.time
      this.taskForm.duration = task.duration
      this.taskForm.date = task.date
      if (task.frequency) {
        this.taskForm.frequency = task.frequency
        this.taskForm.recurring = true
      } else {
        this.taskForm.recurring = false
      }
      console.log('edit', this.taskForm)
      this.addTask = true // show dialog
    },
    deleteEvent (event) {
      const index = this.findEventIndex(event)
      if (index >= 0) {
        this.events.splice(index, 1)
      }
    },
    getEvents (dt) {
      const currentDate = parseTimestamp(dt)
      const events = []
      for (let i = 0; i < this.events.length; ++i) {
        let added = false
        const event = this.events[i]
        if (event.date === dt) {
          if (event.time !== undefined) {
            if (events.length > 0) {
              // check for overlapping times
              const startTime = parseTimestamp(event.date + ' ' + event.time)
              const endTime = addToDate(startTime, { minute: event.duration })
              for (let j = 0; j < events.length; ++j) {
                const evt = events[j]
                if (evt.time !== undefined) {
                  const startTime2 = parseTimestamp(evt.date + ' ' + evt.time)
                  const endTime2 = addToDate(startTime2, { minute: evt.duration })
                  if (isBetweenDates(startTime, startTime2, endTime2) || isBetweenDates(endTime, startTime2, endTime2)) {
                    evt.side = 'left'
                    event.side = 'right'
                    events.push(event)
                    added = true
                    break
                  }
                }
              }
            }
          }
          if (!added) {
            event.side = undefined
            events.push(event)
          }
        } else if (event.days) {
          // check for overlapping dates
          const startDate = parseTimestamp(event.date)
          const endDate = addToDate(startDate, { day: event.days })
          if (isBetweenDates(currentDate, startDate, endDate)) {
            events.push(event)
            added = true
          }
        }
      }
      return events
    },
    adjustTimestamp (day) {
      day.minute = day.minute < 15 || day.minute >= 45 ? 0 : 30
      day.time = getTime(day)
      return day
    },
    checkDateTimeStart (/* val */) {
      this.$refs.dateTimeEnd.resetValidation()
      if (this.taskForm.dateTimeStart && this.taskForm.dateTimeEnd) {
        const timestampStart = parseTimestamp(this.taskForm.dateTimeStart)
        const timestampEnd = parseTimestamp(this.taskForm.dateTimeEnd)
        const dayStart = getDayIdentifier(timestampStart)
        const dayEnd = getDayIdentifier(timestampEnd)
        if (dayStart < dayEnd) {
          return true
        } else if (dayStart > dayEnd) {
          return false
        } else {
          const timeStart = getTimeIdentifier(timestampStart)
          const timeEnd = getTimeIdentifier(timestampEnd)
          if (timeStart <= timeEnd) {
            return true
          } else {
            return false
          }
        }
      }
      return false
    },

    checkDateTimeEnd (val) {
      this.$refs.dateTimeStart.resetValidation()
      if (this.taskForm.dateTimeStart && this.taskForm.dateTimeEnd) {
        const timestampEnd = parseTimestamp(this.taskForm.dateTimeEnd)
        const timestampStart = parseTimestamp(this.taskForm.dateTimeStart)
        const dayEnd = getDayIdentifier(timestampEnd)
        const dayStart = getDayIdentifier(timestampStart)
        if (dayEnd > dayStart) {
          return true
        } else if (dayEnd < dayStart) {
          return false
        } else {
          const timeEnd = getTimeIdentifier(timestampEnd)
          const timeStart = getTimeIdentifier(timestampStart)
          if (timeEnd >= timeStart) {
            return true
          } else {
            return false
          }
        }
      }
      return false
    },
    getDuration (dateTimeStart, dateTimeEnd, unit) {
      const start = makeDateTime(parseTimestamp(dateTimeStart))
      const end = makeDateTime(parseTimestamp(dateTimeEnd))
      const diff = date.getDateDiff(end, start, unit)
      return diff
    },
    convertDurationTime (n) {
      const num = n
      const days = Math.floor(((num / 60) / 24))
      const hours = (num / 60)
      const rhours = Math.floor(hours)
      const rshours = Math.floor(hours - (days * 24))
      const minutes = (hours - rhours) * 60
      const rminutes = Math.round(minutes)
      return (days > 0 ? days + ' days and ' : '') + (rshours > 0 ? rshours + ' hour(s) and ' : '') + rminutes + ' minute(s).'
    },
    findEventIndex (event) {
      for (let i = 0; i < this.events.length; ++i) {
        if (event.title === this.events[i].title &&
          event.details === this.events[i].details &&
          event.date === this.events[i].date) {
          return i
        }
      }
    },
    displayClasses (event) {
      return {
        [`bg-${event.bgcolor}`]: !isCssColor(event.bgcolor),
        'text-white': !isCssColor(event.bgcolor)
      }
    },
    displayStyles (event) {
      const s = {}
      if (isCssColor(event.bgcolor)) {
        s['background-color'] = event.bgcolor
        s.color = colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      return s
    },
    onDragEnter (ev, event) {
      prevent(ev)
    },
    onDragStart (ev, event) {
      this.dragging = true
      this.draggedEvent = event
      stop(ev)
    },
    onDragEnd (ev, event) {
      stopAndPrevent(ev)
      this.resetDrag()
    }
  }
})
</script>

<style lang="sass" scoped>
  .my-event
    position: relative
    font-size: 12px
    width: 100%
    margin: 1px 0 0 0
    justify-content: center
    text-overflow: ellipsis
    overflow: hidden
    cursor: pointer
  .title
    position: relative
    display: flex
    justify-content: center
    align-items: center
    height: 100%
  .text-white
    color: white
  .bg-blue
    background: blue
  .bg-green
    background: green
  .bg-orange
    background: orange
  .bg-red
    background: red
  .bg-teal
    background: teal
  .bg-grey
    background: grey
  .bg-purple
    background: purple
  .rounded-border
    border-radius: 2px
</style>
