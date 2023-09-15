import { Writable } from 'node:stream';

export class Terminator extends Writable {
  private readonly chunks: Array<Buffer>;

  public constructor() {
    super();
    this.chunks = [];
  }

  public _write(chunk: Buffer, _encoding: unknown, callback: () => void) {
    this.chunks.push(chunk);
    callback();
  }

  public flush() {
    return Buffer.concat(this.chunks);
  }
}
