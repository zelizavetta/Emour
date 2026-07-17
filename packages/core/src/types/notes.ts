import { UserRecord } from "./common.js";

export type EmotionType =
    | 'joy' | 'calm' | 'gratitude'
    | 'sadness' | 'anxiety' | 'anger' | 'fatigue' | 'fear';

export type EmotionPolarity = 'positive' | 'negative';

export interface EmotionOption {
    value: EmotionType;
    label: string;
    emoji: string;
    polarity: EmotionPolarity;
}

// 3 positive, 5 negative
export const EMOTIONS: EmotionOption[] = [
    { value: 'joy',        label: 'Радость',       emoji: '😊', polarity: 'positive' },
    { value: 'calm',       label: 'Спокойствие',   emoji: '😌', polarity: 'positive' },
    { value: 'gratitude',  label: 'Благодарность', emoji: '🙏', polarity: 'positive' },
    { value: 'sadness',    label: 'Грусть',        emoji: '😢', polarity: 'negative' },
    { value: 'anxiety',    label: 'Тревога',       emoji: '😰', polarity: 'negative' },
    { value: 'anger',      label: 'Злость',        emoji: '😠', polarity: 'negative' },
    { value: 'fatigue',    label: 'Усталость',     emoji: '😩', polarity: 'negative' },
    { value: 'fear',       label: 'Страх',         emoji: '😨', polarity: 'negative' },
];

export function emotionPolarity(value: EmotionType): EmotionPolarity {
    return EMOTIONS.find(e => e.value === value)?.polarity ?? 'positive';
}

export interface Note extends UserRecord {
    title: string;
    text: string;
    emotion: EmotionType;
}
