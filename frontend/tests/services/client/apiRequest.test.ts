import { clientApiRequest } from '@/services/client/apiRequest';

describe('clientApiRequest', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it('prepends backend url and parses json for get', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const result = await clientApiRequest.get('members');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/members'),
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('returns undefined for 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    });

    await expect(clientApiRequest.delete('members/1')).resolves.toBeUndefined();
  });

  it('throws detailed error on non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad',
    });

    await expect(clientApiRequest.post('members', {})).rejects.toThrow(
      'Client request failed (400): bad',
    );
  });
});
