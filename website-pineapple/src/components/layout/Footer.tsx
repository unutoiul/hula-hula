import East from '@mui/icons-material/East';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import NorthEast from '@mui/icons-material/NorthEast';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import WhatsApp from '@mui/icons-material/WhatsApp';
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

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

// The plum closing block on every page: one last invitation to book, then
// the page's sections, how to find and reach the hotel, the rest of the
// Hula Hula family and the small print. On phones every link is a full
// 44px row, so it's easy to tap.
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
        <div className="royal-footer-contact">
          <h3>Find us in Krabi</h3>
          <a href={CONTACT.maps} {...external}><PlaceOutlined aria-hidden /><span>{CONTACT.address}</span></a>
          <a href={CONTACT.landlineTel}><PhoneRounded aria-hidden /><span>{CONTACT.landline}</span></a>
          <a href={CONTACT.whatsapp} {...external}><WhatsApp aria-hidden /><span>WhatsApp {CONTACT.phone}</span></a>
          <a href={`mailto:${CONTACT.email}`}><MailOutlineRounded aria-hidden /><span>{CONTACT.email}</span></a>
        </div>
        <div className="royal-footer-family">
          <h3>More Hula Hula days</h3>
          {SITES.filter(site => site.id !== 'pineapple').map(site => <a key={site.id} href={site.url} {...external}><span>{site.name}</span><NorthEast aria-hidden /></a>)}
          <div className="royal-footer-social">
            <a href={CONTACT.instagram} {...external} aria-label="Royal Pineapple on Instagram"><Instagram /></a>
            <a href={CONTACT.facebook} {...external} aria-label="Royal Pineapple on Facebook"><Facebook /></a>
            <a href={CONTACT.tiktok} {...external} aria-label="Royal Pineapple on TikTok"><MusicNoteRounded /></a>
          </div>
        </div>
      </div>
      {ONSITE_BOOKING && <div className="royal-footer-payments"><PaymentMethods /></div>}
      <div className="royal-footer-bottom"><p>© {new Date().getFullYear()} Royal Pineapple Hotel<MotionToggleLink /></p><DesignCredit light /></div>
    </div>
  </footer>;
}
