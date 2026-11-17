import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { ONSITE_BOOKING } from '../../context/BookingSearchContext';
import { CONTACT } from '../../data/content';
import { brand } from '../../theme';
import { sectionLink, useLocation } from '../../router';
import { PaymentMethods } from '../booking/PaymentMethods';
import { ClubMark } from '../common/ClubMark';
import { artwork } from '../landing/artwork';
import { DesignCredit } from './DesignCredit';
import { MotionToggleLink } from './MotionToggle';
import { SITES } from './SiteSwitcher';
import './footer.css';

const links = [['Find your room', '#rooms'], ['Eat & unwind', '#dine'], ['A little wellness', '#wellness'], ['Explore Krabi', '#programme'], ['Meet & celebrate', '#meet'], ['Say hello', '#contact']] as const;

export function Footer() {
  const { pathname } = useLocation();
  return <footer className="royal-footer" style={{ backgroundColor: brand.plum }}>
    <img className="royal-footer-floral" src={artwork.flowers} alt="" aria-hidden="true" width={900} height={459} loading="lazy" />
    <div className="royal-footer-wrap">
      <div className="royal-footer-invitation">
        <div><p className="royal-footer-eyebrow">Make yourself a little at home.</p><h2>Your next postcard<br /><em>starts here.</em></h2></div>
        <Button {...sectionLink('#booking-search', pathname)} variant="contained" endIcon={<East />}>Let’s make it a stay</Button>
      </div>
      <div className="royal-footer-grid">
        <div className="royal-footer-brand"><ClubMark white size="compact" /><p>A little European charm.<br />A warm Thai heart.<br /><span>Part of the Hula Hula family.</span></p></div>
        <div className="royal-footer-links"><h3>A little look around</h3><nav aria-label="Footer navigation">{links.map(([label, href]) => <a key={href} {...sectionLink(href, pathname)}>{label}</a>)}</nav></div>
        <div className="royal-footer-contact"><h3>Find us in Krabi</h3><address>{CONTACT.address}</address><a href={CONTACT.maps} target="_blank" rel="noopener noreferrer">Find us on the map ↗</a><a href={CONTACT.landlineTel}>{CONTACT.landline}</a><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
        <div className="royal-footer-family"><h3>More Hula Hula days</h3>{SITES.filter(site => site.id !== 'pineapple').map(site => <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer">{site.name} ↗</a>)}<div className="royal-footer-social"><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></div></div>
      </div>
      {ONSITE_BOOKING && <div className="royal-footer-payments"><PaymentMethods /></div>}
      <div className="royal-footer-bottom"><p>© {new Date().getFullYear()} Royal Pineapple Hotel<MotionToggleLink /></p><DesignCredit light /></div>
    </div>
  </footer>;
}
