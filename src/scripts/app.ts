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
        let filePath = `${directory}/${file}`;

        if (fs.lstatSync(filePath).isFile()) {
            const result = processFile(filePath);
            promises.push(result);
        }
    })

    return Promise.all(promises);
}

function fileHashExists(hash: string, fileHashes: FileHash[]): boolean {
    return fileHashes.findIndex(f => f.hash === hash) !== -1;
}

function getFilename(filePath: string): string {
    return filePath.split("/").pop();
}

function moveDuplicate(fileHash: FileHash, destination: string) {
    let oldFilePath = fileHash.file;
    let newFilePath = `${destination}/${getFilename(fileHash.file)}`;
    fs.renameSync(oldFilePath, newFilePath);

    console.log(`Moved the duplicate file: ${oldFilePath} to ${newFilePath}.`);
}

const args = process.argv.slice(2);
const srcDir = args[0];
const dstDir = `${srcDir}/dups`;

if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir);
}

(async () => {
    const unique: FileHash[] = [];
    const duplicate: FileHash[] = [];

    const md5Files = await fetchFileHashes(srcDir);

    md5Files.forEach(fileHash => {
        if (fileHashExists(fileHash.hash, unique)) {
            duplicate.push(fileHash);
            moveDuplicate(fileHash, dstDir);
        } else {
            unique.push(fileHash);
        }
    })

    console.log(`Processed ${md5Files.length} file(s).`);
    console.log(`Moved ${duplicate.length} duplicate file(s).`);
})();
