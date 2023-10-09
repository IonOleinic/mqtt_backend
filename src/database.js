require('dotenv').config()
const mysql = require('mysql2')

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise()

async function getDevices() {
  const [devices] = await pool.query(`SELECT * FROM devices`)
  return devices
}
async function getDevice(id) {
  try {
    const [result] = await pool.query(`SELECT * FROM devices WHERE id=?`, [id])
    let device = result[0]
    if (device) {
      device.attributes = JSON.parse(device.attributes)
    }
    return device
  } catch (error) {
    throw error
  }
}
async function deleteDevice(id) {
  try {
    const [result] = await pool.query(`DELETE FROM devices WHERE id=?`, [id])
    return id
  } catch (error) {
    throw error
  }
}
async function insertDevice(device) {
  try {
    let name = device.name
      ? device.name
      : 'Device ' + Math.random().toString(16).slice(2, 7)
    const [result] = await pool.query(
      `INSERT INTO devices(name,img,manufacter,mqtt_name,mqtt_group,device_type,favorite,attributes) VALUES (?,?,?,?,?,?,?,?)`,
      [
        name,
        device.img,
        device.manufacter,
        device.mqtt_name,
        device.mqtt_group.toString(),
        device.device_type,
        false,
        JSON.stringify(device.attributes),
      ]
    )
    return result.id
  } catch (error) {
    throw error
  }
}
async function updateDevice(id, updatedDevice) {
  try {
    const [result] = await pool.query(
      `UPDATE devices 
     SET name=?, img=?, manufacter=?, mqtt_name=?, mqtt_group=?, device_type=?, favorite=?
     WHERE id=?`,
      [
        updatedDevice.name,
        updatedDevice.img,
        updatedDevice.manufacter,
        updatedDevice.mqtt_name,
        updatedDevice.mqtt_group.toString(),
        updatedDevice.device_type,
        updatedDevice.favorite,
        id,
      ]
    )
    return id
  } catch (error) {
    throw error
  }
}

module.exports = {
  getDevices,
  getDevice,
  insertDevice,
  updateDevice,
  deleteDevice,
}
