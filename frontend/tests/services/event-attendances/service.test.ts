import {
  createEventAttendance,
  deleteEventAttendance,
  eventAttendancesService,
  getEventAttendancesByEventId,
  updateEventAttendance,
} from '@/services/event-attendances/service';
import { clientApiRequest } from '@/services/client/apiRequest';

jest.mock('@/services/client/apiRequest', () => ({
  clientApiRequest: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('event-attendances service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crud delegates to expected endpoints', async () => {
    (clientApiRequest.post as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.get as jest.Mock).mockResolvedValue({ id: 'a1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'a1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await eventAttendancesService.list();
    await eventAttendancesService.getById('a1');
    await eventAttendancesService.create({ status: 'present' });
    await eventAttendancesService.update('a1', { status: 'absent' });
    await eventAttendancesService.remove('a1');

    expect(clientApiRequest.post).toHaveBeenCalledWith('event-attendances/list', {});
    expect(clientApiRequest.get).toHaveBeenCalledWith('event-attendances/a1');
    expect(clientApiRequest.patch).toHaveBeenCalledWith('event-attendances/a1', { status: 'absent' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('event-attendances/a1');
  });

  it('specialized helpers call proper endpoints', async () => {
    (clientApiRequest.get as jest.Mock).mockResolvedValue([]);
    (clientApiRequest.post as jest.Mock).mockResolvedValue({ id: 'a1' });
    (clientApiRequest.patch as jest.Mock).mockResolvedValue({ id: 'a1' });
    (clientApiRequest.delete as jest.Mock).mockResolvedValue(undefined);

    await getEventAttendancesByEventId('ev1');
    await createEventAttendance({ eventId: 'ev1' });
    await updateEventAttendance('a1', { notes: 'x' });
    await deleteEventAttendance('a1');

    expect(clientApiRequest.get).toHaveBeenCalledWith('event-attendances/ev1');
    expect(clientApiRequest.post).toHaveBeenCalledWith('event-attendances', { eventId: 'ev1' });
    expect(clientApiRequest.patch).toHaveBeenCalledWith('event-attendances/a1', { notes: 'x' });
    expect(clientApiRequest.delete).toHaveBeenCalledWith('event-attendances/a1');
  });
});
