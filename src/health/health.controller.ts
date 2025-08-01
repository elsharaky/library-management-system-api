import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private readonly healthCheckService: HealthCheckService,
        private readonly databaseHealthIndicator: TypeOrmHealthIndicator,
    ) {}

    @Get()
    async check() {
        return this.healthCheckService.check([
            () => this.databaseHealthIndicator.pingCheck('database'),
        ]);
    }
}
