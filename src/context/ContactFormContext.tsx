import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { ContactDialog } from '../components/contact/ContactDialog';

export interface ContactRequest {
  /** What the guest is asking about — shown in the popup and the email subject. */
  topic: string;
  /** A friendly opening line to start the message with. */
  message?: string;
  /** The section the guest opened the form from (included in the email). */
  page?: string;
}

const ContactFormContext = createContext<(request: ContactRequest) => void>(() => {});

// One contact popup for the whole page. Any "ask us" button calls
// useContactForm()({ topic, message }) to open it pre-filled; the popup emails
// the resort through /api/contact (and still offers WhatsApp as an option).
export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Kept after closing so the popup's content doesn't vanish mid-animation.
  const [request, setRequest] = useState<ContactRequest>({ topic: 'General question' });
  const openContact = useCallback((next: ContactRequest) => { setRequest(next); setOpen(true); }, []);
  return <ContactFormContext.Provider value={openContact}>
    {children}
    <ContactDialog open={open} request={request} onClose={() => setOpen(false)} />
  </ContactFormContext.Provider>;
}

export const useContactForm = () => useContext(ContactFormContext);
