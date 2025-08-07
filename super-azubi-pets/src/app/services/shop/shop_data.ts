import { timeStamp } from "console";
import { TeamAnimal_Response } from "../teamAnimal/team-animal_data";

export class TeamAnimal {

    private name: string;
    private emoji: string;
    private health: number;
    private attack: number;
    private tier: number;
    private level: number;
    private skill: string;

    constructor(name : string, emoji: string, health : number, attack : number, tier : number, level : number, skill: string) {
        this.name = name;
        this.emoji = emoji;
        this.health = health;
        this.attack = attack;
        this.tier = tier;
        this.level = level;
        this.skill = skill;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setEmoji(emoji: string) {
        this.emoji = emoji;
    }

    public setHealth(health: number) {
        this.health = health;
        if(this.health > 50) {
            this.health = 50;
        }
        if(this.health < 1) {
            this.health = 1;
        }
    }

    public setAttack(attack: number) {
        this.attack = attack;
        if(this.attack > 50) {
            this.attack = 50;
        }
        if(this.attack < 1) {
            this.attack = 1;
        }
    }

    public setTier(tier: number) {
        this.tier = tier;
    }

    public setLevel(level: number) {
        this.level = level;
        if(this.level > 20) {
            this.level = 20;
        }
    }

    public setSkill(skill: string) {
        this.skill = skill;
    }

    public getName() : string {
        return this.name;
    }

    public getEmoji() : string {
        return this.emoji;
    }

    public getHealth() : number {
        return this.health;
    }

    public getAttack() : number {
        return this.attack;
    }

    public getTier() : number {
        return this.tier;
    }

    public getLevel() : number {
        return this.level;
    }

    public getSkill() : string {
        return this.skill;
    }

    public levelUp() : boolean {
        if(this.level >= 20) {
            return false;
        }
        this.level++;

        const healthBonus: number = clamp(this.health * 0.15, 1, 5);
        const attackBonus: number = clamp(this.attack * 0.15, 1, 5);      

        this.setHealth(this.health += Math.round(healthBonus));
        this.setAttack(this.attack += Math.round(attackBonus));

        return true;
    }
}

export interface ShopAnimal {
    readonly name: string;
    readonly emoji: string;
    readonly health: number;
    readonly attack: number;
    readonly tier: number;
    readonly skill: string;
    isFrozen: boolean;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
