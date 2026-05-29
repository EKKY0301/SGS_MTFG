import { serverApiRequest } from '@/services/server/apiRequest';

describe('serverApiRequest', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it('calls /api/backend proxy with normalized path', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const result = await serverApiRequest.get('/auth/me');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/backend/auth/me',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('returns undefined on 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    });

    await expect(serverApiRequest.delete('auth/logout')).resolves.toBeUndefined();
  });

  it('throws detailed proxy error on non-ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });

    await expect(serverApiRequest.post('auth/login', {})).rejects.toThrow(
      'Server proxy request failed (500): boom',
    );
  });
});
