/* jslint node: true */

'use strict';

const SensorDevice = require('../SensorDevice');

const CapabilitiesXRef = [
    {
        homeyName: 'measure_temperature',
        somfyNameGet: 'core:TemperatureState',
        somfyNameSet: [],
    },
    {
        homeyName: 'measure_temperature.current_target',
        somfyNameGet: 'core:TargetTemperatureState',
        somfyNameSet: [],
    },
    {
        homeyName: 'target_temperature.comfort_heating',
        somfyNameGet: 'core:ComfortRoomTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 0,
    },
    {
        homeyName: 'target_temperature.eco_heating',
        somfyNameGet: 'core:EcoTargetTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 1,
    },
    {
        homeyName: 'target_temperature.away',
        somfyNameGet: 'io:AwayModeTargetTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 2,
    },
    {
        homeyName: 'target_temperature.frost_protection',
        somfyNameGet: 'core:FrostProtectionRoomTemperatureState',
        somfyNameSet: ['setAllModeTemperatures'],
        somfyArray: 3,
    },
    {
        homeyName: 'open_window_activation',
        somfyNameGet: 'core:OpenWindowDetectionActivationState',
        somfyNameSet: ['setValveSettings'],
        compare: ['inactive', 'active'],
        parameters: [{ openWindow: false }, { openWindow: true }],
    },
    {
        homeyName: 'measure_battery',
        somfyNameGet: 'core:BatteryLevelState',
        somfyNameSet: [],
    },
    {
        homeyName: 'valve_heating_mode_state',
        somfyNameGet: 'io:CurrentHeatingModeState',
        somfyNameSet: [],
    },
    {
        homeyName: 'derogation_mode',
        somfyNameGet: 'io:CurrentHeatingModeState',
        somfyNameSet: [],
    },
    {
        homeyName: 'valve_operating_mode_state',
        somfyNameGet: 'core:OperatingModeState',
        somfyNameSet: [],
        conversions: { 'auto (schedule)': 'auto' },
    },
    {
        homeyName: 'valve_auto_mode',
        somfyNameGet: 'core:OperatingModeState',
        somfyNameSet: [0, 'exitDerogation'],
        conversions: { 'auto (schedule)': 'auto' },
        compare: ['inactive', 'auto'],
        parameters: '',
        otherCapability: ['derogation_mode'],
    },
    {
        homeyName: 'derogation_mode',
        somfyNameGet: 'io:DerogationHeatingModeState',
        somfyNameSet: ['setDerogation'],
        somfySetGroup: ['Mode'],
        illegalSetValues: ['manual'],
        illegalAlternative: ['target_temperature.manual'],
        somfyArray: 0,
    },
    {
        homeyName: 'target_temperature.manual',
        somfyNameGet: 'io:ManualModeTargetTemperatureState',
        somfyNameSet: ['setDerogation'],
        somfySetGroup: ['Temperature'],
        somfyArray: 0,
    },
    {
        homeyName: 'derogation_type',
        somfyNameGet: 'io:DerogationTypeState',
        somfyNameSet: ['setDerogation'],
        somfySetGroup: ['Mode', 'Temperature'],
        somfyArray: 1,
    },
    {
        homeyName: 'valve_state',
        somfyNameGet: 'core:OpenClosedValveState',
        somfyNameSet: [],
        compare: ['closed', 'open'],
    },
    {
        homeyName: 'defect_state',
        somfyNameGet: 'core:SensorDefectState',
        somfyNameSet: [],
        allowNull: true,
    },
    {
        homeyName: 'rssi',
        somfyNameGet: 'core:RSSILevelState',
        somfyNameSet: [],
    },
];
class ValveHeatingDevice extends SensorDevice
{

    async onInit()
    {
        this.combineSubURLs = true;
        await super.onInit(CapabilitiesXRef);
        this.boostSync = true;
    }

    async onCapability(capabilityXRef, value, opts)
    {
        if (this.infoLogEnabled)
        {
            this.homey.app.logInformation(this.getName(),
            {
                message: 'onCapability',
                stack: { capabilityXRef, value, opts },
            });
        }

        if (!opts || !opts.fromCloudSync)
        {
            if (typeof (capabilityXRef.somfyArray) === 'undefined')
            {
                // Let the base class handle the standard entries
                super.onCapability(capabilityXRef, value, opts);
                return;
            }

            let applicableEntries = CapabilitiesXRef.filter(entry => entry.somfyNameSet[0] === capabilityXRef.somfyNameSet[0]).sort((a, b) => a.somfyArray - b.somfyArray);

            if (capabilityXRef.somfySetGroup)
            {
                let applicableEntries2 = applicableEntries.filter(entry => (entry.somfySetGroup.indexOf(capabilityXRef.somfySetGroup[0]) >= 0));
                applicableEntries = applicableEntries2;
            }

            const somfyValues = [];
            for (const element of applicableEntries)
            {
                let itemValue = element.homeyName === capabilityXRef.homeyName ? value : this.getCapabilityValue(element.homeyName);
                if (element.illegalSetValues)
                {
                    const idx = element.illegalSetValues.indexOf(itemValue);
                    if (idx >= 0)
                    {
                        // The value is not allowed to be set
                        if (this.hasCapability(element.illegalAlternative[idx]))
                        {
                            itemValue = this.getCapabilityValue(element.illegalAlternative[idx]);
                        }
                        else
                        {
                            itemValue = element.illegalAlternative[idx];
                        }
                    }
                }
                somfyValues.push(itemValue);
            }

            const deviceData = this.getData();
            const idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
            if (idx >= 0)
            {
                try
                {
                    await this.homey.app.cancelExecution(this.executionCommands[idx].id, this.executionCommands[idx].local);
                }
                catch (err)
                {
                    this.homey.app.logInformation(this.getName(),
                    {
                        message: err.message,
                        stack: err.stack,
                    });
                }
                this.executionCommands.splice(idx, 1);
            }

            const action = {
                name: capabilityXRef.somfyNameSet[0],
                parameters: somfyValues,
            };

            try
            {
                const result = await this.homey.app.executeDeviceAction(deviceData.label, deviceData.deviceURL, action, this.boostSync, true);
                if (result)
                {
                    if (result.errorCode)
                    {
                        this.homey.app.logInformation(this.getName(),
                        {
                            message: result.error,
                            stack: result.errorCode,
                        });
                        throw (new Error(result.error));
                    }
                    else
                    {
                        const idx = this.executionCommands.findIndex(element => capabilityXRef.somfyNameSet.indexOf(element.name) >= 0);
                        if (idx < 0)
                        {
                            this.executionCommands.push({ id: result.execId, name: action.name, local: result.local });
                        }
                        else
                        {
                            await this.homey.app.unBoostSync();
                        }
                    }
                }
                else
                {
                    this.homey.app.logInformation(`${this.getName()}: onCapability ${capabilityXRef.somfyNameSet[0]}`, 'Failed to send command');
                    throw (new Error('Failed to send command'));
                }
            }
            catch (err)
            {
                this.homey.app.logInformation(`${this.getName()}: onCapability ${capabilityXRef.somfyNameSet[0]}`, `Failed to send command (${err.message})`);
                throw (err);
            }
        }
        else
        {
            // Let the base class handle the standard entries
            super.onCapability(capabilityXRef, value, opts);
        }
    }

    // Update the capabilities
    async syncEvents(events, local)
    {
        this.syncEventsList(events, CapabilitiesXRef, local);
    }

}

module.exports = ValveHeatingDevice;
