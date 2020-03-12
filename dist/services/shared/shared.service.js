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
const path_resolver_service_1 = require("../path-resolver/path-resolver.service");
const path = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
let SharedService = class SharedService {
    constructor(pathResolver) {
        this.pathResolver = pathResolver;
    }
    createNewFolders(folderCompletePath) {
        try {
            let partialPaths = os_1.homedir();
            const newFolders = folderCompletePath.split(os_1.homedir())[1].split('/');
            newFolders.forEach(folder => {
                partialPaths = path.join(partialPaths, folder);
                if (!fs_1.existsSync(partialPaths)) {
                    fs_1.mkdirSync(partialPaths);
                }
            });
            console.log('created ', partialPaths);
            return true;
        }
        catch (e) {
            console.log('error while creating new folders');
            console.log(e);
            return false;
        }
    }
    async saveToTempStorage(pathToCreate, dataToSave) {
        const parentFolderAddr = path.resolve(this.pathResolver.paths.TEMP_STORE_PATH, pathToCreate);
        if (this.createNewFolders(parentFolderAddr)) {
            dataToSave.forEach((dataObj) => {
                console.log('writing file ', dataObj);
                fs_1.writeFileSync(path.resolve(parentFolderAddr, dataObj.filename), dataObj.data);
            });
        }
        return { ok: true };
    }
};
SharedService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [path_resolver_service_1.PathResolverService])
], SharedService);
exports.SharedService = SharedService;
//# sourceMappingURL=shared.service.js.map