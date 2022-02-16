<template>
  <div class="subcontent">
    <navigation-bar
      @today="onToday"
      @prev="onPrev"
      @next="onNext"
    />

    <!-- add/edit a task -->
    <q-dialog v-model="addTask" no-backdrop-dismiss>
      <div>
        <q-form
          v-if="contextDay"
          ref='event'
          @submit="onSubmit"
          @reset="onReset"
        >
          <q-card v-if="addTask" style="width: 400px;">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>
                {{ addOrUpdateEvent }} Event teste2
              </q-toolbar-title>
              <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-card-section class="inset-shadow">
              <q-input
                v-model="eventForm.title"
                label="Title"
                :rules="[v => v && v.length > 0 || 'Field cannot be empty']"
                autofocus
              />
              <q-input
                v-model="eventForm.details"
                label="Details"
              />
              <q-field
                v-model="eventForm.allDay"
                style="padding-bottom: 20px;"
              >
                <q-checkbox
                  v-model="eventForm.allDay"
                  label="All-Day event?"
                />
              </q-field>

              <q-input
                v-if="eventForm.allDay"
                v-model="eventForm.dateTimeStart"
                label="Enter date"
                mask="####-##-##"
                color="blue-6"
                outlined
                style="padding-bottom: 20px;"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy v-model="showDateScrollerAllDay">

                      <q-scroller
                        v-model="eventForm.dateTimeStart"
                        view="date"
                        :locale="locale"
                        :hour24-format="true"
                        :rounded-borders="true"
                        border-color="#2196f3"
                        bar-color="#2196f3"
                        text-color="white"
                        color="primary"
                        inner-text-color="primary"
                        inner-color="white"
                        :style="scrollerPopupStyle160"
                        @close="() => { showDateScrollerAllDay = false }"
                      />

                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <div v-else>
                <q-input
                  v-model="eventForm.dateTimeStart"
                  ref="dateTimeStart"
                  label="Event start date and time"
                  mask="####-##-## ##:##"
                  :rules="[val => checkDateTimeStart() || 'Start time cannot come after end time']"
                  outlined
                  color="blue-6"
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy v-model="showDateTimeScrollerStart">

                        <q-scroller
                          v-model="eventForm.dateTimeStart"
                          view="date-time"
                          :locale="locale"
                          :hour24-format="true"
                          :rounded-borders="true"
                          border-color="#2196f3"
                          bar-color="#2196f3"
                          color="primary"
                          text-color="white"
                          inner-color="white"
                          inner-text-color="primary "
                          :style="scrollerPopupStyle280"
                          @close="() => { showDateTimeScrollerStart = false }"
                        />

                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-input
                  v-model="eventForm.dateTimeEnd"
                  ref="dateTimeEnd"
                  label="Event end date and time"
                  mask="####-##-## ##:##"
                  :rules="[val => checkDateTimeEnd() || 'Start time cannot come after end time']"
                  color="blue-6"
                  outlined
                >
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy v-model="showDateTimeScrollerEnd">

                        <q-scroller
                          v-model="eventForm.dateTimeEnd"
                          view="date-time"
                          :locale="locale"
                          :hour24-format="true"
                          :rounded-borders="true"
                          border-color="#2196f3"
                          bar-color="#2196f3"
                          color="primary"
                          text-color="white"
                          inner-color="white"
                          inner-text-color="primary "
                          :style="scrollerPopupStyle280"
                          @close="() => { showDateTimeScrollerEnd = false }"
                        />

                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <q-input
                v-model="eventForm.icon"
                label="Icon"
                outlined
                clearable
                style="padding-bottom: 20px;"
              >
                <template #append>
                  <q-icon name="extension" class="cursor-pointer">
                    <q-popup-proxy v-model="showIconPicker">

                      <q-icon-picker
                        v-model="eventForm.icon"
                        :filter="eventForm.icon"
                        icon-set="fontawesome-v5"
                        tooltips
                        v-model:pagination="pagination"
                        style="height: 300px; width: 300px; background-color: white;"
                      />

                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-input
                v-model="eventForm.bgcolor"
                label="Color"
                outlined
                clearable
              >
                <template #append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-color v-model="eventForm.bgcolor"></q-color>
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
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-day="onClickDay"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay"
        >
          <template #day="{ scope: { timestamp } }">
            <template
              v-for="event in eventsMap[timestamp.date]"
              :key="event.id"
            >
              <div
                :class="badgeClasses(event, 'day')"
                :style="badgeStyles(event, 'day')"
                class="my-event"
                @click="showEvent(event)"
              >
                <div class="title q-calendar__ellipsis">
                  {{ event.title + (event.time ? ' - ' + event.time : '') }}
                  <q-tooltip>{{ event.details }}</q-tooltip>
                </div>
              </div>
            </template>
          </template>
        </q-calendar>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QCalendar,
  addToDate,
  parseDate,
  parseTimestamp,
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'
import { defineComponent } from 'vue'
import NavigationBar from '../components/NavigationBar.vue'
// The function below is used to set up our demo data
const CURRENT_DAY = new Date()
function getCurrentDay (day) {
  const newDay = new Date(CURRENT_DAY)
  newDay.setDate(day)
  const tm = parseDate(newDay)
  return tm.date
}
export default defineComponent({
  name: 'MonthSlotDay',
  components: {
    NavigationBar,
    QCalendar
  },
  data () {
    return {
      selectedDate: today(),
      addTask: false,
      contextDay: null,
      displayTask: false,
      task: null,
      events: [
        {
          id: 1,
          title: '1st of the Month',
          details: 'Everything is funny as long as it is happening to someone else',
          date: getCurrentDay(1),
          bgcolor: 'orange'
        },
        {
          id: 2,
          title: 'Sisters Birthday',
          details: 'Buy a nice present',
          date: getCurrentDay(4),
          bgcolor: 'green',
          icon: 'fas fa-birthday-cake'
        },
        {
          id: 3,
          title: 'Meeting',
          details: 'Time to pitch my idea to the company',
          date: getCurrentDay(10),
          time: '10:00',
          duration: 120,
          bgcolor: 'red',
          icon: 'fas fa-handshake'
        },
        {
          id: 4,
          title: 'Lunch',
          details: 'Company is paying!',
          date: getCurrentDay(10),
          time: '11:30',
          duration: 90,
          bgcolor: 'teal',
          icon: 'fas fa-hamburger'
        },
        {
          id: 5,
          title: 'Visit mom',
          details: 'Always a nice chat with mom',
          date: getCurrentDay(20),
          time: '17:00',
          duration: 90,
          bgcolor: 'grey',
          icon: 'fas fa-car'
        },
        {
          id: 6,
          title: 'Conference',
          details: 'Teaching Javascript 101',
          date: getCurrentDay(22),
          time: '08:00',
          duration: 540,
          bgcolor: 'blue',
          icon: 'fas fa-chalkboard-teacher'
        },
        {
          id: 7,
          title: 'Girlfriend',
          details: 'Meet GF for dinner at Swanky Restaurant',
          date: getCurrentDay(22),
          time: '19:00',
          duration: 180,
          bgcolor: 'teal',
          icon: 'fas fa-utensils'
        },
        {
          id: 8,
          title: 'Rowing',
          details: 'Stay in shape!',
          date: getCurrentDay(27),
          bgcolor: 'purple',
          icon: 'rowing',
          days: 2
        },
        {
          id: 9,
          title: 'Fishing',
          details: 'Time for some weekend R&R',
          date: getCurrentDay(27),
          bgcolor: 'purple',
          icon: 'fas fa-fish',
          days: 2
        },
        {
          id: 10,
          title: 'Vacation',
          details: 'Trails and hikes, going camping! Don\'t forget to bring bear spray!',
          date: getCurrentDay(29),
          bgcolor: 'purple',
          icon: 'fas fa-plane',
          days: 5
        }
      ]
    }
  },
  computed: {
    calendarView: {
      get () {
        return this.$store.state.calendar.calendarView
      },
      set (view) {
        this.$store.commit('calendar/calendarView', view)
      }
    },
    eventsMap () {
      const map = {}
      if (this.events.length > 0) {
        this.events.forEach(event => {
          (map[event.date] = (map[event.date] || [])).push(event)
          if (event.days !== undefined) {
            let timestamp = parseTimestamp(event.date)
            let days = event.days
            // add a new event for each day
            // skip 1st one which would have been done above
            do {
              timestamp = addToDate(timestamp, { day: 1 })
              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
              // already accounted for 1st day
            } while (--days > 1)
          }
        })
      }
      console.log(map)
      return map
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

    showEvent (task) {
      if (this.calendarView.indexOf('agenda') < 0) {
        this.tasl = task
        this.displayTask = true
      }
    },

    saveEvent () {
      const self = this
      this.$refs.event.validate().then((success) => {
        if (success) {
          // close the dialog
          this.addTask = false
          const form = { ...self.eventForm }
          let update = false
          if (self.contextDay.bgcolor) {
            // an update
            update = true
          } else {
            // an add
          }
          const data = {
            title: form.title,
            details: form.details,
            icon: form.icon,
            bgcolor: form.bgcolor,
            date: String(form.dateTimeStart).slice(0, 10).replace(/\//g, '-')
          }
          if (form.allDay === false) {
            // get time into separate var
            data.time = String(form.dateTimeStart).slice(11, 16)
            data.duration = self.getDuration(form.dateTimeStart, form.dateTimeEnd, 'minutes')
          }
          if (update === true) {
            const index = self.findEventIndex(self.contextDay)
            if (index >= 0) {
              self.events.splice(index, 1, { ...data })
            }
          } else {
            // add to events array
            self.events.push(data)
          }

          self.contextDay = null
        }
      })
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