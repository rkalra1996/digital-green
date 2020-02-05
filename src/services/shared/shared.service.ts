import { Injectable } from '@nestjs/common';
import { PathResolverService } from '../path-resolver/path-resolver.service';
import * as path from 'path';
import { writeFileSync, existsSync, mkdirSync, writeFile } from 'fs';
import {homedir} from 'os';

@Injectable()
export class SharedService {
    constructor(private readonly pathResolver: PathResolverService) {}

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
            console.log('created ', partialPaths);
            return true;
        } catch (e) {
            console.log('error while creating new folders');
            console.log(e);
            return false;
        }
    }
    async saveToTempStorage(pathToCreate, dataToSave) {
        const parentFolderAddr = path.resolve(this.pathResolver.paths.TEMP_STORE_PATH, pathToCreate);
        // create respective folders as mentioned in the path
        if (this.createNewFolders(parentFolderAddr)) {
            // folders have been created, now save these files
            dataToSave.forEach((dataObj) => {
                console.log('writing file ', dataObj);
                writeFileSync(path.resolve(parentFolderAddr, dataObj.filename), dataObj.data);
            });
        }
        return {ok: true};
    }
}
