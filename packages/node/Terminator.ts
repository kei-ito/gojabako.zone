import * as stream from 'stream';
import {Buffer} from 'buffer';

export class Terminator extends stream.Writable {

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

    public flushAsString() {
        return `${this.flush()}`.trim();
    }

}
