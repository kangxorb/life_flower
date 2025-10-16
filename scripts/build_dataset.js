#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rawDataPath = path.join(projectRoot, 'data', 'birthflowers-ko.json');
const translationsPath = path.join(projectRoot, 'data', 'birthflower-translations-en.json');
const outputJsonPath = path.join(projectRoot, 'data', 'birthflowers-compiled.json');
const outputJsPath = path.join(projectRoot, 'data', 'birthflowers-compiled.js');

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
    const hangulRegex = /[\u3131-\uD79D]/;
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate && !hangulRegex.test(candidate)) {
            return candidate;
        }
    }
    return fallback;
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
        if (!value) return value;
        const canonicalValue = toCanonicalKey(value);
        const strippedValue = value.replace(/\s+/g, '');
        return selectTranslation([
            nameTranslations[value],
            strippedValue !== value ? nameTranslations[strippedValue] : null,
            canonicalValue && nameTranslations[canonicalValue],
            canonicalValue && canonicalNameTranslations[canonicalValue],
            canonicalValue && koNameToEnNameCanonical[canonicalValue],
            koNameToEnName[value],
        ], value);
    };

    const translateKeyword = (keyword) => {
        const trimmed = keyword?.trim?.() || '';
        if (!trimmed) return '';
        const canonicalKeyword = toCanonicalKey(trimmed);
        const strippedKeyword = trimmed.replace(/\s+/g, '');
        return selectTranslation([
            keywordTranslations[trimmed],
            strippedKeyword !== trimmed ? keywordTranslations[strippedKeyword] : null,
            canonicalKeyword && keywordTranslations[canonicalKeyword],
            canonicalKeyword && canonicalKeywordTranslations[canonicalKeyword],
        ], trimmed);
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

        enData[key] = {
            name: koItem.en_name,
            en_name: koItem.en_name,
            keywords: enKeywords,
            description: `You, who resemble the ${koItem.en_name} that blooms after enduring a harsh winter, are someone who brings hope to those around you.`,
            goodMatch: translateName(koItem.goodMatch),
            badMatch: translateName(koItem.badMatch),
        };
    });

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
