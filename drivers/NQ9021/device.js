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
              pollInterval: 840000            
          },
          getParserV2: () => ({
              Properties1: {
                  Scale: 0,
              },
          }),
          getParserV4: () => ({
              Properties1: {
                  'Rate Type': 'Import',
                  Scale: 0,
              },
              'Scale 2': 0,
          }),
          report: 'BASIC_REPORT',
          reportParserV1: report => {
              if (report &&
                  report.hasOwnProperty('Meter Type') &&
                  (report['Meter Type'] === 'Electric meter' || report['Meter Type'] === 1) &&
                  report.hasOwnProperty('Properties1') &&
                  report.Properties1.hasOwnProperty('Scale') &&
                  report.Properties1.Scale === 0) {
                  return report['Meter Value (Parsed)'];
              }
              return null;
          },
          reportParserV2: report => {
              if (report &&
                  report.hasOwnProperty('Properties1') &&
                  report.Properties1.hasOwnProperty('Meter Type') &&
                  (report.Properties1['Meter Type'] === 'Electric meter' || report.Properties1['Meter Type'] === 1) &&
                  report.hasOwnProperty('Properties2') &&
                  report.Properties2.hasOwnProperty('Scale') &&
                  report.Properties2.Scale === 0) {
                  return report['Meter Value (Parsed)'];
              }
              return null;
          },
          reportParserV3: report => {
              if (report &&
                  report.hasOwnProperty('Properties1') &&
                  report.Properties1.hasOwnProperty('Meter Type') &&
                  (report.Properties1['Meter Type'] === 'Electric meter' || report.Properties1['Meter Type'] === 1) &&
                  report.Properties1.hasOwnProperty('Scale bit 2') &&
                  report.Properties1['Scale bit 2'] === false &&
                  report.hasOwnProperty('Properties2') &&
                  report.Properties2.hasOwnProperty('Scale bits 10') &&
                  report.Properties2['Scale bits 10'] === 0) {
                  return report['Meter Value (Parsed)'];
              }
              return null;
          },

      });

      // register a report listener
      this.registerReportListener('BASIC', 'BASIC_REPORT', (rawReport, parsedReport) => {
          console.log('registerReportListener', rawReport, parsedReport);
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
