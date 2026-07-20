export interface KohaConfig {
  baseUrl: string;
  authType: "basic" | "oauth2";
  username?: string;
  password?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthTokenUrl?: string;
  libraryId?: string;
}

export interface Biblio {
  biblio_id: number;
  title: string;
  subtitle?: string;
  author?: string;
  author_sort?: string;
  copyrightdate?: string;
  isbn?: string;
  issn?: string;
  subject?: string[];
  publishercode?: string;
  place?: string;
  pages?: string;
  url?: string[];
  notes?: string;
  seriestitle?: string;
  series?: string;
  language?: string;
  cn_class?: string;
  cn_source?: string;
  cn_sort?: string;
  content_type?: string;
  items?: Item[];
  hostitem?: Biblio[];
}

export interface Item {
  item_id: number;
  biblio_id: number;
  barcode?: string;
  callnumber?: string;
  homebranch?: string;
  holdingbranch?: string;
  location?: string;
  itype?: string;
  itemlost?: number;
  withdrawn?: number;
  onloan?: string;
  datelastseen?: string;
  datelastborrowed?: string;
  stockremark?: string;
  notforloan?: number;
  damaged?: number;
  restricted?: number;
  enumserial?: string;
  copynumber?: string;
  permanent_location?: string;
}

export interface Patron {
  patron_id: number;
  cardnumber?: string;
  surname: string;
  firstname?: string;
  userid: string;
  email?: string;
  phone?: string;
  branchcode?: string;
  categorycode?: string;
  dateenrolled?: string;
  dateofbirth?: string;
  sex?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  last_seen?: string;
  checkouts_count?: number;
  overdues_count?: number;
  account_balance?: number;
}

export interface Checkout {
  checkout_id: number;
  patron_id: number;
  item_id: number;
  biblio_id?: number;
  due_date: string;
  checkout_date: string;
  library_id?: string;
  renewals_count?: number;
  auto_renew?: boolean;
  item?: Item;
  biblio?: Biblio;
}

export interface Hold {
  hold_id: number;
  patron_id: number;
  biblio_id: number;
  item_id?: number;
  priority?: number;
  placed_on: string;
  last_pickup_date?: string;
  waiting_since?: string;
  status?: string;
  suspend?: boolean;
  suspended_until?: string;
  itemnumber?: number;
  item?: Item;
  biblio?: Biblio;
}

export interface AccountLine {
  accountlines_id: number;
  patron_id: number;
  item_id?: number;
  amount: number;
  amountoutstanding?: number;
  description?: string;
  accounttype?: string;
  date: string;
  last_payment?: string;
  payment_type?: string;
}

export interface SearchResult {
  total: number;
  biblios: Biblio[];
}

export type RootStackParamList = {
  "(tabs)": undefined;
  book/[id]: { id: number };
  search: { query?: string };
  login: undefined;
  scanner: undefined;
  ai: undefined;
};

export type TabParamList = {
  index: undefined;
  search: undefined;
  favorites: undefined;
  loans: undefined;
  profile: undefined;
};
