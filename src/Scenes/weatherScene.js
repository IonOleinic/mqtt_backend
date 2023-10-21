const request = require('request')
const Scene = require('./scene')
const { mqttClient } = require('../mqttClient')
class WeatherScene extends Scene {
  constructor({
    id,
    name,
    active,
    favorite,
    date,
    exec_device_id,
    executable_topic,
    executable_payload,
    executable_text,
    attributes = {},
  }) {
    super(
      id,
      name,
      'weather',
      active,
      favorite,
      date,
      exec_device_id,
      executable_topic,
      executable_payload,
      executable_text
    )
    this.comparison_sign = attributes.comparison_sign
    this.target_temperature = Number(attributes.target_temperature)
    this.current_temperature = 0
    this.city = 'suceava'
    this.api_key = '503946cd0949183d14afe29b6673cc5c'
  }
  getCurrentTemp() {
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${this.api_key}`
      request(url, (err, response, body) => {
        if (err) {
          console.log('error:', err)
        } else {
          let result = JSON.parse(body)
          this.current_temperature = result.main.temp
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  checkTemp() {
    switch (this.comparison_sign) {
      case '>':
        if (this.current_temperature > this.target_temperature) {
          this.execute()
        }
        break
      case '>=':
        if (this.current_temperature >= this.target_temperature) {
          this.execute()
        }
        break
      case '<':
        if (this.current_temperature < this.target_temperature) {
          this.execute()
        }
        break
      case '<=':
        if (this.current_temperature <= this.target_temperature) {
          this.execute()
        }
        break
      case '=':
        if (this.current_temperature == this.target_temperature) {
          this.execute()
        }
        break
      default:
        if (this.current_temperature == this.target_temperature) {
          this.execute()
        }
        break
    }
  }
  initScene() {
    this.intervalFunc = setInterval(() => {
      if (this.active) {
        this.getCurrentTemp()
        this.checkTemp(mqttClient)
      }
    }, 10000)
  }
  execute() {
    try {
      if (this.active) {
        mqttClient.publish(
          this.executable_topic,
          this.executable_payload,
          { qos: 0, retain: false },
          (error) => {
            if (error) {
              console.log(error)
            }
          }
        )
        this.active = false
      }
    } catch (error) {
      console.log(error)
    }
  }
  delete() {
    if (this.intervalFunc) {
      clearInterval(this.intervalFunc)
    }
    console.log(`Weather Scene with id=${this.id} was deleted.`)
  }
}
module.exports = WeatherScene
