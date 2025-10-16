#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rawDataPath = path.join(projectRoot, 'data', 'birthflowers-ko.json');
const translationsPath = path.join(projectRoot, 'data', 'birthflower-translations-en.json');
const outputJsonPath = path.join(projectRoot, 'data', 'birthflowers-compiled.json');
const outputJsPath = path.join(projectRoot, 'data', 'birthflowers-compiled.js');

const HANGUL_REGEX = /[\u3131-\uD79D]/;

function createRomanizer() {
    const INITIALS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
    const MEDIALS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
    const FINALS = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lk', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

    return function romanize(input = '') {
        if (!input) {
            return '';
        }

        let result = '';
        for (const char of input) {
            const code = char.charCodeAt(0);
            if (code < 0xac00 || code > 0xd7a3) {
                result += char;
                continue;
            }

            const syllableIndex = code - 0xac00;
            const initialIndex = Math.floor(syllableIndex / 588);
            const medialIndex = Math.floor((syllableIndex % 588) / 28);
            const finalIndex = syllableIndex % 28;

            const initial = INITIALS[initialIndex] || '';
            const medial = MEDIALS[medialIndex] || '';
            const final = FINALS[finalIndex] || '';

            result += initial + medial + final;
        }

        return result;
    };
}

const romanizeHangul = createRomanizer();

