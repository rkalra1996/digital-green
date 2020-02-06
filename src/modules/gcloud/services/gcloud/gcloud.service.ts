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

    uploadFilesToGCloud(parentFolderAddrObject, bucketName?: string, cloudFilePath?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!bucketName) {
                console.log('bucket name not provided, using default bucket ', this._DEFAULT_BUCKET_NAME);
                bucketName = this._DEFAULT_BUCKET_NAME;
            }
            const uploadPromises = [];
            // if specific file paths are given
            if (parentFolderAddrObject.hasOwnProperty('filePaths')) {
                // cloudPath is mandatory
                if (!cloudFilePath) {
                    console.log('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    reject('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    return;
                } else {
                    // directly upload these files only
                    parentFolderAddrObject.filePaths.forEach(filePath => {
                        console.log('uploading filepath -> ', filePath);
                        const fileInfoArr = filePath.split('/');
                        console.log('file split information ', fileInfoArr);
                        cloudFilePath = `${cloudFilePath}/${fileInfoArr[fileInfoArr.length - 1]}`;
                        console.log('triggering upload in cloud dir -->', cloudFilePath);
                        uploadPromises.push(
                            this.storage.bucket(bucketName).upload(filePath, {
                                destination: cloudFilePath,
                                resumable: false,
                            }),
                        );
                    });
                }
            } else {
            const pathToFiles  = pathResolve(parentFolderAddrObject.parentFolderAddress, parentFolderAddrObject.filesParentFolderAddr);
            // delegate storage object
            readdir(pathToFiles, (err, dirData) => {
                if (err) {
                    console.log(err);
                    reject('An Error occured while reading parent folder details for gcloud upload');
                } else {
                    dirData.forEach(dirItem => {
                        const pathToFile = pathResolve(pathToFiles, dirItem);
                        if (lstatSync(pathToFile).isFile()) {
                            if (!cloudFilePath) {
                                cloudFilePath = `${parentFolderAddrObject.parentFolderName}/${parentFolderAddrObject.filesParentFolderAddr}/${dirItem}`;
                            } else {
                                // use the user defined cloud path
                                cloudFilePath = `${cloudFilePath}/${dirItem}`;
                            }
                            console.log('triggering upload in cloud dir -->', cloudFilePath);
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
        }
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
