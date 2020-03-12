import { PathResolverService } from '../path-resolver/path-resolver.service';
export declare class SharedService {
    private readonly pathResolver;
    constructor(pathResolver: PathResolverService);
    createNewFolders(folderCompletePath: any): boolean;
    saveToTempStorage(pathToCreate: any, dataToSave: any): Promise<{
        ok: boolean;
    }>;
}
