# Google Search and hotel booking prices

The public sitemap is https://www.hulahularesort.com/sitemap.xml, advertised in
robots.txt. It lists the resort homepage and booking search. Submit this URL in
the verified website's Google Search Console property. Staff pages and private
checkout steps send `X-Robots-Tag: noindex` and are omitted from the sitemap.
The public content, room catalogue and availability endpoints remain crawlable
so Google's renderer can load the booking page's rates; their API responses
send `X-Robots-Tag: noindex`.

In [Google Search Console](https://search.google.com/search-console), select the
verified `https://www.hulahularesort.com/` URL-prefix property or the
`hulahularesort.com` domain property, open **Sitemaps**, and submit `sitemap.xml`.
If the property is missing, verify ownership first using Google's provided DNS
record or HTML verification tag. The website change does not verify ownership
or submit the sitemap to your Google account automatically.

The homepage and `/book` have their own initial HTML titles, descriptions and
canonical URLs, social previews and Hotel JSON-LD. Selected-date query URLs use
the `/book` canonical, avoiding a separate indexed page for every search.

## Activate direct prices in Google Maps / Google Hotels

A sitemap and Hotel structured data do not activate the hotel price comparison
panel. Google requires a Hotel Center connection that supplies current rates
and availability, matches the property, and points to an accurate booking page.
No Google Hotel Center connection has been configured by this change.

Ask the hotel's existing reservation/rate provider to activate **Google free
booking links** for Hula Hula Resort and confirm it supports this custom booking
destination. If it only supports its own hosted booking engine, a provider that
supports the custom website or an approved direct Hotel Center integration is
needed. Do not substitute another destination without checking this support.

Use `google-hotels-landing-pages.xml` as the English/THB landing-page definition
for the provider. It preserves Google's selected check-in, check-out, adult and
child counts. The booking page displays live rates and terms for that itinerary.
It supports one occupancy selection per room; confirm child pricing/age support
with the provider before enabling itineraries involving children.

Example (replace dates with available future dates when testing):

https://www.hulahularesort.com/book?checkIn=2026-12-01&checkOut=2026-12-03&adults=2&children=0

The provider must verify that its Google rates, taxes, fees, currency, occupancy
and cancellation terms match the website, then enable the matched property for
free booking links in Hotel Center. Do not publish a static nightly price or
invent a tax breakdown. Paid Hotel Ads require separate budget authorization.

Google rate distribution is separate from reservation entry: website payments
remain on Stripe, and reservations staff still enter paid bookings in SiteMinder
manually.

## Official references

- [Google free booking links](https://support.google.com/hotelprices/answer/10472393?hl=en)
- [Hotel price feeds](https://developers.google.com/hotels/hotel-prices/dev-guide/data-feeds)
- [Landing-page files](https://developers.google.com/hotels/hotel-prices/dev-guide/pos-overview)
- [Landing-page variables](https://developers.google.com/hotels/hotel-prices/dev-guide/pos-urls)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
