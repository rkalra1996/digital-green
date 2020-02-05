import { Injectable } from '@nestjs/common';
import {resolve as pathResolve, join as pathJoin} from 'path';
import {lstatSync, readdir} from 'fs';

import {Storage} from '@google-cloud/storage';

@Injectable()
export class GcloudService {
    private _DEFAULT_BUCKET_NAME: string;
    private storage = new Storage({
        keyFilename: pathJoin(__dirname, '../../../../../src/config/fine-harbor_auth.json'),
        projectId: 'fine-harbor-258106',
    });

    constructor() {
        this._DEFAULT_BUCKET_NAME = 'app-blob-storage';
    }

    uploadFilesToGCloud(parentFolderAddrObject, bucketName?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!bucketName) {
                console.log('bucket name not provided, using default bucket ', this._DEFAULT_BUCKET_NAME);
                bucketName = this._DEFAULT_BUCKET_NAME;
            }
            const pathToFiles  = pathResolve(parentFolderAddrObject.parentFolderAddress, parentFolderAddrObject.filesParentFolderAddr);
            // delegate storage object
            // this.storage = new Storage();
            const uploadPromises = [];
            readdir(pathToFiles, (err, dirData) => {
                if (err) {
                    console.log(err);
                    reject('An Error occured while reading parent folder details for gcloud upload');
                } else {
                    dirData.forEach(dirItem => {
                        const pathToFile = pathResolve(pathToFiles, dirItem);
                        if (lstatSync(pathToFile).isFile()) {
                            const cloudFilePath = `${parentFolderAddrObject.parentFolderName}/${parentFolderAddrObject.filesParentFolderAddr}/${dirItem}`;
                            uploadPromises.push(
                                this.storage.bucket(bucketName).upload(pathToFile, {
                                    destination: cloudFilePath,
                                    resumable: false,
                                }),
                            );
                        }
                    });
                }
            });
            Promise.all(uploadPromises)
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                console.log(err);
                reject(null);
            });
        });
    }
}
