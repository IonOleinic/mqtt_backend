const mapDeviceToViewModel = (device) => {
  if (!device.is_deleted) {
    return device
  }
}

module.exports = {
  mapDeviceToViewModel,
}
