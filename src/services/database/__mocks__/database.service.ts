import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Injectable()
export class MockedDatabaseService extends DatabaseService {
    public query = jest.fn();
}
