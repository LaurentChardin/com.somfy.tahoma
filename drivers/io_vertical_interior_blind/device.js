'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for horizontal awnings with the io:HorizontalAwningIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class HorizontalAwningDevice extends WindowCoveringsDevice {

  async onInit() {
    super.onInit();

    if (!this.hasCapability("quick_open")) {
      this.addCapability("quick_open");
    }
  }
}

module.exports = HorizontalAwningDevice;