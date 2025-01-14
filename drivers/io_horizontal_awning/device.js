/* jslint node: true */

'use strict';

const WindowCoveringsDevice = require('../WindowCoveringsDevice');

class HorizontalAwningDevice extends WindowCoveringsDevice
{

	async onInit()
	{
		this.checkLockStateTimer = null;
		this.checkLockSate = this.checkLockSate.bind(this);

		const dd = this.getData();

		this.controllableName = '';
		if (dd.controllableName)
		{
			this.controllableName = dd.controllableName.toString().toLowerCase();
		}

		if (!this.hasCapability('lock_state'))
		{
			this.addCapability('lock_state').catch(this.error);
		}

		await super.onInit();

		if (!this.hasCapability('quick_open'))
		{
			this.addCapability('quick_open').catch(this.error);
		}

		if (this.controllableName === 'ogp:awning')
		{
			this.openClosedStateName = 'core:DeployedUndeployedState'; // Name of the state to get open / closed state

			if (this.invertUpDown)
			{
				// Homey capability to Somfy command map
				this.windowcoveringsActions = {
					up: 'undeploy',
					idle: 'stop',
					down: 'deploy',
				};

				// Somfy state to Homey capability map
				this.windowcoveringsStatesMap = {
					deployed: 'down',
					undeployed: 'up',
				};
			}
			else
			{
				this.windowcoveringsActions = {
					up: 'deploy',
					idle: 'stop',
					down: 'undeploy',
				};

				this.windowcoveringsStatesMap = {
					deployed: 'up',
					undeployed: 'down',
				};
			}
		}

		if (this.controllableName !== 'io:awningvalanceiocomponent')
		{
			// From Anders pull request
			this.setPositionActionName = 'setDeployment';

			if (this.controllableName === 'io:awningreceiverunoiocomponent')
			{
				// No feedback from this device
				this.positionStateName = '';
				this.openClosedStateName = '';
			}
			else
			{
				this.positionStateName = 'core:DeploymentState';
			}
		}

		if ((this.controllableName !== 'io:pergolarailguidedawningiocomponent') && (this.controllableName !== 'io:pergolahorizontalunoiocomponent'))
		{
			if (this.hasCapability('my_position'))
			{
				this.removeCapability('my_position').catch(this.error);
			}
		}
	}

	async onSettings({ oldSettings, newSettings, changedKeys })
	{
		if (changedKeys.indexOf('invertUpDown') >= 0)
		{
			this.invertUpDown = newSettings.invertUpDown;

			if (this.controllableName === 'ogp:awning')
			{
				if (this.invertUpDown)
				{
					// Homey capability to Somfy command map
					this.windowcoveringsActions = {
						up: 'undeploy',
						idle: 'stop',
						down: 'deploy',
					};

					// Somfy state to Homey capability map
					this.windowcoveringsStatesMap = {
						deployed: 'down',
						undeployed: 'up',
					};
				}
				else
				{
					this.windowcoveringsActions = {
						up: 'deploy',
						idle: 'stop',
						down: 'undeploy',
					};

					this.windowcoveringsStatesMap = {
						deployed: 'up',
						undeployed: 'down',
					};
				}
			}
			else
			if (this.invertUpDown)
				{
					this.windowcoveringsActions = {
						up: 'close',
						idle: 'stop',
						down: 'open',
					};

					this.windowcoveringsStatesMap = {
						open: 'down',
						closed: 'up',
						unknown: 'idle',
					};
				}
				else
				{
					this.windowcoveringsActions = {
						up: 'open',
						idle: 'stop',
						down: 'close',
					};

					this.windowcoveringsStatesMap = {
						open: 'up',
						closed: 'down',
						unknown: 'idle',
					};
				}
		}

		if (changedKeys.indexOf('invertTile') >= 0)
		{
			this.invertTile = newSettings.invertTile;
		}

		if (changedKeys.indexOf('invertPosition') >= 0)
		{
			this.invertPosition = newSettings.invertPosition;
		}

		setImmediate(() => this.sync());
	}

	checkLockSate()
	{
		this._checkLockSate();
	}

	async _checkLockSate()
	{
		let tahomaStates = await this.getStates();
		if (tahomaStates)
		{
			// Look for each of the required capabilities
			const lockState = tahomaStates.find((state) => (state && (state.name === 'io:PriorityLockOriginatorState')));
			if (lockState)
			{
				this.setCapabilityValue('lock_state', lockState.value).catch(this.error);
				if (this.driver.triggerLockStateChange)
				{
					const tokens = {
						lock_state: '',
					};
					this.driver.triggerLockStateChange(this, tokens);
				}

				clearTimeout(this.checkLockStateTimer);
				this.checkLockStateTimer = this.homey.setTimeout(this.checkLockSate, (60 * 30000));
			}
			else
			{
				const lockStateTimer = tahomaStates.find((state) => (state && (state.name === 'core:PriorityLockTimerState')));
				if (lockStateTimer)
				{
					if ((lockStateTimer.value === '0') || (lockStateTimer.value === 0))
					{
						this.setCapabilityValue('lock_state', '').catch(this.error);

						if (this.driver.triggerLockStateChange)
						{
							const tokens = {
								lock_state: '',
							};
							this.driver.triggerLockStateChange(this, tokens);
						}
					}
					else
					{
						clearTimeout(this.checkLockStateTimer);
						this.checkLockStateTimer = this.homey.setTimeout(this.checkLockSate, (60 * parseInt(lockStateTimer.value, 10)));
					}
				}
			}

			tahomaStates = null;
		}
	}

}
module.exports = HorizontalAwningDevice;
