const request = require('request')
const Scene = require('./scene')
class WeatherScene extends Scene {
  constructor(
    name,
    target_temperature,
    executable_topic,
    executable_payload,
    exec_device_id,
    executable_text = '',
    comparison_sign = '='
  ) {
    super(name, 'weather')
    this.executable_text = executable_text
    this.executable_topic = executable_topic
    this.executable_payload = executable_payload
    this.exec_device_id = exec_device_id
    this.comparison_sign = comparison_sign
    this.target_temperature = Number(target_temperature)
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
  checkTemp(mqtt_client) {
    switch (this.comparison_sign) {
      case '>':
        if (this.current_temperature > this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
      case '>=':
        if (this.current_temperature >= this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
      case '<':
        if (this.current_temperature < this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
      case '<=':
        if (this.current_temperature <= this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
      case '=':
        if (this.current_temperature == this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
      default:
        if (this.current_temperature == this.target_temperature) {
          this.execute(mqtt_client)
        }
        break
    }
  }
  initScene(mqtt_client) {
    this.intervalFunc = setInterval(() => {
      if (this.active) {
        this.getCurrentTemp()
        this.checkTemp(mqtt_client)
      }
    }, 10000)
  }
  execute(mqtt_client) {
    try {
      if (this.active) {
        mqtt_client.publish(
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
