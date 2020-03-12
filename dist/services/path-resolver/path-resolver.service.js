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
const path = require("path");
const os = require("os");
let PathResolverService = class PathResolverService {
    constructor() {
        this.paths = {
            TEMP_STORE_PATH: './dist/assets/temp-store',
            PROJECT_BASE_DIR: path.join(os.homedir(), 'official_projects/digital-green/dist'),
        };
    }
};
PathResolverService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], PathResolverService);
exports.PathResolverService = PathResolverService;
//# sourceMappingURL=path-resolver.service.js.map