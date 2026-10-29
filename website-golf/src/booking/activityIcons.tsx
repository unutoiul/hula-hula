import FlagRounded from '@mui/icons-material/FlagRounded';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded';
import type { SvgIconProps } from '@mui/material';
import type { ActivityId } from './config';

const ICONS: Record<ActivityId, typeof GolfCourseRounded> = {
  golf: GolfCourseRounded, footgolf: SportsSoccerRounded, puttgolf: FlagRounded, range: SportsGolfRounded, lesson: SchoolRounded,
};

export function ActivityIcon({ activity, ...props }: { activity: ActivityId } & SvgIconProps) {
  const Icon = ICONS[activity];
  return <Icon {...props} />;
}
