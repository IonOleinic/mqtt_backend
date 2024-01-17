const schedule = require('node-schedule')
const Scene = require('./scene')
const { mqttClient } = require('../mqtt/mqttClient')
class Schedule extends Scene {
  constructor({
    id,
    name,
    user_id,
    active,
    favorite,
    createdAt,
    updatedAt,
    exec_device_id,
    executable_topic,
    executable_payload,
    executable_text,
    attributes = {},
  }) {
    super(
      id,
      name,
      user_id,
      'schedule',
      active,
      favorite,
      createdAt,
      updatedAt,
      exec_device_id,
      executable_topic,
      executable_payload,
      executable_text
    )
    this.dayOfWeek = attributes.dayOfWeek
    this.hour = attributes.hour
    this.minute = attributes.minute
    this.job_id =
      this.exec_device_id +
      this.dayOfWeek.toString().replaceAll(',', '') +
      this.hour +
      this.minute
    this.repeatedlyJob = undefined
    this.repeatedly()
  }

  repeatedly() {
    if (this.repeatedlyJob) {
      this.repeatedlyJob.cancel(true)
    }
    let isActive = this.active
    let executableTopic = this.executable_topic
    let executablePayload = this.executable_payload
    const func = () => {
      if (isActive) {
        mqttClient.publish(
          executableTopic,
          executablePayload,
          { qos: 0, retain: false },
          (error) => {
            if (error) {
              console.log(error)
            }
          }
        )
      }
    }
    const repeat = this.isOnce() ? 'once' : this.dayOfWeek.toString()
    console.log(
      `Schedule planned for device id=${this.exec_device_id} on  ${this.hour}:${this.minute}, repeat:${repeat}  action -> ${this.executable_text}`
    )
    let rule = new schedule.RecurrenceRule()
    if (this.isOnce()) {
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
    console.log(`Schedule with id=${this.id} was deleted.`)
  }
  isOnce() {
    if (this.dayOfWeek[0] === '' || this.dayOfWeek === '') {
      return true
    } else return false
  }
  isExpired() {
    const dateNow = new Date()
    if (this.isOnce()) {
      if (this.hour < dateNow.getHours()) {
        return true
      } else if (
        this.hour == dateNow.getHours() &&
        this.minute < dateNow.getMinutes()
      ) {
        return true
      }
    }
    return false
  }
}
module.exports = Schedule
