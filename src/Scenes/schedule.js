const schedule = require('node-schedule')
const Scene = require('./scene')
class Schedule extends Scene {
  constructor(name, device, dayOfWeek, hour, minute) {
    super(
      name,
      'schedule',
      'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
    )
    this.device_id = device.id
    this.device_name = device.name
    this.device_img = device.img
    this.dayOfWeek = dayOfWeek
    this.hour = hour
    this.minute = minute
    this.job_id =
      device.id + dayOfWeek.toString().replaceAll(',', '') + hour + minute
    this.repeatedlyJob = undefined
  }

  repeatedly(func, actionText) {
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    this.actionText = actionText
    const repeat = this.dayOfWeek[0] === '' ? 'once' : this.dayOfWeek.toString()
    console.log(
      `Schedule planned for ${this.device_name} on  ${this.hour}:${this.minute}, repeat:${repeat}  action -> ${actionText}`
    )
    let rule = new schedule.RecurrenceRule()
    if (this.dayOfWeek[0] === '') {
      const dateNow = new Date()
      rule.year = dateNow.getFullYear()
      rule.month = dateNow.getMonth()
      rule.date = dateNow.getDate()
      rule.hour = this.hour
      rule.minute = this.minute
    } else {
      rule.dayOfWeek = this.dayOfWeek
      rule.hour = this.hour
      rule.minute = this.minute
    }
    this.repeatedlyJob = schedule.scheduleJob(rule, function () {
      try {
        func()
      } catch (error) {
        console.log(error)
      }
    })
  }
  delete() {
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    console.log(`Schedule with id=${this.job_id} was deleted.`)
  }
}
module.exports = Schedule
