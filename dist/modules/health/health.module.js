"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const terminus_1 = require("@nestjs/terminus");
const process_1 = require("process");
const getTerminusOptions = (mongoose) => ({
    endpoints: [
        {
            url: '/health',
            healthIndicators: [async () => await mongoose.pingCheck('mongo')],
        },
    ],
});
let HealthModule = class HealthModule {
};
HealthModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forRoot(process_1.env.DG_DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true }),
            terminus_1.TerminusModule.forRootAsync({
                inject: [terminus_1.MongooseHealthIndicator],
                useFactory: getTerminusOptions,
            }),
        ],
    })
], HealthModule);
exports.HealthModule = HealthModule;
//# sourceMappingURL=health.module.js.map