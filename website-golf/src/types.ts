// Shared shapes used across the page's sections and data files.

/** [label, href] — href is an in-page anchor like "#course". */
export type NavItem = [label: string, href: string];

export interface ContactInfo {
  /** Mobile number, also the WhatsApp line. */
  phone: string;
  tel: string;
  whatsapp: string;
  email: string;
  lineId: string;
  line: string;
  facebook: string;
  instagram: string;
  /** Where the club is, in words. */
  area: string;
  maps: string;
  /** The sister resort in Ao Nang. */
  resort: string;
}
