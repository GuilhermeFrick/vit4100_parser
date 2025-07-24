// src/parsers/vit4100/vit4100PreParser.ts
import { ParsedPreParserResult } from "../../types";

export class Vit4100PreParser {
  static calculateChecksum(data: string): string {
    const checksum = data
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) & 0xff;
    return checksum.toString(16).toUpperCase().padStart(2, "0");
  }

  static buildAck(packNo: string, imei: string): string {
    const ackBase = `$$${packNo}25,${imei},010,1`;
    const checksum = this.calculateChecksum(ackBase);
    return `${ackBase}${checksum}\r\n`;
  }

  static processMessage(data: string, connectionId: string): ParsedPreParserResult | { error: string } {
    try {
      if (!data.startsWith("&&")) {
        throw new Error("Invalid header. Must start with '&&'.");
      }

      const payload = data.slice(2, -4);
      const checksumReceived = data.slice(-4).trim();
      const checksumCalculated = this.calculateChecksum(data.slice(0, -4));

      if (checksumReceived !== checksumCalculated) {
        throw new Error("Invalid checksum.");
      }

      const parts = payload.split(",");
      const packNo = parts[0][0];
      const imei = parts[1];
      const cmdCode = parts[2];

      const ackRequired = ["010", "020"].includes(cmdCode);
      const ack = ackRequired ? this.buildAck(packNo, imei) : undefined;

      return {
        tracker_type: 2,
        imei,
        ack,
        payload,
        cmd_code: cmdCode,
        raw_parts: parts,
        raw_string: data,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
