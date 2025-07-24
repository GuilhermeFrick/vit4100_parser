// src/commandBuilder.ts

export class Vit4100CommandBuilder {
  private static currentPackNo = 0x3A; // Valor inicial do ciclo

  /**
   * Gera o próximo `pack-no` ciclicamente entre 0x3A e 0x7E.
   */
  private static getNextPackNo(): string {
    const packNo = this.currentPackNo;
    this.currentPackNo += 1;
    if (this.currentPackNo > 0x7E) {
      this.currentPackNo = 0x3A;
    }
    return String.fromCharCode(packNo);
  }

  /**
   * Calcula o checksum somando os valores ASCII e aplicando `& 0xFF`.
   * Retorna uma string hexadecimal com dois dígitos.
   */
  public static calculateChecksum(data: string): string {
    const checksum = data
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) & 0xFF;

    return checksum.toString(16).toUpperCase().padStart(2, '0');
  }

  /**
   * Constrói o comando VIT4100 para envio ao dispositivo.
   * @param imei - número do IMEI do rastreador
   * @param cmdCode - código do comando (ex: '005')
     * @param cmdData - dados opcionais
   * @returns pacote completo como string ASCII com `\\r\\n`
   */
  public static buildCommand(imei: string, cmdCode: string, cmdData: string = ''): string {
    const packNo = this.getNextPackNo();
    const cmdDataSegment = cmdData ? `,${cmdData}` : '';
    const packLen = `,${imei},${cmdCode}${cmdDataSegment}`.length;

    const baseData = `$$${packNo}${packLen},${imei},${cmdCode}${cmdDataSegment}`;
    const checksum = this.calculateChecksum(baseData);

    return `${baseData}${checksum}\r\n`;
  }
}
