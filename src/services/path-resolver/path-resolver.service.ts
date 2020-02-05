import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as os from 'os';
import { mkdirSync } from 'fs';

@Injectable()
export class PathResolverService {

    public paths = {
        TEMP_STORE_PATH: './dist/assets/temp-store',
        PROJECT_BASE_DIR : path.join(os.homedir(), 'official_projects/digital-green/dist'),
    };
    constructor() {}
}
