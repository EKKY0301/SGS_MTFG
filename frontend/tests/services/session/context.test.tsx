import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider, useSessionContext } from '@/services/session/context/context';
import { getSessionUser, loginWithServerAuth, logoutWithServerAuth } from '@/services/auth/service';

jest.mock('@/services/auth/service', () => ({
  loginWithServerAuth: jest.fn(),
  logoutWithServerAuth: jest.fn(),
  getSessionUser: jest.fn(),
}));

// Helper: componente que expone el contexto al test
function SessionConsumer() {
  const { user, isAuthenticated, isSubmitting, error, login, logout, clearError } =
    useSessionContext();

  return (
    <div>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
      <span data-testid="isSubmitting">{String(isSubmitting)}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button onClick={() => void login({ username: 'admin', password: '1234' }).catch(() => undefined)}>
        login
      </button>
      <button onClick={() => void logout().catch(() => undefined)}>logout</button>
      <button onClick={clearError}>clearError</button>
    </div>
  );
}

const renderWithCustomAuth = (
  bootstrapUser: unknown = null,
) =>
  render(
    <SessionProvider>
      <SessionConsumer />
    </SessionProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  (getSessionUser as jest.Mock).mockResolvedValue(bootstrapUserRef.value);
  (loginWithServerAuth as jest.Mock).mockResolvedValue({ username: 'admin' });
  (logoutWithServerAuth as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  bootstrapUserRef.value = null;
});

const bootstrapUserRef: { value: any } = { value: null };

describe('SessionProvider — estado inicial', () => {
  it('starts with no user and not authenticated', async () => {
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('isSubmitting')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });
});

describe('SessionProvider — login', () => {
  it('sets user and isAuthenticated to true after successful login', async () => {
    const user = userEvent.setup();
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('admin');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });

  it('sets isSubmitting to true while the authenticate function is pending', async () => {
    const user = userEvent.setup();
    let resolver: ((u: any) => void) | undefined;
    (loginWithServerAuth as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        }),
    );

    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());
    const loginBtn = screen.getByText('login');

    await user.click(loginBtn);

    // While pending, isSubmitting must be true
    expect(screen.getByTestId('isSubmitting')).toHaveTextContent('true');

    act(() => {
      resolver?.({ username: 'admin' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('isSubmitting')).toHaveTextContent('false');
    });
  });

  it('clears isSubmitting after login resolves', async () => {
    const user = userEvent.setup();
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('isSubmitting')).toHaveTextContent('false');
    });
  });

  it('sets error and keeps user null when authenticate rejects', async () => {
    const user = userEvent.setup();
    (loginWithServerAuth as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('none');
      expect(screen.getByTestId('username')).toHaveTextContent('none');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('clears previous error before a new login attempt', async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    (loginWithServerAuth as jest.Mock).mockImplementation(async () => {
      if (shouldFail) throw new Error('Fail');
      return { username: 'admin' };
    });

    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    // First login fails
    await user.click(screen.getByText('login'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('none');
    });

    // Second login  succeeds
    shouldFail = false;
    await user.click(screen.getByText('login'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('none');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });
});

describe('SessionProvider — logout', () => {
  it('clears user and sets isAuthenticated to false', async () => {
    const user = userEvent.setup();
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    // First login
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true'));

    // Then logout
    await user.click(screen.getByText('logout'));
    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('none');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('calls DELETE to /auth/logout endpoint', async () => {
    const user = userEvent.setup();
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true'));

    await user.click(screen.getByText('logout'));

    await waitFor(() => {
      expect(logoutWithServerAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('still clears user even when logout API call fails', async () => {
    const user = userEvent.setup();
    (logoutWithServerAuth as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true'));

    await user.click(screen.getByText('logout'));
    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('none');
    });
  });
});

describe('SessionProvider — clearError', () => {
  it('clears the error string', async () => {
    const user = userEvent.setup();
    (loginWithServerAuth as jest.Mock).mockRejectedValue(new Error('fail'));
    renderWithCustomAuth();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('error')).not.toHaveTextContent('none'));

    await user.click(screen.getByText('clearError'));

    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });
});

describe('useSessionContext — fuera del provider', () => {
  it('throws when used outside of SessionProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => null);

    function Naked() {
      useSessionContext();
      return null;
    }

    expect(() => render(<Naked />)).toThrow(
      'useSessionContext must be used within SessionProvider',
    );

    consoleError.mockRestore();
  });
});
