const schedule = require('node-schedule')

class Schedule {
  constructor() {
    // this.startJob = undefined
    // this.endJob = undefined
    this.id = Math.random().toString(4).slice(3)
    this.active = true
    this.repeatedlyJob = undefined
  }
  // start_with_end(func_start, func_end, startDate, EndDate) {
  //   if (this.startJob) {
  //     this.startJob.cancel(true)
  //   }
  //   if (this.endJob) {
  //     this.endJob.cancel(true)
  //   }
  //   console.log(
  //     `Schedule planned for date:${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDay()} ${startDate.getHours()}:${startDate.getMinutes()}...`
  //   )
  //   const rule = new schedule.RecurrenceRule()
  //   rule.hour = startDate.getHours()
  //   rule.minute = startDate.getMinutes()
  //   let isActive = this.active
  //   this.startJob = schedule.scheduleJob(rule, function () {
  //     if (isActive) {
  //       console.log('Schedule...start')
  //       func_start()
  //     }
  //   })
  //   const rule2 = new schedule.RecurrenceRule()
  //   rule2.hour = EndDate.getHours()
  //   rule2.minute = EndDate.getMinutes()

  //   this.endJob = schedule.scheduleJob(rule2, function () {
  //     if (isActive) {
  //       console.log('Schedule...end')
  //       func_end()
  //     }
  //   })
  // }
  repeatedly(func, dayOfWeek, hour, minute) {
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    console.log(`Schedule planned for ${dayOfWeek}- ${hour}:${minute}`)
    const rule = new schedule.RecurrenceRule()
    rule.dayOfWeek = dayOfWeek
    rule.hour = hour
    rule.minute = minute
    let isActive = this.active
    this.repeatedlyJob = schedule.scheduleJob(rule, function () {
      if (isActive) {
        func()
      }
    })
  }
  delete() {
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    // if (this.startJob) {
    //   this.startJob.cancel(true)
    // }
    // if (this.endJob) {
    //   this.endJob.cancel(true)
    // }
    console.log('Scene deleted.')
  }
}
module.exports = Schedule
