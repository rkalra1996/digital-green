"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const process_1 = require("process");
const speech_to_text_service_1 = require("../speech-to-text/speech-to-text.service");
const language_translation_service_1 = require("../language-translation/language-translation.service");
const sentiment_analysis_service_1 = require("../sentiment-analysis/sentiment-analysis.service");
const google_cloud_sdk_service_1 = require("../google-cloud-sdk/google-cloud-sdk.service");
let GcloudService = class GcloudService {
    constructor(gcloudSDK, sttSrvc, ltSrvc, saSrvc) {
        this.gcloudSDK = gcloudSDK;
        this.sttSrvc = sttSrvc;
        this.ltSrvc = ltSrvc;
        this.saSrvc = saSrvc;
        this._DEFAULT_BUCKET_NAME = process_1.env.DG_GOOGLE_APP_STORAGE;
        this.storage = this.gcloudSDK.getStorageInstance;
    }
    uploadFilesToGCloud(parentFolderAddrObject, bucketName, cloudFilePath) {
        return new Promise((resolve, reject) => {
            if (!bucketName) {
                console.log('bucket name not provided, using default bucket ', this._DEFAULT_BUCKET_NAME);
                bucketName = this._DEFAULT_BUCKET_NAME;
            }
            const uploadPromises = [];
            if (parentFolderAddrObject.hasOwnProperty('filePaths')) {
                if (!cloudFilePath) {
                    console.log('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    reject('Cannot upload file paths if cloud dest path is not given (mandatory)');
                    return;
                }
                else {
                    parentFolderAddrObject.filePaths.forEach(filePath => {
                        console.log('uploading filepath -> ', filePath);
                        const fileInfoArr = filePath.split('/');
                        console.log('file split information ', fileInfoArr);
                        cloudFilePath = `${cloudFilePath}/${fileInfoArr[fileInfoArr.length - 1]}`;
                        console.log('triggering upload in cloud dir -->', cloudFilePath);
                        uploadPromises.push(this.storage.bucket(bucketName).upload(filePath, {
                            destination: cloudFilePath,
                            resumable: false,
                        }));
                    });
                }
            }
            else {
                const pathToFiles = path_1.resolve(parentFolderAddrObject.parentFolderAddress, parentFolderAddrObject.filesParentFolderAddr);
                fs_1.readdir(pathToFiles, (err, dirData) => {
                    if (err) {
                        console.log(err);
                        reject('An Error occured while reading parent folder details for gcloud upload');
                    }
                    else {
                        dirData.forEach(dirItem => {
                            const pathToFile = path_1.resolve(pathToFiles, dirItem);
                            if (fs_1.lstatSync(pathToFile).isFile()) {
                                if (!cloudFilePath) {
                                    cloudFilePath = `${parentFolderAddrObject.parentFolderName}/${parentFolderAddrObject.filesParentFolderAddr}/${dirItem}`;
                                }
                                else {
                                    cloudFilePath = `${cloudFilePath}/${dirItem}`;
                                }
                                console.log('triggering upload in cloud dir -->', cloudFilePath);
                                uploadPromises.push(this.storage.bucket(bucketName).upload(pathToFile, {
                                    destination: cloudFilePath,
                                    resumable: false,
                                }));
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
    async startSpeechToTextConversion(dataObj) {
        console.log('starting speech to text conversion with info ', dataObj);
        const s2tResult = await this.sttSrvc.initiate(dataObj);
        if (s2tResult['ok']) {
            const cleanedResult = this.sttSrvc.cleanResult(s2tResult['data']);
            return Promise.resolve({ ok: true, data: cleanedResult });
        }
        else {
            return Promise.reject({ ok: false, status: 500, error: 'An Error occured while completing speech to text sequence' });
        }
    }
    async startLanguageTranslation(dataObj) {
        console.log('starting language translation with data ', dataObj);
        if (dataObj['speech_to_text_status'] === 'DONE') {
            console.log('speech to text data detected, proceeding to language translation');
            const ltResult = await this.ltSrvc.initiate(dataObj);
            if (ltResult['ok']) {
                return Promise.resolve({ ok: true, data: ltResult['data'] });
            }
            else {
                const errorData = {
                    username: dataObj['username'],
                    session_id: dataObj['session_id'],
                    topic_name: dataObj['topic_name'],
                };
                console.log('sending error data as ', errorData);
                return Promise.reject({ ok: false, status: 500, error: 'An Error occured while completing language translation sequence', data: errorData });
            }
        }
        else {
            console.log(`speech_to_text_status is not DONE, it is ${dataObj['speech_to_text_status']} cannot proceed to language translation sequence`);
            return Promise.reject({ ok: false, status: 503, error: 'Speech To Text did not completed successfully, ABORTING THE PIPELINE' });
        }
    }
    startSentimentAnalysis() {
        console.log('starting sentiment analysis');
        this.saSrvc.initiate({});
    }
};
GcloudService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [google_cloud_sdk_service_1.GoogleCloudSdkService,
        speech_to_text_service_1.SpeechToTextService,
        language_translation_service_1.LanguageTranslationService,
        sentiment_analysis_service_1.SentimentAnalysisService])
], GcloudService);
exports.GcloudService = GcloudService;
//# sourceMappingURL=gcloud.service.js.map