import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  const dashboardService = { getOverview: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    }).compile();

    controller = module.get(DashboardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate getOverview to DashboardService', async () => {
    const overview = { weeklyEvents: [], expiredMembers: [] };
    dashboardService.getOverview.mockResolvedValue(overview);

    await expect(controller.getOverview()).resolves.toEqual(overview);
    expect(dashboardService.getOverview).toHaveBeenCalledTimes(1);
  });
});