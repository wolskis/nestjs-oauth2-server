import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Scope } from '../scope.decorator';
import { ScopeGuard } from '../scope.guard';

@Controller('api')
@UseGuards(ScopeGuard)
export class ApiController {
    @Get()
    @Scope('user.read')
    find(): string {
      return 'This is the user.read area';
    }

    @Post()
    @Scope('user.write')
    add(): string {
      return 'This is the user.write area';
    }
}