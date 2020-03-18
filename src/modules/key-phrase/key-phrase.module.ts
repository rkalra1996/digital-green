import { Module } from '@nestjs/common';
import { KeyPhraseCoreService } from './services/key-phrase-core/key-phrase-core.service';
import { KeyPhraseUtilityService } from './services/key-phrase-utility/key-phrase-utility.service';

@Module({
    providers: [KeyPhraseCoreService, KeyPhraseUtilityService],
    exports: [KeyPhraseCoreService, KeyPhraseUtilityService],
})
export class KeyPhraseModule {}
