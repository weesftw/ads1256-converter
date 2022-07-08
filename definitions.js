export default class Definitions {

  static get CMD_WAKEUP() {
    return 0x00;
  }

  static get CMD_RDATA() {
    return 0x01;
  }

  static get CMD_RDATAC() {
    return 0x03;
  }

  static get CMD_SDATAC() {
    return 0x0F;
  }

  static get CMD_RREG() {
    return 0x10;
  }

  static get CMD_WREG() {
    return 0x50;
  }

  static get CMD_SELFCAL() {
    return 0xF0;
  }

  static get CMD_SELFOCAL() {
    return 0xF1;
  }

  static get CMD_SELFGCAL() {
    return 0xF2;
  }

  static get CMD_SYSOCAL() {
    return 0xF3;
  }

  static get CMD_SYSGCAL() {
    return 0xF4;
  }

  static get CMD_SYNC() {
    return 0xFC;
  }

  static get CMD_STANDBY() {
    return 0xFD;
  }

  static get CMD_RESET() {
    return 0xFE;
  }

  static get REG_STATUS() {
    return 0x00;
  }

  static get REG_MUX() {
    return 0x01;
  }

  static get REG_ADCON() {
    return 0x02;
  }

  static get REG_DRATE() {
    return 0x03;
  }

  static get REG_IO() {
    return 0x04;
  }

  static get REG_OFC0() {
    return 0x05;
  }

  static get REG_OFC1() {
    return 0x06;
  }

  static get REG_OFC2() {
    return 0x07;
  }

  static get REG_FSC0() {
    return 0x08;
  }

  static get REG_FSC1() {
    return 0x09;
  }

  static get REG_FSC2() {
    return 0x0A;
  }

  static get NUM_REG() {
    return 11;
  }

}
