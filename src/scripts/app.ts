import * as fs from 'fs';
import * as md5 from 'md5-file';

class FileHash {
    private readonly _file: string;
    private readonly _hash: string;

    constructor(file: string, hash: string) {
        this._file = file;
        this._hash = hash;
    }

    get file(): string {
        return this._file;
    }

    get hash(): string {
        return this._hash;
    }
}

async function processFile(file: string): Promise<FileHash> {
    const hash = await md5(file);
    return new FileHash(file, hash);
}

async function fetchFileHashes(directory: string): Promise<FileHash[]> {
    const promises: Promise<FileHash>[] = [];

    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const result = processFile(`${directory}/${file}`);
        promises.push(result);
    })

    return Promise.all(promises);
}

const args = process.argv.slice(2);
const srcDir = args[0];

fetchFileHashes(srcDir).then(md5Files => {
    console.log(md5Files.length);
})
