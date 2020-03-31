"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = require("process");
console.log('loading environment config from ', process_1.env['DG_ENV_CONFIG_PATH']);
const config = require('dotenv').config({ path: process_1.env['DG_ENV_CONFIG_PATH'], debug: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'debug'],
    });
    app.enableCors();
    if (config.error) {
        console.log('error while loading the environment variables', config);
    }
    else {
        console.log('config loaded is ', config);
        await app.listen(process_1.env.DG_SERVER_PORT);
        console.log('server up and running at port -> ', process_1.env.DG_SERVER_PORT);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map