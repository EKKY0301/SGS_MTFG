import {
  eventsService,
  exportEventDetailPdf,
  exportEventsSearchPdf,
  searchAllEvents,
} from '@/services/events/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('events service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('crud delegates to clientApiRequest', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'e1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'e1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await eventsService.list();
    await eventsService.getById('e1');
    await eventsService.create({ name: 'Event' });
    await eventsService.update('e1', { name: 'Updated' });
    await eventsService.remove('e1');

    expect(clientApiRequest.post).toHaveBeenCalledWith('events/list', {});
    expect(clientApiRequest.get).toHaveBeenCalledWith('events/e1');
    expect(clientApiRequest.patch).toHaveBeenCalledWith('events/e1', { name: 'Updated' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('events/e1');
  });

  it('searchAllEvents calls events endpoint', async () => {
    (clientApiRequest.get as jest.Mock).mockResolvedValue([]);
    await searchAllEvents();
    expect(clientApiRequest.get).toHaveBeenCalledWith('events');
  });

  it('exportEventsSearchPdf returns blob', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['pdf']),
    });

    const result = await exportEventsSearchPdf({ filters: { search: 'A' } });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/backend/events/export-pdf',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toBeInstanceOf(Blob);
  });

  it('exportEventDetailPdf throws on backend error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
    });

    await expect(exportEventDetailPdf('e 1')).rejects.toThrow('PDF export failed (500): boom');
    expect(global.fetch).toHaveBeenCalledWith('/api/backend/events/e%201/export-pdf', expect.any(Object));
  });
});
