import { useLocation } from '../router';
import { ExperiencesPage } from './ExperiencesPage';
import { MeetingsPage } from './MeetingsPage';
import { RoomPage } from './RoomPage';

// The pages beyond the homepage, in one bundle fetched when someone goes there.
export default function InnerPages() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/rooms/')) return <RoomPage key={pathname} id={pathname.slice('/rooms/'.length).replace(/\/$/, '')} />;
  if (pathname.startsWith('/meetings')) return <MeetingsPage />;
  return <ExperiencesPage />;
}
