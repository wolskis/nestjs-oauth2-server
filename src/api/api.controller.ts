import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class ApiController {
    @Get()
    findAll(): string {
      return 'This is the secret area';
    }
}