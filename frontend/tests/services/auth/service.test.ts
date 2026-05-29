import { getSessionUser, loginWithServerAuth, logoutWithServerAuth } from '@/services/auth/service';
import { serverApiRequest } from '@/services/server/apiRequest';

jest.mock('@/services/server/apiRequest', () => ({
  serverApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loginWithServerAuth returns session user', async () => {
    (serverApiRequest.post as jest.Mock).mockResolvedValue({ username: 'admin' });

    const result = await loginWithServerAuth({ username: 'admin', password: '1234' });

    expect(serverApiRequest.post).toHaveBeenCalledWith('auth/login', {
      username: 'admin',
      password: '1234',
    });
    expect(result).toEqual({ username: 'admin' });
  });

  it('loginWithServerAuth throws when response is empty', async () => {
    (serverApiRequest.post as jest.Mock).mockResolvedValue(null);

    await expect(loginWithServerAuth({ username: 'admin', password: '1234' })).rejects.toThrow(
      'No se pudo iniciar sesión',
    );
  });

  it('logoutWithServerAuth posts logout', async () => {
    (serverApiRequest.post as jest.Mock).mockResolvedValue(undefined);

    await logoutWithServerAuth();

    expect(serverApiRequest.post).toHaveBeenCalledWith('auth/logout', {});
  });

  it('getSessionUser returns null when auth/me fails', async () => {
    (serverApiRequest.get as jest.Mock).mockRejectedValue(new Error('unauthorized'));

    await expect(getSessionUser()).resolves.toBeNull();
  });
});
