export interface Client {
    id?: number;
    imageUrl?: string | File;  // mejor que 'any'
    typeDocument: string;
    numberDocument: number;
    nameClient: string;
    lastname: string;
    birthday: Date;
    cellphone: number;
    email: string;
    registrationDate?: Date;
    addressClient: string;
    state?: 'A' | 'I'; // activo / inactivo
    visitFrequency: 'N' | 'F' | 'O'; // Nuevo / Frecuente / Ocasional
}
