export interface Service {
        code: string,
        name_service: string,
        category?: 'CC' | 'CM' | 'CP' | 'CR' | 'DC' | 'DR' | 'DM' | 'DP' | 'DD',
        description_service: string,
        price: number,
        registration_date: Date,
        state?: true | false;
}
