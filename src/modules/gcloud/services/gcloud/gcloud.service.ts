import { Injectable, Inject } from '@nestjs/common';
import {resolve as pathResolve} from 'path';
import {lstatSync, readdir} from 'fs';

import {env as ENV} from 'process';
import { SpeechToTextService } from '../speech-to-text/speech-to-text.service';
import { LanguageTranslationService } from '../language-translation/language-translation.service';
import { SentimentAnalysisService } from '../sentiment-analysis/sentiment-analysis.service';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
import { Logger } from 'winston';

@Injectable()
export class GcloudService {
    private _DEFAULT_BUCKET_NAME: string;
    private storage;

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly gcloudSDK: GoogleCloudSdkService,
        private readonly sttSrvc: SpeechToTextService,
        private readonly ltSrvc: LanguageTranslationService,
        private readonly saSrvc: SentimentAnalysisService,
        ) {
        this._DEFAULT_BUCKET_NAME = ENV.DG_STAGING_GOOGLE_APP_STORAGE;
        this.storage = this.gcloudSDK.getStorageInstance;
    }

    uploadFilesToGCloud(parentFolderAddrObject, bucketName?: string, cloudFilePath?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!bucketName) {
                this.logger.info(`bucket name not provided, using default bucket ${this._DEFAULT_BUCKET_NAME}`);
                bucketName = this._DEFAULT_BUCKET_NAME;
            }
            const uploadPromises = [];
            // if specific file paths are given
            if (parentFolderAddrObject.hasOwnProperty('filePaths')) {
                // cloudPath is mandatory
                if (!cloudFilePath) {
                    this.logger.error('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    reject('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    return;
                } else {
                    // directly upload these files only
                    parentFolderAddrObject.filePaths.forEach(filePath => {
                        this.logger.info(`uploading filepath -> ${filePath}`);
                        const fileInfoArr = filePath.split('/');
                        this.logger.info('file split information ', fileInfoArr);
                        cloudFilePath = `${cloudFilePath}/${fileInfoArr[fileInfoArr.length - 1]}`;
                        this.logger.info('triggering upload in cloud dir -->', cloudFilePath);
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
                    this.logger.error('An error occured while reading parent folder details for gcloud upload');
                    this.logger.error(err);
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
                            this.logger.info(`triggering upload in cloud dir --> ${cloudFilePath}`);
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
                this.logger.error(err);
                reject(null);
            });
        });
    }

    async startSpeechToTextConversion(dataObj): Promise<object> {
        this.logger.info(`starting speech to text conversion with info ${JSON.stringify(dataObj)}`);
        const s2tResult = await this.sttSrvc.initiate(dataObj);
        if (s2tResult['ok']) {
            // clean the result recieed and send it back
            this.logger.info('recieved response from speech to text api');
            const cleanedResult = this.sttSrvc.cleanResult(s2tResult['data']);
            return Promise.resolve({ok: true, data: cleanedResult});
        } else {
            this.logger.info('catched error from speech to text api');
            return Promise.reject({ok: false, status: 500,  error: 'An Error occured while completing speech to text sequence'});
        }
    }

    async startLanguageTranslation(dataObj): Promise<object> {
        this.logger.info(`starting language translation with data ${JSON.stringify(dataObj)}`);
        if (dataObj['speech_to_text_status'] === 'DONE') {
            this.logger.info('speech to text data detected, proceeding to language translation');
            const ltResult = await this.ltSrvc.initiate(dataObj);
            if (ltResult['ok']) {
                return Promise.resolve({ok: true, data: ltResult['data']});
            } else {
                const errorData = {
                    username: dataObj['username'],
                    session_id: dataObj['session_id'],
                    topic_name: dataObj['topic_name'],
                };
                // tslint:disable-next-line: max-line-length
                return Promise.reject({ok: false, status: 500,  error: 'An Error occured while completing language translation sequence', data: errorData});
            }
        } else {
            // tslint:disable-next-line: max-line-length
            this.logger.error(`speech_to_text_status is not DONE, it is ${dataObj['speech_to_text_status']} cannot proceed to language translation sequence`);
            return Promise.reject({ok: false, status: 503,  error: 'Speech To Text did not completed successfully, ABORTING THE PIPELINE'});
        }
    }

    startSentimentAnalysis() {
        this.logger.info('starting sentiment analysis');
        this.saSrvc.initiate({});
    }
}
