import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtCookieAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
