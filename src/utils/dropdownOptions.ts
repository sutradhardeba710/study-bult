import type { CustomSelectOption } from '../components/CustomSelect';
import type { MetaItem } from '../services/meta';

// ─── Emoji pickers ────────────────────────────────────────────────────────────

/** College → always 🏢 */
export const collegeEmoji = () => '🏢';

/** Semester → number badge (1️⃣–8️⃣), fallback 📅 */
export const semesterEmoji = (name: string): string => {
    const n = name.toLowerCase();
    if (/\b1(st)?\b|first/.test(n)) return '1️⃣';
    if (/\b2(nd)?\b|second/.test(n)) return '2️⃣';
    if (/\b3(rd)?\b|third/.test(n)) return '3️⃣';
    if (/\b4(th)?\b|fourth/.test(n)) return '4️⃣';
    if (/\b5(th)?\b|fifth/.test(n)) return '5️⃣';
    if (/\b6(th)?\b|sixth/.test(n)) return '6️⃣';
    if (/\b7(th)?\b|seventh/.test(n)) return '7️⃣';
    if (/\b8(th)?\b|eighth/.test(n)) return '8️⃣';
    return '📅';
};

/** Course → keyword-matched emoji */
export const courseEmoji = (name: string): string => {
    const n = name.toLowerCase();
    if (/bca|mca|b\.?tech.*cs|computer science/.test(n)) return '💻';
    if (/b\.?tech|m\.?tech|engineer/.test(n)) return '⚙️';
    if (/mba|bba|management|business admin/.test(n)) return '📊';
    if (/bsc|m\.?sc|science/.test(n)) return '🔬';
    if (/ba\b|b\.?a\b|arts/.test(n)) return '🎨';
    if (/bcom|b\.?com|commerce/.test(n)) return '💹';
    if (/llb|law/.test(n)) return '⚖️';
    if (/mbbs|medical|nursing|pharma/.test(n)) return '🏥';
    if (/education|b\.?ed/.test(n)) return '🏫';
    if (/architecture/.test(n)) return '🏗️';
    return '📚';
};

/** Subject → keyword-matched emoji */
export const subjectEmoji = (name: string): string => {
    const n = name.toLowerCase();
    if (/math|maths|calculus|algebra|statistic|numerics|arithmetic/.test(n)) return '➗';
    if (/physics|mechanics|electro|optic|quantum|thermody/.test(n)) return '⚛️';
    if (/chemistry|organic|inorganic|biochem|reaction/.test(n)) return '🧪';
    if (/biology|botany|zoology|genetics|anatomy|cell|micro/.test(n)) return '🧬';
    if (/computer|programming|algorithm|data structure|software|network|web|database|os|operating|cyber/.test(n)) return '💻';
    if (/english|language|grammar|communication|writing|literature/.test(n)) return '📝';
    if (/history|civics|political|governance|constitution|society/.test(n)) return '🏛️';
    if (/geography|environment|ecology|earth|climate/.test(n)) return '🌍';
    if (/economics|finance|accounting|commerce|business|management/.test(n)) return '💹';
    if (/psychology|sociology|philosophy|ethics/.test(n)) return '🧠';
    if (/law|legal|jurisprudence/.test(n)) return '⚖️';
    if (/art|design|drawing|graphics/.test(n)) return '🎨';
    if (/music/.test(n)) return '🎵';
    if (/electronics|electrical|circuit|signal|vlsi/.test(n)) return '🔌';
    if (/mechanical|thermodynamic|fluid|manufacturing/.test(n)) return '⚙️';
    if (/civil|structure|surveying|construction/.test(n)) return '🏗️';
    if (/medical|medicine|pharmac|pathol|clinic/.test(n)) return '🏥';
    if (/marketing|sales|entrepreneur/.test(n)) return '📊';
    return '📖';
};

/** Exam Type → keyword-matched emoji */
export const examTypeEmoji = (name: string): string => {
    const n = name.toLowerCase();
    if (/mid.?term|mid.?sem|midsem/.test(n)) return '⏱️';
    if (/end.?term|final|annual/.test(n)) return '📋';
    if (/internal|cia/.test(n)) return '🗂️';
    if (/practical|lab/.test(n)) return '🧪';
    if (/viva|oral/.test(n)) return '🎤';
    if (/assignment/.test(n)) return '✏️';
    if (/quiz/.test(n)) return '❓';
    if (/mock|practice/.test(n)) return '📝';
    if (/supple|backlog/.test(n)) return '🔁';
    return '📄';
};

// ─── Option builders ──────────────────────────────────────────────────────────

const toOption = (name: string, status: string | undefined, emoji: string): CustomSelectOption => ({
    value: name,
    label: status === 'pending' ? `${name} (Pending Approval)` : name,
    emoji,
});

/** Build options for College dropdown */
export const buildCollegeOptions = (items: MetaItem[]): CustomSelectOption[] =>
    items.map(i => toOption(i.name, i.status, collegeEmoji()));

/** Build options for Semester dropdown */
export const buildSemesterOptions = (items: MetaItem[]): CustomSelectOption[] =>
    items.map(i => toOption(i.name, i.status, semesterEmoji(i.name)));

/** Build options for Course dropdown */
export const buildCourseOptions = (items: MetaItem[]): CustomSelectOption[] =>
    items.map(i => toOption(i.name, i.status, courseEmoji(i.name)));

/** Build options for Subject dropdown (flat list) */
export const buildSubjectOptions = (items: MetaItem[]): CustomSelectOption[] =>
    items.map(i => toOption(i.name, i.status, subjectEmoji(i.name)));

/** Build options for Exam Type dropdown */
export const buildExamTypeOptions = (items: MetaItem[]): CustomSelectOption[] =>
    items.map(i => toOption(i.name, i.status, examTypeEmoji(i.name)));

/**
 * Simple string arrays → options (used in Register, Settings, GoogleProfileCompletion
 * where lists come back as plain strings or {name} objects).
 */
export const buildSimpleOptions = (
    items: (string | { name: string; id?: string })[],
    emojiPicker: (name: string) => string,
): CustomSelectOption[] =>
    items.map(i => {
        const name = typeof i === 'string' ? i : i.name;
        return { value: name, label: name, emoji: emojiPicker(name) };
    });
