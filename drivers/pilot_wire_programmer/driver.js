/* jslint node: true */

'use strict';

const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the ovp:SomfyPilotWireHeatingInterfaceOVPComponent controllable name in TaHoma
 * @extends {Driver}
 */
class PilotWireProgrammerDriver extends Driver
{

	async onInit()
	{
		this.deviceType = ['ovp:SomfyPilotWireHeatingInterfaceOVPComponent'];
		this.heating_mode_changed = this.homey.flow.getDeviceTriggerCard('heating_mode_changed');
	}

}

module.exports = PilotWireProgrammerDriver;
