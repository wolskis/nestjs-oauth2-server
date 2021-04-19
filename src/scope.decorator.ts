import { SetMetadata } from '@nestjs/common';

export const Scope = (...args: string[]) => SetMetadata('scope', args);
