export type BespokeStatus = 
  | 'Pending' 
  | 'Reviewing' 
  | 'Quoted' 
  | 'Approved' 
  | 'CAD Design' 
  | 'In Production' 
  | 'Stone Setting' 
  | 'Polishing' 
  | 'Quality Check' 
  | 'Shipped' 
  | 'Delivered';

export interface BespokeConsultation {
  id: string;
  type: 'Video Call' | 'Store Visit' | 'Phone Consultation';
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface BespokeOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;

  jewelleryType: string;
  metalType: string;
  metalSubType?: string;
  goldPurity?: string;
  gemstone?: string;
  ringSize?: string;
  budgetRange?: string;
  occasion?: string;
  deadline?: string;

  description: string;
  inspirationText?: string;
  engravingText?: string;
  additionalNotes?: string;

  inspirationImages: string[];
  
  status: BespokeStatus;
  createdAt: string;
  updatedAt: string;

  // Added fields from admin actions
  quoteAmount?: number;
  quoteNotes?: string;
  cadImages?: string[];
  productionNotes?: string[];
}

export interface BespokeOrderRequestPayload {
  name: string;
  email: string;
  phone: string;
  country?: string;
  jewelleryType: string;
  metalType: string;
  metalSubType?: string;
  goldPurity?: string;
  gemstoneSelection?: string;
  ringSize?: string;
  budgetRange?: string;
  occasion?: string;
  deadline?: string;
  description: string;
  inspirationText?: string;
  engravingText?: string;
  additionalNotes?: string;
  inspirationImages: File[]; // Assuming FormData upload
}

export interface BespokeConsultationRequestPayload {
  type: 'Video Call' | 'Store Visit' | 'Phone Consultation';
  date: string;
  timeSlot: string;
  notes?: string;
}
