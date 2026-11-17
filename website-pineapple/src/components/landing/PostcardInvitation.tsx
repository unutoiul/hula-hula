import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { useState } from 'react';
import { Reveal } from '../common/ScrollMotion';
import { artwork, postcards } from './artwork';
import { PostcardDialog } from './PostcardDialog';
import './keepsake-invitation.css';

export function PostcardInvitation() {
  const [previewOpen, setPreviewOpen] = useState(false);
  return <section className="keepsake-invitation" aria-labelledby="keepsake-invitation-title">
    <div className="royal-wrap">
      <Reveal y={20}><div className="keepsake-invitation-card">
        <figure className="keepsake-invitation-art">
          <img src={artwork.writingSet} alt="A pink envelope, a watercolor postcard of the hotel, a rose-gold pen and tropical flowers" width={1536} height={1024} loading="lazy" decoding="async" />
          <figcaption>Greetings from Krabi.</figcaption>
        </figure>
        <div className="keepsake-invitation-copy">
          <p className="royal-eyebrow"><span />A souvenir for your screen</p>
          <h2 id="keepsake-invitation-title">Send yourself<br /><em>a little sunshine.</em></h2>
          <p>Golden arches. Pink pool days. Pick a postcard or a vintage travel badge — a little piece of Royal Pineapple for you to keep.</p>
          <div className="keepsake-invitation-actions">
            <Button href="#postcards" variant="contained" endIcon={<East />}>Explore the keepsakes</Button>
            <button type="button" onClick={() => setPreviewOpen(true)}>Preview a postcard <span aria-hidden="true">↗</span></button>
          </div>
          <div className="keepsake-invitation-signature"><img src="/logo/royal-pineapple.svg" alt="" aria-hidden="true" width={52} height={44} loading="lazy" /><p>Postcards & travel badges.<br /><span>Free to download. Lovely to keep.</span></p></div>
        </div>
      </div></Reveal>
    </div>
    <PostcardDialog postcard={previewOpen ? postcards[0] : null} onClose={() => setPreviewOpen(false)} />
  </section>;
}
