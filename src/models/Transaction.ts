export class Transaction {
  constructor(Fee: number, Id?: BigInt, ValidTo?: Date, Data?: Buffer) {
    this.Fee = Fee;
    this.Id = Id;
    this.ValidTo = ValidTo;
    this.Data = Data;
  }
  public Fee: number;
  public Id?: BigInt;
  public ValidTo?: Date;
  public Data?: Buffer;
}