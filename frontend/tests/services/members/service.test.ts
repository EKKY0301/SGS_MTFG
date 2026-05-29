import {
  createChildren,
  createRelated,
  establishDeathDate,
  exportMembersSearchPdf,
  membersService,
  searchMembers,
} from '@/services/members/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('members service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('crud delegates to expected endpoints', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'm1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'm1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await membersService.list();
    await membersService.getById('m1');
    await membersService.create({ name: 'A' });
    await membersService.update('m1', { name: 'B' });
    await membersService.remove('m1');

    expect(clientApiRequest.post).toHaveBeenCalledWith('members/list', {});
    expect(clientApiRequest.get).toHaveBeenCalledWith('members/m1');
    expect(clientApiRequest.patch).toHaveBeenCalledWith('members/m1', { name: 'B' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('members/m1');
  });

  it('searchMembers posts mapped payload', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });

    await searchMembers({
      paginationData: { page: 1, itemsPerPage: 10 },
      filters: { search: 'Ana' },
    });

    expect(clientApiRequest.post).toHaveBeenCalledWith('members/search', {
      paginationData: { page: 1, itemsPerPage: 10 },
      filters: { search: 'Ana' },
    });
  });

  it('createChildren/createRelated/establishDeathDate call member actions', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue({});
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({});

    await createChildren('m1', [{ name: 'Child' }]);
    await createRelated('m1', { relation: 'partner' });
    await establishDeathDate('m1', '2026-01-01');

    expect(clientApiRequest.post).toHaveBeenCalledWith('members/m1/children', {
      children: [{ name: 'Child' }],
    });
    expect(clientApiRequest.post).toHaveBeenCalledWith('members/m1/related', { relation: 'partner' });
    expect(clientApiRequest.patch).toHaveBeenCalledWith('members/m1/deceased', { deathDate: '2026-01-01' });
  });

  it('exportMembersSearchPdf throws when backend fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });

    await expect(
      exportMembersSearchPdf({ paginationData: { page: 1, itemsPerPage: 10 }, filters: {} }),
    ).rejects.toThrow('PDF export failed (400): bad request');
  });
});
