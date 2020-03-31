import { Logger } from 'winston';
export declare class FfmpegUtilityService {
    private readonly logger;
    constructor(logger: Logger);
    globalFilesCount: number;
    convertStereo2Mono(parentFolderAddr: any, fileName?: string, finalCallBack?: any): Promise<void | {
        ok: boolean;
        error: string;
    }>;
    startS2MConversion(folderAddress: any, filenameToUse?: string, finalCallBack?: any): void;
    runProcess(parentFolderName: any, fileName: any, originalFilesCount?: number, finalCallBack?: any): Promise<void>;
    moveProcessedFile(fileNamePath: any): Promise<any>;
    verifyConvertedFile(parentDir: any, originalFileName: any): Promise<boolean>;
    checkMonoFilesCount(directoryAddr: any, originalFilesCount: any, cb: any): void;
}
