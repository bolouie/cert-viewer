// Domain types - shared source of truth
export interface CertificateMeta {
    slug: string;
    title: string;
    issuer: string; 
    imagePath: string;
    verifyUrl?: string; // optional - not every cert has one yet
}

export interface Visit {
    id: number;
    cert_slug: string;
    path: string;
    country: string | null;
    city: string | null;
    user_agent: string | null;
    referrer: string | null;
    created_at: string;
}

export interface StatsResponse {
    totals: {
        cert_slug: string;
        total: number;
    }[];

    last_7_days: {
        cert_slug: string;
        total: number;
    }[];

    by_country: {
        cert_slug: string;
        country: string;
        total: number
    }[];

    recent: Pick<Visit, "cert_slug" | "country" | "city" | "created_at">[];
}