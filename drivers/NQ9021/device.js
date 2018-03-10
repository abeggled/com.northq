'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class PowerMeter_NQ9021 extends ZwaveDevice {
  onMeshInit() {
      this.enableDebug();
      this.printNode();
      this.registerCapability('measure_battery', 'BATTERY', {
          getOpts: {
              getOnOnline: true,
          }
      });
      this.registerCapability('meter_power', 'METER', {
          getOpts: {
              getOnOnline: true,
          }
      });
	
	// define FlowCardAction to reset meter_power
		let NQ9021_reset_meter_run_listener = async(args) => {
			let result = await args.device.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({})
			if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
		};

		let actionNQ9021_reset_meter = new Homey.FlowCardAction('NQ9021_reset_meter');
		actionNQ9021_reset_meter
			.register()
			.registerRunListener(NQ9021_reset_meter_run_listener);
  }

}
module.exports = PowerMeter_NQ9021;
