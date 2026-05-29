import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@/components/Login';
import { SessionProvider } from '@/services/session/context/context';
import {
  getSessionUser,
  loginWithServerAuth,
  logoutWithServerAuth,
} from '@/services/auth/service';

jest.mock('@/services/auth/service', () => ({
  loginWithServerAuth: jest.fn(),
  logoutWithServerAuth: jest.fn(),
  getSessionUser: jest.fn(),
}));

const renderWithSession = () => {
  return render(
    <SessionProvider>
      <Login />
    </SessionProvider>,
  );
};

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    (logoutWithServerAuth as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders inputs and disabled submit button on mount', async () => {
    renderWithSession();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acceder/i })).toBeDisabled();
  });

  it('enables submit when username and password are filled', async () => {
    const user = userEvent.setup();
    renderWithSession();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    const button = screen.getByRole('button', { name: /Acceder/i });
    await user.type(screen.getByLabelText(/Username/i), 'admin');
    await user.type(screen.getByLabelText(/Password/i), '1234');

    expect(button).toBeEnabled();
  });

  it('submits credentials through loginWithServerAuth', async () => {
    const user = userEvent.setup();
    (loginWithServerAuth as jest.Mock).mockResolvedValue({ username: 'admin' });

    renderWithSession();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/Username/i), 'admin');
    await user.type(screen.getByLabelText(/Password/i), '1234');
    await user.click(screen.getByRole('button', { name: /Acceder/i }));

    await waitFor(() => {
      expect(loginWithServerAuth).toHaveBeenCalledWith({ username: 'admin', password: '1234' });
    });
  });

  it('shows backend error message when login fails', async () => {
    const user = userEvent.setup();
    (loginWithServerAuth as jest.Mock).mockRejectedValue(new Error('Credenciales incorrectas'));

    renderWithSession();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/Username/i), 'admin');
    await user.type(screen.getByLabelText(/Password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Acceder/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas');
  });

  it('shows a generic message when login fails with an unexpected payload', async () => {
    const user = userEvent.setup();
    (loginWithServerAuth as jest.Mock).mockRejectedValue(
      new Error('Server proxy request failed (500): {"detail":{"message":"boom"}}'),
    );

    renderWithSession();
    await waitFor(() => expect(getSessionUser).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/Username/i), 'admin');
    await user.type(screen.getByLabelText(/Password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Acceder/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ocurrio un error inesperado. Error code 500');
  });
});