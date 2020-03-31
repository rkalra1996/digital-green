import { PathResolverService } from '../path-resolver/path-resolver.service';
import { Logger } from 'winston';
export declare class SharedService {
    private readonly logger;
    private readonly pathResolver;
    constructor(logger: Logger, pathResolver: PathResolverService);
    createNewFolders(folderCompletePath: any): boolean;
    saveToTempStorage(pathToCreate: any, dataToSave: any): Promise<{
        ok: boolean;
    }>;
    deleteFileFromTempStorage(filePath: string): void;
}
