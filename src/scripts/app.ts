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

const args = process.argv.slice(2);
const srcDir = args[0];

fs.readdir(srcDir, (err, files) => {
    files.forEach(file => {
        processFile(`${srcDir}/${file}`).then(fileHash => {
            console.log(fileHash);
        })
    });
})
