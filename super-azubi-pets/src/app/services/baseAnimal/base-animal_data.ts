export interface animal_response {
    name: string;
    emoji: string;
    health: number;
    attack: number;
    tier: number;
    skill: string;
}

export interface animal_response_list {
    baseanimals: animal_response[];
}