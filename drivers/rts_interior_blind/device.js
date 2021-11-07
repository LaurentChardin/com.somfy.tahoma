/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

/**
 * Device class for exterior venetian blinds with the rts:BlindRTSComponent, rts:HorizontalAwningRTSComponent and rts:RollerShutterRTSComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class InteriorBlindDevice extends WindowCoveringsDevice {

    async onInit() {
        if (this.hasCapability('lock_state'))
        {
            this.removeCapability('lock_state').catch(this.error);
        }

        if (!this.hasCapability('my_position'))
        {
            this.addCapability('my_position').catch(this.error);
        }

        await super.onInit();

        this.positionStateName = '';
        this.openClosedStateName = '';
        this.boostSync = true;
    }

    async sync() {
        // No states are available so no need to call anything
    }

}

module.exports = InteriorBlindDevice;
