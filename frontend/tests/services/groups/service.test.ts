import { groupsService } from '@/services/groups/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('groups service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('list delegates to groups/list', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    await groupsService.list();
    expect(clientApiRequest.post).toHaveBeenCalledWith('groups/list', {});
  });

  it('getById/create/update/remove delegate to expected endpoints', async () => {
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'g1' });
    (clientApiRequest.post as jest.Mock).mockResolvedValue({ id: 'g1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'g1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await groupsService.getById('g1');
    await groupsService.create({ name: 'A' });
    await groupsService.update('g1', { name: 'B' });
    await groupsService.remove('g1');

    expect(clientApiRequest.get).toHaveBeenCalledWith('groups/g1');
    expect(clientApiRequest.post).toHaveBeenCalledWith('groups', { name: 'A' });
    expect(clientApiRequest.patch).toHaveBeenCalledWith('groups/g1', { name: 'B' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('groups/g1');
  });
});
