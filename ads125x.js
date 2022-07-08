import { Gpio } from 'onoff';
import spi from 'spi-device';
import Promise from 'bluebird';
import Definitions from './definitions';

export class ADS125x {

  /**
   * constructor - ADS125x
   *
   * @param  {object} config
   * @param  {number} config.csPin Chip Select pin number.
   * @param  {number} config.drdyPin data ready pin
   * @param  {number} config.pdwnPin power down pin number
   * @param  {number} config.resetPin reset pin number
   * @param  {number} [config.clkinFrequency=7680000] Voltage reference impedance (hZ).
   * @param  {number} [config.drdyDelay=.000001] Delay in seconds to avoid busy
   * wait and reduce CPU load when polling the DRDY pin.
   * @param  {number} [config.drdyTimeout=2] Seconds to wait in case DRDY pin is
   *  not connected or the chip does not respond
   * @param  {number} config.spiChannel SPI channel
   * @param  {number} [config.spiFrequency=976563] SPI clock rate (hZ).
   * @param  {number} [config.spiMode=1] SPI Mode
   * @param  {number} [config.vRef=2.5] Reference voltage.
   * @return {ADS125x}        description
   */
  constructor(config) {
    const self = this;

    self.spiChannel = config.spiChannel;
    self.drdyTimeout = config.drdyTimeout || 2;
    self.drdyDelay = config.drdyDelay || 0.000001;

    if (!config.spiChannel) {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    const defaults = {
      clkinFrequency: 7680000,
      spiFrequency: 976563,
      spiMode: 1,
      vRef: 2.5,
    };

    const conf = Object.assign({}, defaults, config);

    self.drdy = new Gpio(config.drdyPin, 'in', 'falling');

    process.on('SIGINT', () => self.drdy.unexport());

    self.chipSelect = new Gpio(config.csPin, 'high');
    self.resetGpio = new Gpio(config.resetPin, 'high');
    self.pdwnGpio = new Gpio(config.pdwnPin, 'high');

    // TODO: add way to set these options as well
    const spiDeviceOpts = {
      mode: spi.MODE1,
      maxSpeedHz: conf.spiFrequency,
      noChipSelect: true,
    };

    this.device = spi.openSync(0, conf.spiChannel, spiDeviceOpts);
    this.device = Promise.promisifyAll(this.device);

    self._dataTimeoutUs = Math.ceil(1 + ((50 * 1000000) / conf.clkinFrequency));
    self._syncTimeoutUs = Math.ceil(1 + ((24 * 1000000) / conf.clkinFrequency));
    self._csTimeoutUs = Math.ceil(1 + ((8 * 1000000) / conf.clkinFrequency));
    self._t11TimeoutUs = Math.ceil(1 + ((4 * 1000000) / conf.clkinFrequency));

    setTimeout(() => self.waitDRDY().then(() => self.reset()), 30);
  }

  calibrateSelf() {
    const self = this;
    return this._chipSelect()
      .then(() => self._sendMessage([Definitions.CMD_SELFCAL]))
      .then(() => self.waitDRDY())
      .then(() => self._chipRelease());
  }

  /**
   * _chipRelease - Private chip release
   *
   * @return {Promise}
   */
  _chipRelease() {
    const self = this;
    return new Promise(resolve => self.chipSelect.write(1, resolve));
  }

  /**
   * _chipSelect - Private chip select
   *
   * @return {Promise}
   */
  _chipSelect() {
    const self = this;
    return new Promise(resolve => self.chipSelect.write(0, resolve));
  }

  read(diffChannel) {
    const self = this;
    return self._chipSelect()
      .then(() => {
        const bytes = [Definitions.CMD_WREG | Definitions.REG_MUX, 0x00, diffChannel];
        return self._sendMessage(bytes);
      })
      .then(() => (
        self._sendMessage([Definitions.CMD_SYNC], { delayMicroseconds: self._syncTimeoutUs })
      ))
      .then(() => self._sendMessage([Definitions.CMD_WAKEUP]))
      .then(() => self.waitDRDY())
      .then(() => (
        self._sendMessage([Definitions.CMD_RDATA], { delayMicroseconds: self._dataTimeoutUs })
      ))
      .then(() => {

        const message = {
          byteLength: 3,
          receiveBuffer: Buffer.alloc(3),
        };

        return this.device.transferAsync([message]);
      })
      .then(received => (
        self._chipRelease()
          .then(() => {
            const rb = received[0].receiveBuffer;
            const msb = rb[0];
            const midb = rb[1];
            const lsb = rb[2];
            return (msb << 16) | (midb << 8) | lsb;
          })
      ));
  }

  reset() {
    const self = this;
    return this._chipSelect()
      .then(() => self._sendMessage([Definitions.CMD_RESET]))
      .then(() => self.waitDRDY())
      .then(() => self._chipRelease());
  }

  _sendMessage(bytes, options) {
    let message = {
      sendBuffer: Buffer.from(bytes),
      byteLength: bytes.length,
    };
    message = Object.assign(message, options || {});
    return this.device.transferAsync([message]);
  }

  wakeup() {
    const self = this;
    return this._chipSelect()
      .then(() => self._sendMessage([Definitions.CMD_WAKEUP]))
      .then(() => self.waitDRDY())
      .then(() => self._chipRelease());
  }

  waitDRDY() {
    let drdyCallback;
    return new Promise((resolve) => {
      drdyCallback = (err, value) => {
        if (err) {
          console.error(err);
        }

        // NOTE: the value should always be 0 because we have set the GPIO edge to "falling".
        // However, we do still seem mto get "rising" edge values (1). I assume this may be because
        // our onOff dependency is a little out of date.
        // Need to address this.
        if (value === 0) {
          resolve();
        }
      };
      this.drdy.watch(drdyCallback);
    })
      .then(() => this.drdy.unwatch(drdyCallback));
  }
}
