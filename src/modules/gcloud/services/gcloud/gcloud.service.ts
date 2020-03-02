import { Injectable } from '@nestjs/common';
import {resolve as pathResolve} from 'path';
import {lstatSync, readdir} from 'fs';

import {env as ENV} from 'process';
import { SpeechToTextService } from '../speech-to-text/speech-to-text.service';
import { LanguageTranslationService } from '../language-translation/language-translation.service';
import { SentimentAnalysisService } from '../sentiment-analysis/sentiment-analysis.service';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';

@Injectable()
export class GcloudService {
    private _DEFAULT_BUCKET_NAME: string;
    private storage;

    constructor(
        private readonly gcloudSDK: GoogleCloudSdkService,
        private readonly sttSrvc: SpeechToTextService,
        private readonly ltSrvc: LanguageTranslationService,
        private readonly saSrvc: SentimentAnalysisService,
        ) {
        this._DEFAULT_BUCKET_NAME = ENV.DG_GOOGLE_APP_STORAGE;
        this.storage = this.gcloudSDK.getStorageInstance;
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

    async startSpeechToTextConversion(dataObj): Promise<object> {
        console.log('starting speech to text conversion with info ', dataObj);
        const s2tResult = await this.sttSrvc.initiate(dataObj);
        if (s2tResult['ok']) {
            return Promise.resolve({ok: true, data: s2tResult['data']});
        } else {
            return Promise.reject({ok: false, status: 500,  error: 'An Error occured while completing speech to text sequence'});
        }
    }

    startLanguageTranslation() {
        console.log('starting language translation');
        this.ltSrvc.initiate({});
    }

    startSentimentAnalysis() {
        console.log('starting sentiment analysis');
        this.saSrvc.initiate({});
    }
}
