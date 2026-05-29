import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberProvider, useMemberContext } from '@/services/members/context/context';

jest.mock('@/services/members/service', () => ({
  membersService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

import { membersService } from '@/services/members/service';

// Helper: componente que expone el contexto al test
function MemberConsumer() {
  const { items, selectedItem, isLoading, list, createItem, updateItem, deleteItem } = useMemberContext();

  return (
    <div>
      <span data-testid="totalMembers">{items.length}</span>
      <span data-testid="selectedMember">{selectedItem?.name ?? 'none'}</span>
      <span data-testid="isLoading">{String(isLoading)}</span>
      <button onClick={() => list()}>list</button>
      <button onClick={() => createItem({ name: 'Creado' } as any)}>create</button>
      <button onClick={() => updateItem('m1', { name: 'Editado' } as any)}>update</button>
      <button onClick={() => deleteItem('m1')}>delete</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <MemberProvider>
      <MemberConsumer />
    </MemberProvider>,
  );

describe('MemberProvider — estado inicial', () => {
  it('inicia con lista vacia y sin seleccion', () => {
    renderProvider();
    expect(screen.getByTestId('totalMembers')).toHaveTextContent('0');
    expect(screen.getByTestId('selectedMember')).toHaveTextContent('none');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
  });
});

describe('MemberProvider — acciones CRUD', () => {
  it('list/create/update/delete llaman al servicio', async () => {
    const user = userEvent.setup();
    (membersService.list as jest.Mock).mockResolvedValue([{ id: 'm1', name: 'Ana' }]);
    (membersService.create as jest.Mock).mockResolvedValue({ id: 'm2', name: 'Creado' });
    (membersService.update as jest.Mock).mockResolvedValue({ id: 'm1', name: 'Editado' });
    (membersService.remove as jest.Mock).mockResolvedValue(undefined);

    renderProvider();

    await user.click(screen.getByText('list'));
    await user.click(screen.getByText('create'));
    await user.click(screen.getByText('update'));
    await user.click(screen.getByText('delete'));

    await waitFor(() => {
      expect(membersService.list).toHaveBeenCalled();
      expect(membersService.create).toHaveBeenCalledWith({ name: 'Creado' });
      expect(membersService.update).toHaveBeenCalledWith('m1', { name: 'Editado' });
      expect(membersService.remove).toHaveBeenCalledWith('m1');
    });
  });
});

describe('useMemberContext — fuera del provider', () => {
  it('lanza error cuando se usa fuera de MemberProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => null);

    function Naked() {
      useMemberContext();
      return null;
    }

    expect(() => render(<Naked />)).toThrow(
      'useApiContext must be used inside ApiProvider',
    );

    consoleError.mockRestore();
  });
});
