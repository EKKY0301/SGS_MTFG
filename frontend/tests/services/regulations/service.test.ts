import {
  downloadRegulationPdf,
  regulationsService,
  uploadRegulationPdf,
} from '@/services/regulations/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('regulations service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('crud delegates to expected endpoints', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'r1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'r1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await regulationsService.list();
    await regulationsService.getById('r1');
    await regulationsService.create({ title: 'A' });
    await regulationsService.update('r1', { title: 'B' });
    await regulationsService.remove('r1');

    expect(clientApiRequest.post).toHaveBeenCalledWith('regulations/search', {});
    expect(clientApiRequest.get).toHaveBeenCalledWith('regulations/r1');
    expect(clientApiRequest.patch).toHaveBeenCalledWith('regulations/r1', { title: 'B' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('regulations/r1');
  });

  it('uploadRegulationPdf sends form-data and normalizes effectiveDate at noon UTC', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'r1' }),
    });

    await uploadRegulationPdf({
      title: 'Norma',
      type: 'internal',
      version: '1',
      effectiveDate: '2026-05-13',
      description: 'desc',
      file: new File(['pdf'], 'reg.pdf', { type: 'application/pdf' }),
    });

    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('/api/backend/regulations/upload');
    const body = call[1].body as FormData;
    expect(body.get('effectiveDate')).toBe('2026-05-13T12:00:00.000Z');
    expect(body.get('title')).toBe('Norma');
  });

  it('downloadRegulationPdf throws on error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'error',
    });

    await expect(downloadRegulationPdf('r1')).rejects.toThrow('error');
  });
});
