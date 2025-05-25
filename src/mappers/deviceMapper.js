const mapDeviceToViewModel = (device) => {
  if (device.is_deleted) {
    return {
      ...device,
      ...device.attributes,
      sensor_update_interval_id: undefined,
      heartbeat_interval_id: undefined,
    }
  }
  return {
    ...device,
    sensor_update_interval_id: undefined,
    heartbeat_interval_id: undefined,
  }
}

module.exports = {
  mapDeviceToViewModel,
}
