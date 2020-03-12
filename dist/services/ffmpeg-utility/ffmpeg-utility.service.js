"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
let FfmpegUtilityService = class FfmpegUtilityService {
    constructor() {
        this.globalFilesCount = 0;
    }
    async convertStereo2Mono(parentFolderAddr, fileName, finalCallBack) {
        if (parentFolderAddr && fs.existsSync(parentFolderAddr)) {
            const response = await this.startS2MConversion(parentFolderAddr, fileName, finalCallBack);
            return response;
        }
        else {
            return { ok: false, error: 'parentFolderAddress does not seem to be valid one' };
        }
    }
    startS2MConversion(folderAddress, filenameToUse, finalCallBack) {
        console.log('folder to scan stereo files is ', folderAddress);
        if (filenameToUse) {
            console.log('specifically convert file ', filenameToUse);
            this.runProcess(folderAddress, filenameToUse, null, finalCallBack);
        }
        else {
            fs.readdir(folderAddress, (err, dirItems) => {
                if (err) {
                    console.log('Unable to scan directory for wav stereo files', err);
                    return { ok: false, error: 'Unable to scan directory for wav stereo files' };
                }
                let originalWAVFilesCount = 0;
                console.log('orignalWavCount set to ', originalWAVFilesCount);
                const wavFiles = [];
                dirItems.forEach(item => {
                    const itemAddress = path.resolve(folderAddress, item);
                    if (fs.lstatSync(itemAddress).isFile()) {
                        if (path.extname(itemAddress) === '.wav') {
                            originalWAVFilesCount += 1;
                            wavFiles.push(item);
                        }
                    }
                });
                this.globalFilesCount = 0;
                console.log('wav files detected inside the parent folder are ', wavFiles);
                wavFiles.forEach((fileName) => {
                    this.runProcess(folderAddress, fileName, originalWAVFilesCount, finalCallBack);
                });
            });
        }
    }
    async runProcess(parentFolderName, fileName, originalFilesCount, finalCallBack) {
        const commadToExecute = 'ffmpeg';
        const args = [
            '-i',
            fileName,
            '-ac', '1',
            `mono_${fileName}`,
        ];
        const proc = child_process_1.spawn(commadToExecute, args, { cwd: parentFolderName, env: Object.assign({}, process.env) });
        proc.stdout.on('data', (data) => {
            console.log('conversion output data', data.toString());
        });
        proc.stderr.on('data', (data) => {
            console.log('conversion stdErr data ', data.toString());
        });
        proc.on('close', async () => {
            const verifiedFileRes = await this.verifyConvertedFile(parentFolderName, fileName);
            if (verifiedFileRes) {
                console.log('triggering check mono files');
                if (originalFilesCount == null) {
                    console.log('specific file pickup initiated');
                    console.log('it is finished till now');
                    if (finalCallBack) {
                        console.log('verfication callback present');
                        finalCallBack();
                    }
                    else {
                        console.log('proceed to google speech to text');
                    }
                }
                else {
                    console.log('originalFilesCount is present');
                    this.checkMonoFilesCount(parentFolderName, originalFilesCount, async (err, res) => {
                        if (res && !err) {
                            this.moveProcessedFile(parentFolderName).then(moved => {
                                if (moved['ok']) {
                                    console.log('All files are properly converted and moved');
                                    if (finalCallBack) {
                                        console.log('verfication callback present');
                                        finalCallBack();
                                    }
                                    else {
                                        console.log('proceed to google speech to text');
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
        proc.on('error', (data) => {
            console.log('conversion error ', data);
        });
    }
    moveProcessedFile(fileNamePath) {
        return Promise.resolve({ ok: true });
    }
    verifyConvertedFile(parentDir, originalFileName) {
        const monoFileName = `mono_${originalFileName}`;
        const monoFileAddr = path.resolve(parentDir, monoFileName);
        const originalFileAddr = path.resolve(parentDir, originalFileName);
        if (fs.existsSync(monoFileAddr)) {
            const parentDirName = path.basename(parentDir);
            const processedFolderAddress = path.resolve(parentDir, '../', 'processed');
            if (!fs.existsSync(processedFolderAddress)) {
                fs.mkdirSync(processedFolderAddress);
            }
            const processedParentFolder = path.resolve(processedFolderAddress, parentDirName);
            if (!fs.existsSync(processedParentFolder)) {
                fs.mkdirSync(processedParentFolder);
            }
            const processedFilePath = path.resolve(processedParentFolder, originalFileName);
            console.log(`moving file from \n${originalFileAddr} ----> ${processedFilePath}`);
            fs.renameSync(originalFileAddr, processedFilePath);
            this.globalFilesCount += 1;
            const newMonoFolderAddress = path.resolve(parentDir, 'mono');
            if (!fs.existsSync(newMonoFolderAddress)) {
                fs.mkdirSync(newMonoFolderAddress);
            }
            console.log(`moving file from \n${path.resolve(monoFileAddr)} ----> ${path.resolve(newMonoFolderAddress, monoFileName)}`);
            fs.renameSync(path.resolve(monoFileAddr), path.resolve(newMonoFolderAddress, monoFileName));
            return Promise.resolve(true);
        }
        else {
            console.error(`COULD NOT CONVERT ${originalFileName} TO MONO FOR SOME REASON`);
            return Promise.resolve(false);
        }
    }
    checkMonoFilesCount(directoryAddr, originalFilesCount, cb) {
        console.log('recieved global file count as ', this.globalFilesCount);
        if (originalFilesCount === this.globalFilesCount) {
            console.log('Conversion is completed, verifying converted files');
            const totalFilesPresent = fs.readdirSync(directoryAddr);
            if (totalFilesPresent.length === originalFilesCount) {
                console.log('verified');
                cb(null, true);
            }
            else {
                console.log('An error occured while successfully processing one of the files, check manually');
                cb(true, null);
            }
        }
        else {
            console.log('original files count does not match with converted files count');
        }
    }
};
FfmpegUtilityService = __decorate([
    common_1.Injectable()
], FfmpegUtilityService);
exports.FfmpegUtilityService = FfmpegUtilityService;
//# sourceMappingURL=ffmpeg-utility.service.js.map