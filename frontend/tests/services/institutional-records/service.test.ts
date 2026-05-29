import {
  downloadInstitutionalRecordPdf,
  institutionalRecordsService,
  uploadInstitutionalRecordPdf,
} from '@/services/institutional-records/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('institutional-records service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('crud delegates to expected endpoints', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'i1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'i1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await institutionalRecordsService.list();
    await institutionalRecordsService.getById('i1');
    await institutionalRecordsService.create({ title: 'A' });
    await institutionalRecordsService.update('i1', { title: 'B' });
    await institutionalRecordsService.remove('i1');

    expect(clientApiRequest.post).toHaveBeenCalledWith('institutional-records/search', {});
    expect(clientApiRequest.get).toHaveBeenCalledWith('institutional-records/i1');
    expect(clientApiRequest.patch).toHaveBeenCalledWith('institutional-records/i1', { title: 'B' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('institutional-records/i1');
  });

  it('uploadInstitutionalRecordPdf sends normalized recordDate at noon UTC', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'i1' }),
    });

    await uploadInstitutionalRecordPdf({
      title: 'Acta',
      type: 'meeting',
      recordDate: '2026-05-13',
      description: 'desc',
      file: new File(['pdf'], 'inst.pdf', { type: 'application/pdf' }),
    });

    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('/api/backend/institutional-records/upload');
    const body = call[1].body as FormData;
    expect(body.get('recordDate')).toBe('2026-05-13T12:00:00.000Z');
    expect(body.get('title')).toBe('Acta');
  });

  it('downloadInstitutionalRecordPdf throws on error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => 'error',
    });

    await expect(downloadInstitutionalRecordPdf('i1')).rejects.toThrow('error');
  });
});
