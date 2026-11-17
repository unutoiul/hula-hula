import CloudOutlined from '@mui/icons-material/CloudOutlined';
import { Box, Button, Container } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { onCloudMenu } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { artwork } from '../landing/artwork';
import { Reveal } from '../common/ScrollMotion';
import { WellnessServiceIcon } from './WellnessServiceIcon';
import './wellness.css';

export function WellnessSection() {
  const openContact = useContactForm();
  return <Box id="wellness" component="section" aria-labelledby="wellness-heading" sx={{ bgcolor: 'primary.light', scrollMarginTop: SECTION_SCROLL_OFFSET, pb: { xs: 6, md: 8 } }}>
    <Container maxWidth="xl"><Reveal>
      <div className="wellness-card">
        <div className="wellness-art">
          <img src={artwork.hammock} alt="A pink pineapple enjoying a peaceful moment in a tropical hammock" width={1000} height={667} loading="lazy" />
          <p>A little time on cloud nine.</p>
        </div>
        <div className="wellness-content">
          <div className="wellness-topline"><span><CloudOutlined aria-hidden="true" />On Cloud Wellness</span><span>Aveda salon partner</span></div>
          <h2 id="wellness-heading">A little time, just for you.</h2>
          <p className="wellness-intro">Hair care, gentle massage and beauty treatments. Pick your little way to unwind.</p>
          <ul className="wellness-services" aria-label="Wellness treatments">
            {onCloudMenu.map(item => <li key={item.icon} className="wellness-service">
              <span className="wellness-service-icon"><WellnessServiceIcon kind={item.icon} /></span>
              <div className="wellness-service-copy">
                <div className="wellness-service-title"><h3>{item.title}</h3>
                  {item.brand && <span className={`wellness-service-brand wellness-service-brand-${item.brand}`}>
                    <img src={`/logo/wellness/${item.brand}.png`} alt={item.brand === 'aveda' ? 'Aveda' : 'Cirépil'} width={item.brand === 'aveda' ? 60 : 64} height={item.brand === 'aveda' ? 16 : 29} loading="lazy" />
                  </span>}
                </div>
                <p>{item.detail}</p>
              </div>
            </li>)}
          </ul>
          <div className="wellness-footer">
            <p>Not sure what to choose?<br />Our team can help you find your little pause.</p>
            <Button onClick={() => openContact({ topic: 'On Cloud salon & spa', message: 'Hello Royal Pineapple! I’d like to book a treatment at On Cloud.', page: 'On Cloud Wellness' })} variant="contained">Book a treatment</Button>
          </div>
        </div>
      </div>
    </Reveal></Container>
  </Box>;
}
