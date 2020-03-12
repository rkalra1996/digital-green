"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('dotenv').config();
const process_1 = require("process");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'debug'],
    });
    app.enableCors();
    await app.listen(process_1.env.DG_SERVER_PORT);
    console.log('server up and running at port -> ', process_1.env.DG_SERVER_PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map