class Horizon_IR {
  constructor() {
    this.buttons = [
      { name: 'btn_power', code: '0xC' },
      { name: 'btn_ok', code: '0x35' },
      { name: 'btn_up', code: '0x14' },
      { name: 'btn_right', code: '0x16' },
      { name: 'btn_left', code: '0x15' },
      { name: 'btn_down', code: '0x13' },
      { name: 'btn_volUp', code: '0x10' },
      { name: 'btn_volDown', code: '0x11' },
      { name: 'btn_chnDown', code: '0x21' },
      { name: 'btn_chnUp', code: '0x20' },
      { name: 'btn_exit', code: '0x25' },
      { name: 'btn_mute', code: '0xD' },
      { name: 'btn_home', code: '0x30' },
      { name: 'btn_back', code: '0xA' },
      { name: 'btn_input', code: '0x38' },
      { name: 'btn_0', code: '0x0' },
      { name: 'btn_1', code: '0x1' },
      { name: 'btn_2', code: '0x2' },
      { name: 'btn_3', code: '0x3' },
      { name: 'btn_4', code: '0x4' },
      { name: 'btn_5', code: '0x5' },
      { name: 'btn_6', code: '0x6' },
      { name: 'btn_7', code: '0x7' },
      { name: 'btn_8', code: '0x8' },
      { name: 'btn_9', code: '0x9' },
    ]
    this.protocol = 'RC5'
    this.bits = '0x1'
  }
}
module.exports = Horizon_IR
