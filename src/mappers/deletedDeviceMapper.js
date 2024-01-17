const mapDeletedDeviceToViewModel = (device) => {
  return {
    ...device.attributes,
    ...device,
  }
}

module.exports = {
  mapDeletedDeviceToViewModel,
}
