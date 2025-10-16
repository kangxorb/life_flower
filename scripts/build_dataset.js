#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rawDataPath = path.join(projectRoot, 'data', 'birthflowers-ko.json');
const translationsPath = path.join(projectRoot, 'data', 'birthflower-translations-en.json');
const outputJsonPath = path.join(projectRoot, 'data', 'birthflowers-compiled.json');
const outputJsPath = path.join(projectRoot, 'data', 'birthflowers-compiled.js');
const outputEnglishJsonPath = path.join(projectRoot, 'data', 'birthflowers-en.json');
const outputEnglishJsPath = path.join(projectRoot, 'data', 'birthflowers-en.js');

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

function selectTranslationWithSource(candidates, fallback) {
    for (const candidate of candidates) {
        const value = candidate?.value;
        if (typeof value === 'string' && value.trim() && !HANGUL_REGEX.test(value)) {
            return { text: value.trim(), source: candidate.source };
        }
    }

    if (typeof fallback === 'string' && fallback.trim()) {
        return { text: fallback.trim(), source: 'fallback' };
    }

    return { text: '', source: 'fallback' };
}

function buildDataset(rawData, translationData = {}) {
    const months = rawData?.months || [];
    const keywordTranslations = translationData?.keywords || {};
    const nameTranslations = translationData?.names || {};

    const canonicalKeywordTranslations = buildCanonicalMap(keywordTranslations);
    const canonicalNameTranslations = buildCanonicalMap(nameTranslations);

    const koData = {};
    const enData = {};
    const englishMonths = [];
    const koNameToEnName = {};
    const koNameToEnNameCanonical = {};

    const rawKeywordsByKey = {};

    const translateName = (value) => {
        if (!value) {
            return { text: '', source: 'empty' };
        }
        const canonicalValue = toCanonicalKey(value);
        const strippedValue = value.replace(/\s+/g, '');
        const { text, source } = selectTranslationWithSource([
            { value: nameTranslations[value], source: 'dictionary:exact' },
            strippedValue !== value ? { value: nameTranslations[strippedValue], source: 'dictionary:stripped' } : null,
            canonicalValue ? { value: nameTranslations[canonicalValue], source: 'dictionary:canonical' } : null,
            canonicalValue ? { value: canonicalNameTranslations[canonicalValue], source: 'dictionary:normalized' } : null,
            canonicalValue ? { value: koNameToEnNameCanonical[canonicalValue], source: 'dataset:canonical' } : null,
            { value: koNameToEnName[value], source: 'dataset:exact' },
        ].filter(Boolean), value);

        if (source === 'fallback') {
            return { text: ensureAscii('', value), source };
        }

        return { text: ensureAscii(text, value), source };
    };

    const translateKeyword = (keyword) => {
        const trimmed = keyword?.trim?.() || '';
        if (!trimmed) {
            return { text: '', source: 'empty' };
        }
        const canonicalKeyword = toCanonicalKey(trimmed);
        const strippedKeyword = trimmed.replace(/\s+/g, '');
        const { text, source } = selectTranslationWithSource([
            { value: keywordTranslations[trimmed], source: 'dictionary:exact' },
            strippedKeyword !== trimmed ? { value: keywordTranslations[strippedKeyword], source: 'dictionary:stripped' } : null,
            canonicalKeyword ? { value: keywordTranslations[canonicalKeyword], source: 'dictionary:canonical' } : null,
            canonicalKeyword ? { value: canonicalKeywordTranslations[canonicalKeyword], source: 'dictionary:normalized' } : null,
        ].filter(Boolean), trimmed);

        const formatKeyword = (value) => {
            if (!value) {
                return '';
            }
            const lowered = value.toLowerCase();
            return toDisplayCase(lowered);
        };

        if (source === 'fallback') {
            return { text: formatKeyword(ensureAscii('', trimmed)), source };
        }

        return { text: formatKeyword(ensureAscii(text, trimmed)), source };
    };

    const missingKeywordTranslations = new Set();
    const missingMatchTranslations = new Set();

    months.forEach(monthEntry => {
        const month = monthEntry?.month;
        const days = monthEntry?.days || [];
        if (!month || !Array.isArray(days)) {
            return;
        }

        const englishDays = [];

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

            englishDays.push({ key, month, day });
        });

        englishMonths.push({ month, days: englishDays });
    });

    Object.entries(koData).forEach(([key, koItem]) => {
        const keywords = rawKeywordsByKey[key] || [];
        const englishKeywordResults = keywords
            .map(keyword => ({
                original: keyword,
                result: translateKeyword(keyword),
            }))
            .filter(Boolean)
            .map(({ original, result }) => {
                if (!result.text) {
                    return null;
                }
                if (result.source === 'fallback') {
                    missingKeywordTranslations.add(original);
                }
                return result.text;
            })
            .filter(Boolean);

        const englishKeywordList = englishKeywordResults;

        const enKeywords = englishKeywordList
            .map(translated => `#${translated}`)
            .join(' ');

        const englishName = ensureAscii(koItem.en_name, koItem.name);

        const goodMatchResult = translateName(koItem.goodMatch);
        const badMatchResult = translateName(koItem.badMatch);

        if (goodMatchResult.source === 'fallback' && koItem.goodMatch) {
            missingMatchTranslations.add(koItem.goodMatch);
        }

        if (badMatchResult.source === 'fallback' && koItem.badMatch) {
            missingMatchTranslations.add(koItem.badMatch);
        }

        const englishEntry = {
            name: englishName,
            en_name: englishName,
            keywords: enKeywords,
            keywordsList: englishKeywordList,
            description: englishName
                ? `You, who resemble the ${englishName} that blooms after enduring a harsh winter, are someone who brings hope to those around you.`
                : 'You are someone who brings hope to those around you.',
            goodMatch: goodMatchResult.text,
            badMatch: badMatchResult.text,
        };

        enData[key] = englishEntry;

        const monthEntry = englishMonths.find(entry => entry.days.some(day => day.key === key));
        if (monthEntry) {
            const dayEntry = monthEntry.days.find(day => day.key === key);
            if (dayEntry) {
                dayEntry.entry = englishEntry;
            }
        }
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

    if (missingKeywordTranslations.size > 0) {
        throw new Error(`Missing English keyword translations for: ${Array.from(missingKeywordTranslations).slice(0, 10).join(', ')}`);
    }

    if (missingMatchTranslations.size > 0) {
        throw new Error(`Missing English match translations for: ${Array.from(missingMatchTranslations).slice(0, 10).join(', ')}`);
    }

    const englishMonthsFormatted = englishMonths
        .filter(monthEntry => monthEntry?.month)
        .map(monthEntry => ({
            month: monthEntry.month,
            days: monthEntry.days
                .filter(day => day?.day && day.entry)
                .map(day => ({
                    day: day.day,
                    name: day.entry.name,
                    enName: day.entry.en_name,
                    keywords: day.entry.keywordsList || [],
                    keywordsText: day.entry.keywords,
                    description: day.entry.description,
                    goodMatch: day.entry.goodMatch,
                    badMatch: day.entry.badMatch,
                })),
        }));

    return { ko: koData, en: enData, enMonths: englishMonthsFormatted };
}

function writeDataset(dataset) {
    const { ko, en, enMonths } = dataset;
    const compiled = { ko, en };

    fs.writeFileSync(outputJsonPath, JSON.stringify(compiled, null, 2));
    fs.writeFileSync(outputJsPath, `window.BIRTHFLOWER_DATASET = ${JSON.stringify(compiled)};`);

    const englishPayload = { months: enMonths };
    fs.writeFileSync(outputEnglishJsonPath, JSON.stringify(englishPayload, null, 2));
    fs.writeFileSync(outputEnglishJsPath, `window.BIRTHFLOWER_DATASET_EN = ${JSON.stringify(englishPayload)};`);
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
