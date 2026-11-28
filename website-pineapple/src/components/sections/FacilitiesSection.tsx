import CakeRounded from '@mui/icons-material/CakeRounded';
import DirectionsBusRounded from '@mui/icons-material/DirectionsBusRounded';
import FitnessCenterRounded from '@mui/icons-material/FitnessCenterRounded';
import LaptopMacRounded from '@mui/icons-material/LaptopMacRounded';
import LocalCafeRounded from '@mui/icons-material/LocalCafeRounded';
import LocalLaundryServiceRounded from '@mui/icons-material/LocalLaundryServiceRounded';
import LocalParkingRounded from '@mui/icons-material/LocalParkingRounded';
import MeetingRoomRounded from '@mui/icons-material/MeetingRoomRounded';
import PoolRounded from '@mui/icons-material/PoolRounded';
import RestaurantRounded from '@mui/icons-material/RestaurantRounded';
import SelfImprovementRounded from '@mui/icons-material/SelfImprovementRounded';
import SpaRounded from '@mui/icons-material/SpaRounded';
import TourRounded from '@mui/icons-material/TourRounded';
import TwoWheelerRounded from '@mui/icons-material/TwoWheelerRounded';
import WifiRounded from '@mui/icons-material/WifiRounded';
import { Box, Container, Stack, Typography } from '@mui/material';
import { facilities, type FacilityIcon } from '../../data/content';
import { SECTION_HEADING, SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { sectionLink, useLocation } from '../../router';
import { fonts } from '../../theme';
import { ArtPicture } from '../landing/ArtPicture';
import { artwork } from '../landing/artwork';
import { Reveal } from '../common/ScrollMotion';

const ICON: Record<FacilityIcon, typeof PoolRounded> = {
  pool: PoolRounded,
  cafe: LocalCafeRounded,
  restaurant: RestaurantRounded,
  spa: SpaRounded,
  massage: SelfImprovementRounded,
  cowork: LaptopMacRounded,
  gym: FitnessCenterRounded,
  laundry: LocalLaundryServiceRounded,
  meeting: MeetingRoomRounded,
  shuttle: DirectionsBusRounded,
  tour: TourRounded,
  motorbike: TwoWheelerRounded,
  parking: LocalParkingRounded,
  wifi: WifiRounded,
  celebrate: CakeRounded,
};

// Everything the hotel has, in one grid: each tile says what it is, when
// it's open if that matters, and links on where there's more to see.
export function FacilitiesSection() {
  const { pathname } = useLocation();
  return (
    <Box id="facilities" component="section" sx={{ scrollMarginTop: SECTION_SCROLL_OFFSET, py: SECTION_Y }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,.9fr) minmax(0,2fr)' },
            gap: { xs: 5, lg: 6 },
            alignItems: 'start',
          }}
        >
          <Reveal sx={{ position: { lg: 'sticky' }, top: { lg: 120 }, textAlign: { xs: 'center', lg: 'left' } }}>
            <Typography variant="overline" color="primary.main">
              Facilities & services
            </Typography>
            <Typography variant="h2" sx={{ fontSize: SECTION_HEADING, lineHeight: 1.08, mt: 1.5 }}>
              All the little extras.
            </Typography>
            <Typography sx={{ mt: 2.5, color: 'text.secondary', lineHeight: 1.8, maxWidth: 440, mx: { xs: 'auto', lg: 0 } }}>
              A swim, a workout, a place to work, and a helping hand getting around. We’ve thought of a few things.
            </Typography>
            <ArtPicture
              image={artwork.mascot}
              sizes="180px"
              sx={{ mt: 3, width: 180, height: 200, objectFit: 'contain', mx: 'auto', display: { xs: 'none', lg: 'block' } }}
            />
          </Reveal>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              minWidth: 0,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0,1fr)',
                sm: 'repeat(2,minmax(0,1fr))',
                md: 'repeat(3,minmax(0,1fr))',
                lg: 'repeat(2,minmax(0,1fr))',
              },
              gap: { xs: 1.25, md: 1.75 },
            }}
          >
            {facilities.map((item) => {
              const Icon = ICON[item.icon];
              const link = item.href ? sectionLink(item.href, pathname) : null;
              const body = (
                <>
                  <Box
                    aria-hidden
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      '& svg': { fontSize: 21 },
                    }}
                  >
                    <Icon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="baseline" columnGap={1} flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontFamily: fonts.playful, fontSize: 19, lineHeight: 1.2 }}>{item.title}</Typography>
                      {item.hours && (
                        <Typography
                          component="span"
                          sx={{ fontSize: 11.5, fontWeight: 800, color: 'primary.main', letterSpacing: '.04em' }}
                        >
                          {item.hours}
                        </Typography>
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.5, mt: 0.4 }}>{item.detail}</Typography>
                  </Box>
                </>
              );
              const tileSx = {
                display: 'flex',
                gap: 1.75,
                alignItems: 'flex-start',
                height: '100%',
                p: 2,
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                textDecoration: 'none',
              } as const;
              return (
                <Box component="li" key={item.title} sx={{ minWidth: 0 }}>
                  {link ? (
                    <Box
                      component="a"
                      href={link.href}
                      onClick={link.onClick}
                      sx={{
                        ...tileSx,
                        transition: 'border-color .2s ease, transform .2s ease',
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                      }}
                    >
                      {body}
                    </Box>
                  ) : (
                    <Box sx={tileSx}>{body}</Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
