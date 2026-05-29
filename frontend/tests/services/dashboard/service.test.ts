import { getDashboardOverview } from '@/services/dashboard/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('dashboard service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets dashboard overview', async () => {
    (clientApiRequest.get as jest.Mock).mockResolvedValue({
      weekRange: { start: '2026-01-01', end: '2026-01-07' },
      weeklyEvents: [],
      expiredMembers: [],
    });

    const result = await getDashboardOverview();

    expect(clientApiRequest.get).toHaveBeenCalledWith('dashboard/overview');
    expect(result.weeklyEvents).toEqual([]);
  });
});
