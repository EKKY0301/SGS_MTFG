import { clientApiRequest } from "@/services/client/apiRequest";
import { Event } from "@/types/event";
import { Member } from "@/types/member";

export type DashboardOverview = {
  weekRange: {
    start: Date | string;
    end: Date | string;
  };
  weeklyEvents: Event[];
  expiredMembers: Member[];
};

export function getDashboardOverview() {
  return clientApiRequest.get<DashboardOverview>("dashboard/overview");
}
