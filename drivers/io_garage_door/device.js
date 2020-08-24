'use strict';

const WindowCoveringsDevice = require( '../WindowCoveringsDevice' );

/**
 * Device class for exterior venetian blinds with the io:ExteriorVenetianBlindIOComponent controllable name in TaHoma
 * @extends {WindowCoveringsDevice}
 */
class InteriorBlindDevice extends WindowCoveringsDevice
{
    onInit()
    {
        super.onInit();

        // From Anders pull request
        this.closureStateName = 'core:ClosureState';
    }
}

module.exports = InteriorBlindDevice;