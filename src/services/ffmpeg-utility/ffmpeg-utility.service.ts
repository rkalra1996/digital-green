import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from 'child_process';
import { Logger } from 'winston';
@Injectable()
export class FfmpegUtilityService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
    ) {}

    public globalFilesCount = 0;
    /**
     * Converts stereo2 mono
     * @description The method will take input of folder where one or more audio files are present
     * and convert each of them into mono channel audios
     */
    async convertStereo2Mono(parentFolderAddr, fileName?: string, finalCallBack?: any) {
        if (parentFolderAddr && fs.existsSync(parentFolderAddr)) {
            // address is ok, proceed further
            const response = await this.startS2MConversion(parentFolderAddr, fileName, finalCallBack);
            return response;
        } else {
            return {ok: false, error: 'parentFolderAddress does not seem to be valid one'};
        }
    }

    startS2MConversion(folderAddress, filenameToUse?: string, finalCallBack?: any) {
        this.logger.info('folder to scan stereo files is ' + folderAddress);
        // resolve with true if all the files are converted else resolve with false
        // pick files one by one and convert them
        if (filenameToUse) {
            // file name is given
            this.logger.info('specifically convert file ' + filenameToUse);
            this.runProcess(folderAddress, filenameToUse, null, finalCallBack);
        } else {
            fs.readdir(folderAddress, (err, dirItems) => {
                // handling error
                if (err) {
                    this.logger.info('Unable to scan directory for wav stereo files');
                    this.logger.error(err);
                    return {ok: false, error: 'Unable to scan directory for wav stereo files'};
                }
                // listing all files using forEach
                // count the wav files present in the directory (only wav files, ignore every other file)
                let originalWAVFilesCount = 0;
                this.logger.info('orignalWavCount set to ' + originalWAVFilesCount);
                const wavFiles = [];
                dirItems.forEach(item => {
                    const itemAddress = path.resolve(folderAddress, item);
                    if ( fs.lstatSync(itemAddress).isFile()) {
                        // check if it is a wav file
                        if (path.extname(itemAddress) === '.wav') {
                            originalWAVFilesCount += 1;
                            wavFiles.push(item);
                        }
                    }
                });
                this.globalFilesCount = 0;
                this.logger.info('wav files detected inside the parent folder are ' + JSON.stringify(wavFiles));
                wavFiles.forEach((fileName) => {
                    // execute the conversion command
                    this.runProcess(folderAddress, fileName, originalWAVFilesCount, finalCallBack);
                });
            });
        }
    }

    async runProcess(parentFolderName, fileName, originalFilesCount?: number, finalCallBack?: any) {
        const commadToExecute = 'ffmpeg';

        const args = [
            '-i',
            fileName,
            '-ac', '1',
            `mono_${fileName}`,
        ];

        const proc = spawn(commadToExecute, args, {cwd: parentFolderName, env: {...process.env}});

        proc.stdout.on('data', (data) => {
            this.logger.info('conversion output data' + data.toString());
        });

        proc.stderr.on('data', (data) => {
            this.logger.info('conversion stdErr data ' + data.toString());
        });

        proc.on('close', async () => {
            // check if the file is created successfully, if yes, delete the original else prompt error
            const verifiedFileRes = await this.verifyConvertedFile(parentFolderName, fileName);
            if (verifiedFileRes) {
                this.logger.info('triggering check mono files');
                if (originalFilesCount == null) {
                    this.logger.info('specific file pickup initiated');
                    this.logger.info('it is finished till now');
                    if (finalCallBack) {
                        this.logger.info('verfication callback present');
                        finalCallBack();
                    } else {
                        this.logger.info('proceed to google speech to text');
                    }
                    /* this.moveProcessedFile(parentFolderName,fileName).then(moved => {
                        if (moved['ok']) {
                            console.log('All files are properly converted and moved');
                            if (finalCallBack) {
                                console.log('verfication callback present');
                                finalCallBack();
                            } else {
                                console.log('proceed to google speech to text');
                            }
                        }
                    }); */
                } else {
                    this.logger.info('originalFilesCount is present');
                    // check if all the files are converted, this marks that conversion is successfull
                    this.checkMonoFilesCount(parentFolderName, originalFilesCount, async (err, res) => {
                        if (res && !err) {
                            // once verfied that original files have been moved,
                            // copy the village file name from youtube-download to audio=download
                            this.moveProcessedFile(parentFolderName).then(moved => {
                                if (moved['ok']) {
                                    this.logger.info('All files are properly converted and moved');
                                    if (finalCallBack) {
                                        this.logger.info('verfication callback present');
                                        finalCallBack();
                                    } else {
                                        this.logger.info('proceed to google speech to text');
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });

        proc.on('error', (data) => {
            this.logger.error('conversion error ');
            this.logger.error(data);
        });
    }

    moveProcessedFile(fileNamePath): Promise<any> {
        // extract the file name by splitting the folder path, since folder and file name will be same

        return Promise.resolve({ok: true});
        }

    verifyConvertedFile(parentDir, originalFileName) {
        const monoFileName = `mono_${originalFileName}`;
        const monoFileAddr = path.resolve(parentDir, monoFileName);
        const originalFileAddr = path.resolve(parentDir, originalFileName);
        if (fs.existsSync(monoFileAddr)) {
            // move the original file to the same folder inside processed folder
            // delete the original
            const parentDirName = path.basename(parentDir);
            const processedFolderAddress = path.resolve(parentDir, '../', 'processed');
            if (!fs.existsSync(processedFolderAddress)) {
                fs.mkdirSync(processedFolderAddress);
            }
            // fs.unlinkSync(originalFileAddr);
            const processedParentFolder = path.resolve(processedFolderAddress, parentDirName);

            if ( !fs.existsSync(processedParentFolder)) {
                fs.mkdirSync(processedParentFolder);
            }
            const processedFilePath = path.resolve(processedParentFolder, originalFileName);
            this.logger.info(`moving file from \n${originalFileAddr} ----> ${processedFilePath}`);
            fs.renameSync(originalFileAddr, processedFilePath);
            // increment global filesCount for verification
            this.globalFilesCount += 1;
            // move the new mono file inside a folder
            const newMonoFolderAddress = path.resolve(parentDir, 'mono');
            if (!fs.existsSync(newMonoFolderAddress)) {
                fs.mkdirSync(newMonoFolderAddress);
            }
            this.logger.info(`moving file from \n${path.resolve(monoFileAddr)} ----> ${path.resolve(newMonoFolderAddress, monoFileName)}`);
            fs.renameSync(path.resolve(monoFileAddr), path.resolve(newMonoFolderAddress, monoFileName));
            return Promise.resolve(true);
        } else {
            this.logger.error(`COULD NOT CONVERT ${originalFileName} TO MONO FOR SOME REASON`);
            return Promise.resolve(false);
        }
    }

    checkMonoFilesCount(directoryAddr, originalFilesCount, cb) {
        this.logger.info('recieved global file count as ', this.globalFilesCount);
        if (originalFilesCount === this.globalFilesCount) {
            // conversion process is finished, check for total mono files
            this.logger.info('Conversion is completed, verifying converted files');
            const totalFilesPresent = fs.readdirSync(directoryAddr);
            if (totalFilesPresent.length === originalFilesCount) {
                this.logger.info('verified');
                cb(null, true);
                // cb(null, true, directoryAddr, totalFilesPresent);
            } else {
                this.logger.error('An error occured while successfully processing one of the files, check manually');
                cb(true, null);
            }
        } else {
            this.logger.error('original files count does not match with converted files count');
        }
    }

}
