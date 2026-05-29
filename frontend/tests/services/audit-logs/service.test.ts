import { exportAuditLogsPdf, searchAuditLogs } from '@/services/audit-logs/service';
import { serverApiRequest } from '@/services/server/apiRequest';

jest.mock('@/services/server/apiRequest', () => ({
  serverApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('audit-logs service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('searchAuditLogs posts mapped payload', async () => {
    (serverApiRequest.post as jest.Mock).mockResolvedValue({ data: [], page: 1, total: 0 });

    await searchAuditLogs({
      paginationData: { page: 1, itemsPerPage: 10 },
      filters: { from: '2026-01-01' },
    });

    expect(serverApiRequest.post).toHaveBeenCalledWith('audit-logs/search', {
      paginationData: { page: 1, itemsPerPage: 10 },
      filters: { from: '2026-01-01' },
    });
  });

  it('exportAuditLogsPdf returns blob on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['pdf']),
    });

    const result = await exportAuditLogsPdf({ paginationData: { page: 1, itemsPerPage: 10 } });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/backend/audit-logs/export-pdf',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toBeInstanceOf(Blob);
  });
});
