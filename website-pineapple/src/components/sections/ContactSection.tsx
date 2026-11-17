import Call from '@mui/icons-material/Call';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import MapRounded from '@mui/icons-material/MapRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Button } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { CONTACT } from '../../data/content';
import { artwork } from '../landing/artwork';
import { Reveal } from '../common/ScrollMotion';
import { SocialIcon } from '../common/SocialIcon';

export function ContactSection() {
  const openContact = useContactForm();
  return <section id="contact" className="royal-contact" aria-labelledby="contact-heading">
    <div className="royal-wrap"><Reveal><div className="royal-contact-grid">
      <div className="royal-contact-art royal-contact-letter">
        <img src={artwork.writingSet} alt="An open pink envelope, a Royal Pineapple holiday postcard and a fountain pen, with watercolor tropical flowers" width={1000} height={667} loading="lazy" decoding="async" />
        <span className="royal-contact-note">A little note. A lovely beginning.</span>
      </div>
      <div className="royal-contact-copy">
        <p className="royal-eyebrow">A real person. A warm welcome.</p>
        <h2 id="contact-heading">A little question?<br /><em>Say hello.</em></h2>
        <p>Tell us what you’re dreaming of. A room, a little getaway, a special surprise — we’ll help with the details.</p>
        <Button onClick={() => openContact({ topic: 'General question', page: 'Say hello' })} variant="contained" startIcon={<ChatBubbleOutlineRounded />}>Message the hotel</Button>
        <div className="royal-contact-actions">
          <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<WhatsApp />}><span>WhatsApp<small>{CONTACT.phone}</small></span></Button>
          <Button href={CONTACT.landlineTel} variant="outlined" startIcon={<Call />}><span>Call the hotel<small>{CONTACT.landline}</small></span></Button>
        </div>
        <address>{CONTACT.address}</address>
        <div className="royal-contact-socials">
          <SocialIcon href={CONTACT.maps} label="Royal Pineapple on Google Maps"><MapRounded /></SocialIcon>
          <SocialIcon href={CONTACT.facebook} label="Royal Pineapple on Facebook"><Facebook /></SocialIcon>
          <SocialIcon href={CONTACT.instagram} label="Royal Pineapple on Instagram"><Instagram /></SocialIcon>
          <SocialIcon href={CONTACT.tiktok} label="Royal Pineapple on TikTok"><MusicNoteRounded /></SocialIcon>
        </div>
      </div>
    </div></Reveal></div>
  </section>;
}
