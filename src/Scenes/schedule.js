const schedule = require('node-schedule')

class Schedule {
  constructor(device, dayOfWeek, hour, minute) {
    // this.startJob = undefined
    // this.endJob = undefined
    this.device = device
    this.dayOfWeek = dayOfWeek
    this.hour = hour
    this.minute = minute
    this.id =
      device.id + dayOfWeek.toString().replaceAll(',', '') + hour + minute
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

  repeatedly(func, actionText) {
    const changeTimeZone = (date, timeZone) => {
      if (typeof date === 'string') {
        return new Date(
          new Date(date).toLocaleString('ro-RO', {
            timeZone,
          })
        )
      }
      return new Date(
        date.toLocaleString('ro-RO', {
          timeZone,
        })
      )
    }
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    console.log(this.dayOfWeek)
    const repeat = this.dayOfWeek[0] == -1 ? 'once' : this.dayOfWeek.toString()
    console.log(
      `Schedule planned for ${this.device.name} on  ${this.hour}:${this.minute}, repeat:${repeat}  action -> ${actionText}`
    )
    let rule = new schedule.RecurrenceRule()
    if (this.dayOfWeek[0] == -1) {
      const dateNow = new Date()
      let date = new Date(
        dateNow.getFullYear(),
        dateNow.getMonth(),
        dateNow.getDay(),
        this.hour,
        this.minute
      )
      rule = changeTimeZone(date, 'Europe/Bucharest')
      console.log(this.hour)
      console.log(date)
    } else {
      rule.dayOfWeek = this.dayOfWeek
      rule.hour = this.hour
      rule.minute = this.minute
    }
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
