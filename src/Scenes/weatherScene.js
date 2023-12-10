const request = require('request')
const Scene = require('./scene')

class WeatherScene extends Scene {
  constructor({
    id,
    name,
    user_id,
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
      user_id,
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
    this.location = attributes.location
    this.country = attributes.location?.country
    this.city = attributes.location?.city
  }
  async getCurrentTemp() {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.location?.latitude}&lon=${this.location?.longitude}&units=metric&appid=${process.env.OPEN_WEATHER_API}`
      return new Promise((resolve, reject) => {
        request(url, (err, response, body) => {
          if (err) {
            console.log('error:', err)
            reject(err) // Reject the promise with the error
          } else {
            const result = JSON.parse(body)
            const currentTemperature = result?.main?.temp
            resolve(currentTemperature) // Resolve the promise with the temperature
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  checkTemp(current_temperature) {
    switch (this.comparison_sign) {
      case '>':
        if (current_temperature > this.target_temperature) {
          this.execute()
        }
        break
      case '>=':
        if (current_temperature >= this.target_temperature) {
          this.execute()
        }
        break
      case '<':
        if (current_temperature < this.target_temperature) {
          this.execute()
        }
        break
      case '<=':
        if (current_temperature <= this.target_temperature) {
          this.execute()
        }
        break
      case '=':
        if (current_temperature == this.target_temperature) {
          this.execute()
        }
        break
      default:
        if (current_temperature == this.target_temperature) {
          this.execute()
        }
        break
    }
  }
  initScene() {
    this.intervalFunc = setInterval(async () => {
      try {
        if (this.active) {
          const current_temperature = await this.getCurrentTemp()
          this.checkTemp(current_temperature)
        }
      } catch (error) {
        console.log(error)
      }
    }, 10000)
  }

  delete() {
    if (this.intervalFunc) {
      clearInterval(this.intervalFunc)
    }
    console.log(`Weather Scene with id=${this.id} was deleted.`)
  }
}
module.exports = WeatherScene
