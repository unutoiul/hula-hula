// The website's names for Royal Pineapple's SiteMinder room types, so the
// booking record, the confirmation page and the guest's email say "Twin Coco"
// like the room cards and the booking page do. The team's email adds
// SiteMinder's own name, the one the front desk sees. Keep in step with the
// rooms in src/data/content.ts (title + siteminderRoomTypeUuid);
// tests/booking.test.ts fails if the two drift apart.

export const WEBSITE_ROOM_NAMES: Record<string, string> = {
  'f660e0b0-4687-457c-8312-5a0ba6a2fd3c': 'Signature Pineapple',
  '7db25b14-a9ec-4ca2-90ac-5592a30a6dc0': 'Emerald Pool Access',
  '9d2d5468-41ca-4f8c-8e7e-ecaa00b49ca0': 'Premier Blue Sky Holiday',
  '73cf71b9-a735-4fb3-80e9-b54bbfaa28d4': 'Double Hibiscus',
  'c82ed00a-447e-4bae-b04c-0bdc8d585137': 'Twin Coco',
  '0ff2e747-0c2e-41f2-986c-3bd48703784e': 'Triple Coco',
  '18bb9bc3-07a3-4454-8bad-a38515a3925a': 'Triple Blue Sky',
  'fbdbba82-9f7d-4c30-9244-43296f66ddf6': 'Family/Friend Suite',
};

export const guestRoomName = (roomTypeUuid: string, siteMinderName: string) => WEBSITE_ROOM_NAMES[roomTypeUuid] ?? siteMinderName;
