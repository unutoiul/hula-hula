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
supports the custom website is needed. Google's hotel-owner guidance, checked
on 13 November 2026, says new direct integrations are currently unavailable due
to high demand and directs hotels to an existing connectivity partner. Do not
substitute another booking destination without confirming custom-site support.

The saved SiteMinder Direct Booking API connection was verified on 13 November
2026: property data, room types, rates and live quotes returned successfully.
This API is read-only and has no Google distribution configuration endpoints.
Access to its token does not provide access to the SiteMinder account's Google
or Demand Plus settings.

Send the following request through the hotel's SiteMinder support account:

> We want Google free booking links for Hula Hula Resort to show our direct
> prices and send guests to https://www.hulahularesort.com/book. Our custom
> booking website already reads live rates and availability through your Direct
> Booking API and accepts payments through Stripe. Can SiteMinder publish our
> rates to Google using this custom booking destination, preserving the selected
> dates and adult/child counts? Please confirm whether this is supported, the
> activation steps, and any fees or commission before enabling a service. Our
> website's automatically applied public offers must also be reflected in the
> prices sent to Google. We want guests to complete booking on our website.

This request has been prepared only; no message has been sent and no Google
listing or paid service has been activated.

Use `google-hotels-landing-pages.xml` as the English/THB landing-page definition
for the provider. It preserves Google's selected check-in, check-out, adult and
child counts. The booking page displays live rates and terms for that itinerary.
The definition omits `DisplayNames`, as Google requires for direct hotel and
CRS suppliers; Google takes the display name from the matched hotel's listing.
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

## Independent connectivity candidate: Mirai Metasearch

Research checked on 13 November 2026. Mirai appears in Google's hotel
connectivity partner directory. Its current Metasearch Connectivity page says
the service works regardless of booking engine; its service FAQ explicitly
allows using another booking engine. This makes it a candidate for Hula Hula's
existing custom booking flow. Acceptance of this particular implementation,
Google free-booking-links-only service, availability for a single Thailand
property, fees and implementation effort still require Mirai's confirmation.

Prepared enquiry (not sent):

> We operate Hula Hula Resort in Ao Nang, Krabi, Thailand and want connectivity
> for Google Free Booking Links for one property. Our existing custom booking
> engine is https://www.hulahularesort.com/book and payments run through our own
> Stripe integration. SiteMinder supplies live rates and availability through
> its Direct Booking API. Our website also applies public offers, so Google
> must receive the final website prices, including those discounts.
>
> Can you connect this existing booking engine to Google while guests complete
> their booking on our website? Please confirm support for Google free booking
> links without a paid advertising campaign, and quote setup/integration fees,
> monthly fees, commission on free-link bookings, any minimum spend, contract
> term and onboarding time. Please also confirm whether you support one hotel
> in Thailand and provide your rate-feed API specification and booking-link
> requirements for a custom integration.

Technical brief for the provider:

- Currency: THB. Initial language: English.
- Booking destination and itinerary parameters are defined in
  `google-hotels-landing-pages.xml`.
- The current public availability endpoint is
  `/api/booking/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&adults=2&children=0`.
  It returns the website's stay quotes and policies. A provider-specific feed
  adapter can be designed after delivery format and request volume are agreed.
- Match full stay prices, mandatory taxes/fees, guest counts, meal plans and
  cancellation terms. Do not send a payment deposit as the full stay price.
- Confirm child-age handling before enabling Google itineraries with children.
- Confirm rate freshness, query volume and authentication requirements; the
  underlying SiteMinder key is limited to 100 requests per minute and stays
  server-side.

Product and enquiry page:
https://www.mirai.com/what-we-do/metasearch-connectivity/

## Official references

- [Google free booking links](https://support.google.com/hotelprices/answer/10472393?hl=en)
- [Google hotel owners: share your rates](https://support.google.com/hotelprices/answer/11946931?hl=en)
- [SiteMinder Direct Booking API scope](https://developer.siteminder.com/direct-booking-api/guides/integration-requirements)
- [Hotel price feeds](https://developers.google.com/hotels/hotel-prices/dev-guide/data-feeds)
- [Landing-page files](https://developers.google.com/hotels/hotel-prices/dev-guide/pos-overview)
- [Landing-page file syntax](https://developers.google.com/hotels/hotel-prices/dev-guide/pos-syntax)
- [Landing-page variables](https://developers.google.com/hotels/hotel-prices/dev-guide/pos-urls)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google connectivity partner directory](https://developers.google.com/hotels/connectivity-partners/)
- [Mirai Metasearch Connectivity](https://www.mirai.com/what-we-do/metasearch-connectivity/)
- [Mirai external booking-engine support and pricing FAQ](https://www.mirai.com/blog/miraimetasearch-an-advanced-solution-to-connect-your-direct-sales-with-metasearch-engines/)