function toDisplayCase(value = '') {
    if (!value) {
        return '';
    }

    if (value === value.toLowerCase()) {
        return value
            .split(/(\s+|-)/)
            .map(part => {
                if (!part.trim() || part === '-') {
                    return part;
                }
                return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join('');
    }

    return value;
}

function ensureAscii(value, fallbackSource = '') {
    const base = typeof value === 'string' ? value.trim() : '';

    if (!base) {
        if (fallbackSource) {
            const romanizedFallback = romanizeHangul(fallbackSource);
            return romanizedFallback ? toDisplayCase(romanizedFallback) : '';
        }
        return '';
    }

    if (!HANGUL_REGEX.test(base)) {
        return toDisplayCase(base);
    }

    const romanized = romanizeHangul(fallbackSource || base);
    if (!romanized) {
        return '';
    }

    return toDisplayCase(romanized);
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toCanonicalKey(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value
        .normalize('NFC')
        .replace(/[\s·•ㆍ]/g, '')
        .trim();
}

function buildCanonicalMap(dictionary = {}) {
    return Object.entries(dictionary).reduce((acc, [key, value]) => {
        const canonicalKey = toCanonicalKey(key);
        if (canonicalKey && !acc[canonicalKey]) {
            acc[canonicalKey] = value;
        }
        return acc;
    }, {});
}

function selectTranslation(candidates, fallback) {
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim() && !HANGUL_REGEX.test(candidate)) {
            return candidate.trim();
        }
    }

    if (typeof fallback === 'string') {
        return fallback.trim();
    }

    return '';
}

function buildDataset(rawData, translationData = {}) {
    const months = rawData?.months || [];
    const keywordTranslations = translationData?.keywords || {};
    const nameTranslations = translationData?.names || {};

    const canonicalKeywordTranslations = buildCanonicalMap(keywordTranslations);
    const canonicalNameTranslations = buildCanonicalMap(nameTranslations);

    const koData = {};
    const enData = {};
    const koNameToEnName = {};
    const koNameToEnNameCanonical = {};

    const rawKeywordsByKey = {};

    const translateName = (value) => {
        if (!value) return '';
        const canonicalValue = toCanonicalKey(value);
        const strippedValue = value.replace(/\s+/g, '');
        const selected = selectTranslation([
            nameTranslations[value],
            strippedValue !== value ? nameTranslations[strippedValue] : null,
            canonicalValue && nameTranslations[canonicalValue],
            canonicalValue && canonicalNameTranslations[canonicalValue],
            canonicalValue && koNameToEnNameCanonical[canonicalValue],
            koNameToEnName[value],
        ], value);

        return ensureAscii(selected, value);
    };

    const translateKeyword = (keyword) => {
        const trimmed = keyword?.trim?.() || '';
        if (!trimmed) return '';
        const canonicalKeyword = toCanonicalKey(trimmed);
        const strippedKeyword = trimmed.replace(/\s+/g, '');
        const selected = selectTranslation([
            keywordTranslations[trimmed],
            strippedKeyword !== trimmed ? keywordTranslations[strippedKeyword] : null,
            canonicalKeyword && keywordTranslations[canonicalKeyword],
            canonicalKeyword && canonicalKeywordTranslations[canonicalKeyword],
        ], trimmed);

        return ensureAscii(selected, trimmed);
    };

    months.forEach(monthEntry => {
        const month = monthEntry?.month;
        const days = monthEntry?.days || [];
        if (!month || !Array.isArray(days)) {
            return;
        }

        days.forEach(dayEntry => {
            const day = dayEntry?.day;
            if (!day) {
                return;
            }

            const key = `${month}-${day}`;
            const keywordsArray = Array.isArray(dayEntry.keywords) ? dayEntry.keywords : [];
            const koKeywords = keywordsArray.map(keyword => `#${keyword}`).join(' ');

            koData[key] = {
                name: dayEntry.name,
                en_name: dayEntry.enName,
                keywords: koKeywords,
                description: dayEntry.description,
                goodMatch: dayEntry.goodMatch,
                badMatch: dayEntry.badMatch,
            };

            rawKeywordsByKey[key] = keywordsArray;

            if (dayEntry?.name && dayEntry?.enName) {
                koNameToEnName[dayEntry.name] = dayEntry.enName;
                const canonicalKey = toCanonicalKey(dayEntry.name);
                if (canonicalKey && !koNameToEnNameCanonical[canonicalKey]) {
                    koNameToEnNameCanonical[canonicalKey] = dayEntry.enName;
                }
            }
        });
    });

    Object.entries(koData).forEach(([key, koItem]) => {
        const keywords = rawKeywordsByKey[key] || [];
        const enKeywords = keywords
            .map(keyword => translateKeyword(keyword))
            .filter(Boolean)
            .map(translated => `#${translated}`)
            .join(' ');

        const englishName = ensureAscii(koItem.en_name, koItem.name);

        enData[key] = {
            name: englishName,
            en_name: englishName,
            keywords: enKeywords,
            description: englishName
                ? `You, who resemble the ${englishName} that blooms after enduring a harsh winter, are someone who brings hope to those around you.`
                : 'You are someone who brings hope to those around you.',
            goodMatch: translateName(koItem.goodMatch),
            badMatch: translateName(koItem.badMatch),
        };
    });

    const offending = [];
    Object.entries(enData).forEach(([key, entry]) => {
        Object.entries(entry).forEach(([field, value]) => {
            if (typeof value === 'string' && HANGUL_REGEX.test(value)) {
                offending.push(`${key}:${field}`);
            }
        });
    });

    if (offending.length > 0) {
        throw new Error(`English dataset still contains Hangul entries: ${offending.slice(0, 5).join(', ')}`);
    }

    return { ko: koData, en: enData };
}

function writeDataset(dataset) {
    fs.writeFileSync(outputJsonPath, JSON.stringify(dataset, null, 2));
    fs.writeFileSync(outputJsPath, `window.BIRTHFLOWER_DATASET = ${JSON.stringify(dataset)};`);
}

function main() {
    const rawData = readJson(rawDataPath);
    const translations = readJson(translationsPath);
    const dataset = buildDataset(rawData, translations);
    writeDataset(dataset);

    const entryCount = Object.keys(dataset.ko || {}).length;
    console.log(`Generated dataset with ${entryCount} entries.`);
}

if (require.main === module) {
    main();
}
