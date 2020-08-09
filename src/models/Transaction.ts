export class Transaction {
  public Fee: number;
  public Id?: BigInt;
  public ValidTo?: Date;
  public Data?: Buffer;
  constructor(fee: number, id?: BigInt, validTo?: Date, data?: Buffer) {
    this.Fee = fee;
    this.Id = id;
    this.ValidTo = validTo;
    this.Data = data;
  }
}
