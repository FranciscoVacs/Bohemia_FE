export interface CreatePurchaseDTO {
    ticketQuantity: number;
    ticketTypeId: number;
}

export interface CreatePreferenceDTO {
    ticketTypeName: string;
    ticketNumbers: number;
    price: number;
}