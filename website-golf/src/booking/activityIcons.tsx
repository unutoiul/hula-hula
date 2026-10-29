import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import SportsGolfRounded from '@mui/icons-material/SportsGolfRounded';
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import type { SvgIconProps } from '@mui/material';
import type { ActivityIconKey } from './config';

// The icons staff can pick for an activity in /admin.
export const ICON_COMPONENTS: Record<ActivityIconKey, typeof GolfCourseRounded> = {
  golf: GolfCourseRounded, football: SportsSoccerRounded, flag: FlagRounded, range: SportsGolfRounded,
  lesson: SchoolRounded, trophy: EmojiEventsRounded, group: GroupsRounded, star: StarRounded,
};

export function ActivityIcon({ icon, ...props }: { icon: ActivityIconKey | undefined } & SvgIconProps) {
  const Icon = ICON_COMPONENTS[icon ?? 'golf'] ?? GolfCourseRounded;
  return <Icon {...props} />;
}
