// Royal Pineapple's SiteMinder rate plans are named with the hotel's
// internal codes ("OPN-RO", "OPN-OTA(L)", "TTSRB"), and the breakfast ones
// aren't flagged as including breakfast. Guests see what the rate includes
// instead, on the booking page, the confirmation page and in their email.
// The codes end the usual hotel way: RO = room only, RB/BB = room and
// breakfast. A rate the hotel gives a real name ("Bed & breakfast, flexible")
// passes through unchanged, so renaming the rates in SiteMinder just works.

export type Meals = { breakfast: boolean; lunch: boolean; dinner: boolean };

/** True for a name with no lowercase letters and at least two capitals in a row: "OPN-RO", "TTSRB". */
export const isRateCode = (name: string) => !/[a-z]/.test(name) && /[A-Z]{2}/.test(name);

export function guestRate(name: string, meals: Meals): { name: string; meals: Meals } {
  if (!isRateCode(name)) return { name, meals };
  const withMeals = { ...meals, breakfast: meals.breakfast || /(RB|BB)$/.test(name.trim()) };
  const included = [withMeals.breakfast && 'breakfast', withMeals.lunch && 'lunch', withMeals.dinner && 'dinner'].filter(Boolean);
  return { name: included.length ? `Room with ${included.join(' & ')}` : 'Room only', meals: withMeals };
}
