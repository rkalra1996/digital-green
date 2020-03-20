import { Injectable, Inject } from '@nestjs/common';
import { PathResolverService } from '../path-resolver/path-resolver.service';
import * as path from 'path';
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import {homedir} from 'os';
import { Logger } from 'winston';

@Injectable()
export class SharedService {
    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly pathResolver: PathResolverService) {}

    createNewFolders(folderCompletePath) {
        try {
            let partialPaths = homedir();
            const newFolders = folderCompletePath.split(homedir())[1].split('/');
            newFolders.forEach(folder => {
                partialPaths = path.join(partialPaths, folder);
                if (!existsSync(partialPaths)) {
                    mkdirSync(partialPaths);
                }
            });
            // all folders created
            this.logger.info('created ' + partialPaths);
            return true;
        } catch (e) {
            this.logger.error('error while creating new folders');
            this.logger.error(e);
            return false;
        }
    }
    async saveToTempStorage(pathToCreate, dataToSave) {
        const parentFolderAddr = path.resolve(this.pathResolver.paths.TEMP_STORE_PATH, pathToCreate);
        // create respective folders as mentioned in the path
        if (this.createNewFolders(parentFolderAddr)) {
            // folders have been created, now save these files
            dataToSave.forEach((dataObj) => {
                this.logger.info('writing file ' + dataObj['filename']);
                writeFileSync(path.resolve(parentFolderAddr, dataObj.filename), dataObj.data);
            });
        }
        return {ok: true};
    }

    deleteFileFromTempStorage(filePath: string) {
        const parentFolderAddr = path.resolve(this.pathResolver.paths.TEMP_STORE_PATH, filePath);
        this.logger.info('triggering delete file from --> ' + parentFolderAddr);
        try {
            if (existsSync(parentFolderAddr)) {
                unlinkSync(parentFolderAddr);
            } else {
                this.logger.info(`${parentFolderAddr} is not present, no need to delete`);
            }
        } catch (e) {
            this.logger.info('An error occured while triggering the delete file procedure');
            this.logger.error(e);
        }
    }
}
