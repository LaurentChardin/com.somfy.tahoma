"use strict";

const Homey = require('homey');
const Driver = require('../Driver');

/**
 * Driver class for the opening detector with the io:SomfyContactIOSystemSensor controllable name in TaHoma
 * @extends {Driver}
 */
class OpeningDetectorDriver extends Driver {

	onInit() {
		this.deviceType = ['io:SomfyContactIOSystemSensor'];

		/*** CONTACT TRIGGERS ***/
		this._triggerContactChange = new Homey.FlowCardTriggerDevice('contact_has_changed').register();
		this._triggerContactChange.registerRunListener((args, state) => {
			return Promise.resolve(true);
		});

		this._triggerContactOpen = new Homey.FlowCardTriggerDevice('contact_has_changed_to_open').register()
		this._triggerContactOpen.registerRunListener((args, state) => {
			let conditionMet = state.alarm_contact == 'open';
			return Promise.resolve(conditionMet);
		});

		this._triggerContactClosed = new Homey.FlowCardTriggerDevice('contact_has_changed_to_closed').register()
		this._triggerContactClosed.registerRunListener((args, state) => {
			let conditionMet = state.alarm_contact == 'closed';
			return Promise.resolve(conditionMet);
		});

		/*** CONTACT CONDITIONS ***/
		this._conditionContactOpen = new Homey.FlowCardCondition('contact_is_open').register();
		this._conditionContactOpen.registerRunListener((args, state) => {
			let device = args.device;
			let conditionMet = device.getState().alarm_contact == 'open';
			return Promise.resolve(conditionMet);
		});

		this._conditionContactClosed = new Homey.FlowCardCondition('contact_is_closed').register();
		this._conditionContactClosed.registerRunListener((args, state) => {
			let device = args.device;
			let conditionMet = device.getState().alarm_contact = 'closed';
			return Promise.resolve(conditionMet);
		});
	}

	/**
	 * Triggers the 'contact change' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
	triggerContactChange(device, tokens, state) {
		this.triggerFlow(this._triggerContactChange, device, tokens, state);
		return this;
	}

	/**
	 * Triggers the 'contact open' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
	triggerContactOpen(device, tokens, state) {
		this.triggerFlow(this._triggerContactOpen, device, tokens, state);
		return this;
	}

	/**
	 * Triggers the 'contact closed' flow
	 * @param {Device} device - A Device instance
	 * @param {Object} tokens - An object with tokens and their typed values, as defined in the app.json
	 * @param {Object} state - An object with properties which are accessible throughout the Flow
	 */
	triggerContactClosed(device, tokens, state) {
		this.triggerFlow(this._triggerContactClosed, device, tokens, state);
		return this;
	}
}

module.exports = OpeningDetectorDriver;