package com.weesftw;

import com.pi4j.context.Context;
import com.pi4j.io.exception.IOException;
import com.pi4j.io.spi.Spi;
import com.pi4j.io.spi.SpiBus;
import com.pi4j.io.spi.SpiChipSelect;
import com.pi4j.io.spi.SpiMode;
import com.pi4j.plugin.pigpio.provider.spi.PiGpioSpiProvider;
import com.pi4j.util.Console;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Slf4j
public class ADS1256 {

    private short channel;
    private final double vref;
    private final short pinCount; // ADC channel count | ADS1256=8

    private final Spi spi;
    private final Console console;
    private final SpiBus spiBus;
    private final Context context;
    private final SpiChipSelect chipSelect;

    private boolean doallChannels = false; // file

    public ADS1256(double vref, short pinCount, SpiBus spiBus, Context context, SpiChipSelect chipSelect) {
        this.vref = vref;
        this.pinCount = pinCount;
        this.spiBus = spiBus;
        this.context = context;
        this.chipSelect = chipSelect;
        this.console = new Console();

        this.spi = this.context.create(
                Spi.newConfigBuilder(context)
                        .id("SPI" + spiBus + " " + chipSelect)
                        .name("A/D converter")
                        .bus(spiBus)
                        .chipSelect(chipSelect)
                        .baud(Spi.DEFAULT_BAUD)
                        .mode(SpiMode.MODE_0)
                        .provider(PiGpioSpiProvider.ID)
                        .build());
    }

    public void displayADS1256State(boolean allChannels, short channel) throws InterruptedException, IOException {
        this.channel = channel;
        this.doallChannels = allChannels;
        // allow for user to exit program using CTRL-C
        console.promptForExit();
        if (this.doallChannels) {
            log.debug(">>> Enter displayMCP3008State  allChannels  : " + allChannels);
        } else {
            log.debug(">>> Enter displayMCP3008State  channel  : " + this.channel);
        }


        // This SPI example is using the Pi4J SPI interface to communicate with
        // the SPI hardware interface connected to a MCP3004/MCP3008 AtoD Chip.
        //
        // Please make sure the SPI is enabled on your Raspberry Pi via the
        // raspi-config utility under the advanced menu option.
        //
        // see this blog post for additional details on SPI and WiringPi
        // http://wiringpi.com/reference/spi-library/
        //
        // see the link below for the data sheet on the MCP3004/MCP3008 chip:
        // https://www.ti.com/lit/gpn/ads1256


        // continue running program until user exits using CTRL-C
        while (console.isRunning()) {
            read(this.doallChannels, this.channel);
            Thread.sleep(1000);
        }
        console.emptyLine();
        log.debug("<<< Exit displayMCP3008State");
    }

    /**
     * Read data via SPI bus from ADS1256 chip.
     *
     * @throws IOException
     */
    public void read(boolean doallChannels, short thisChannel) throws IOException, InterruptedException {
        log.debug(">>> Enter read ");
        if (doallChannels) {
            for (short channel = 0; channel < this.pinCount; channel++) {
                int conversion_value = getConversionValue(channel);
                log.debug("Channel  :" + channel + "  value  :" + String.format(" | %04d", conversion_value)); // print
                Thread.sleep(500);
                // 4
                // digits
                // with
                // leading
                // zeros
            }
        } else {
            int conversion_value = getConversionValue(thisChannel);
            log.debug("Channel  :" + channel + "  value  :" + String.format(" | %04d", conversion_value)); // print
        }
        log.debug(" |\r");
        Thread.sleep(1000);
        log.debug("<<< Exit read");
    }

    /**
     * Communicate to the ADC chip via SPI to get single-ended conversion value
     * for a specified channel.
     *
     * @param channel analog input channel on ADC chip
     * @return conversion value for specified analog input channel
     * @throws IOException
     */
    public int getConversionValue(short channel) throws IOException {
        log.debug(">>> Enter getConversionValue  channel : " + channel);

        // create a data buffer and initialize a conversion request payload
        byte[] data = new byte[]{(byte) 0b00000001, // first byte, start bit
                (byte) (0b10000000 | (((channel & 7) << 4))), // second byte
                // transmitted
                // -> (SGL/DIF =
                // 1,
                // D2=D1=D0=0)
                (byte) 0b00000000 // third byte transmitted....don't care
        };

        // send conversion request to ADC chip via SPI channel
        //int bytesWritten = this.spi.write(data);
        byte[] value = new byte[3];
        int bytesRead = this.spi.transfer(data, 0, value, 0, 3);

        // calculate and return conversion value from result bytes
        int result = (value[1] << 8) & 0b1100000000; // merge value[1] & value[2]
        // to get 10-bit result
        result |= (value[2] & 0xff);
        log.info("Channel : " + channel + "   Bytes read : " + bytesRead + "  Value : " + result);
        if (this.vref > 0) {
            log.info("A/D read input voltage : " + ((result * this.vref) / 1024 + " \n"));
        }
        log.debug("<<< Exit getConversionValue ");

        return result;
    }
}
