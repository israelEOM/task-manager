<template>
    <div style="padding:2rem">
        <q-select
            v-model="filterForm.city" :options="cityProperties.map(e => { return e.city })"  label="City"
            filled bottom-slot
        />
        <q-select
            v-model="filterForm.property" :disable="filterForm.city" :options="properties"  label="Property"
            filled bottom-slot
            style="margin-top:1rem"
        />
        <q-select
            v-model="filterForm.type" :options="typeOptions"  label="Type"
            filled bottom-slot
            style="margin-top:1rem"
        />
        <q-select
            v-model="filterForm.month" :options="months"  label="Month"
            filled bottom-slot
            style="margin-top:1rem"
        />
        <q-select
            v-model="filterForm.year" :options="years" label="Year"
            filled bottom-slot
            style="margin-top:1rem"
        />
    </div>
</template>

<script>
const today = new Date()
const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const formDefault = {
  city: '',
  property: '',
  type: '',
  month: months[today.getMonth()],
  year: today.getFullYear().toString()
}

export default {
  data () {
    return {
      filterForm: { ...formDefault },
      typeOptions: this.$store.state.calendar.typeOptions,
      intervalOptions: this.$store.state.calendar.intervalOptions,
      cityProperties: this.$store.state.calendar.cityProperties,
      years: years,
      months: months
    }
  },
  computed: {
    properties () {
      let data = []

      if (this.filterForm.city) {
        data = this.cityProperties.filter(
          e => { return e.city === this.filterForm.city }
        ).map(
          e => { return e.properties.map(e => { return e.name }) }
        )[0]
      }
      return data
    }
  },
  watch: {
    'filterForm.month' (val) {
      console.log(`01-12-${this.filterForm.year}`)
      this.$store.commit('calendar/selectedDate', `${this.filterForm.year}-${this.months.indexOf(this.filterForm.month) + 1}-01`)
    },
    'filterForm.year' (val) {
      console.log(`01-12-${this.filterForm.year}`)
      this.$store.commit('calendar/selectedDate', `${val}-${this.months.indexOf(this.filterForm.month) + 1}-01`)
    }
  }
}
</script>
