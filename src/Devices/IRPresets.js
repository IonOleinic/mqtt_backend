class Horizon_IR {
  constructor() {
    this.buttons = [
      { fullName: 'Power', name: 'btn_power', code: '0xC' },
      { fullName: 'OK', name: 'btn_ok', code: '0x35' },
      { fullName: 'Up', name: 'btn_up', code: '0x14' },
      { fullName: 'Right', name: 'btn_right', code: '0x16' },
      { fullName: 'Left', name: 'btn_left', code: '0x15' },
      { fullName: 'Down', name: 'btn_down', code: '0x13' },
      { fullName: 'Vol+', name: 'btn_volUp', code: '0x10' },
      { fullName: 'Vol-', name: 'btn_volDown', code: '0x11' },
      { fullName: 'CH-', name: 'btn_chnDown', code: '0x21' },
      { fullName: 'CH+', name: 'btn_chnUp', code: '0x20' },
      { fullName: 'Exit', name: 'btn_exit', code: '0x25' },
      { fullName: 'Mute', name: 'btn_mute', code: '0xD' },
      { fullName: 'Home', name: 'btn_home', code: '0x30' },
      { fullName: 'Back', name: 'btn_back', code: '0xA' },
      { fullName: 'Input', name: 'btn_input', code: '0x38' },
      { fullName: '0', name: 'btn_0', code: '0x0' },
      { fullName: '1', name: 'btn_1', code: '0x1' },
      { fullName: '2', name: 'btn_2', code: '0x2' },
      { fullName: '3', name: 'btn_3', code: '0x3' },
      { fullName: '4', name: 'btn_4', code: '0x4' },
      { fullName: '5', name: 'btn_5', code: '0x5' },
      { fullName: '6', name: 'btn_6', code: '0x6' },
      { fullName: '7', name: 'btn_7', code: '0x7' },
      { fullName: '8', name: 'btn_8', code: '0x8' },
      { fullName: '9', name: 'btn_9', code: '0x9' },
    ]
    this.protocol = 'RC5'
    this.bits = '0x1'
  }
}
module.exports = Horizon_IR
