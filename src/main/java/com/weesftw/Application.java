package com.weesftw;

import com.pi4j.Pi4J;
import com.pi4j.context.Context;
import com.pi4j.io.spi.SpiChipSelect;
import lombok.extern.slf4j.Slf4j;

import static com.pi4j.io.spi.SpiBus.BUS_0;

@Slf4j
public class Application {

    public static void main(String[] args) throws Exception {
        System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", "TRACE");
        Context context = Pi4J.newAutoContext();

        var ads1256 = new ADS1256(5.0, (short) 8, BUS_0, context, SpiChipSelect.CS_0);
        ads1256.displayADS1256State(true, (short) 0);
    }
}
