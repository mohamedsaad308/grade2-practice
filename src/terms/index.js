import q1 from './q1/index.js';
import q2 from './q2/index.js';

/**
 * Central School Term Registry
 * Only Q1 and Q2 exist right now.
 * Adding Q3/Q4 later only requires creating src/terms/q3/index.js and adding it here.
 */
export const DEFAULT_TERM_ID = 'q2';

export const terms = [q1, q2];

// Pill tab order on the Home screen: Q2 | Q1 (Q2 is default)
export const termTabs = [q2, q1];

/**
 * Dynamically determines if a subject is active.
 * A subject becomes active automatically as soon as it has >= 1 topic in its `topics` list.
 */
export function isSubjectActive(subject) {
  return Boolean(subject && Array.isArray(subject.topics) && subject.topics.length > 0);
}

/**
 * Resolve a term object by ID (case-insensitive). Returns null for unknown terms.
 */
export function getTermById(termId) {
  if (!termId) return null;
  const norm = String(termId).trim().toLowerCase();
  return terms.find((t) => t.id === norm) || null;
}

/**
 * Return all subjects registered under a given term.
 */
export function getSubjectsForTerm(termId) {
  const term = getTermById(termId);
  return term ? term.subjects : [];
}

/**
 * Normalize legacy subject ID aliases within a specific term.
 */
export function canonicalizeSubjectId(termId, subjectId) {
  if (!subjectId) return '';
  const term = getTermById(termId);
  const norm = String(subjectId).trim().toLowerCase();

  if (norm === 'review') return 'review';

  if (term) {
    // Direct match first (so Q2 'social' matches Q2's 'social', not Q1's 'social_studies')
    const direct = term.subjects.find((s) => s.id === norm);
    if (direct) return direct.id;

    // Q1 Social Studies legacy aliases
    if (
      term.id === 'q1' &&
      (norm === 'soc_stud' || norm === 'soc-stud' || norm === 'social-studies' || norm === 'social')
    ) {
      return 'social_studies';
    }
  }

  return norm;
}

/**
 * Look up a subject strictly inside the specified term.
 */
export function getSubjectByTermAndId(termId, subjectId) {
  const term = getTermById(termId);
  if (!term || !subjectId) return null;

  const canonical = canonicalizeSubjectId(term.id, subjectId);

  if (canonical === 'review' && term.reviewTopic) {
    return {
      id: 'review',
      title: term.reviewTopic.title,
      icon: term.reviewTopic.icon || '⭐',
      color: '#F59E0B',
      lightColor: '#FEF3C7',
      description: term.reviewTopic.description,
      isReview: true,
      topics: [term.reviewTopic]
    };
  }

  return term.subjects.find((s) => s.id === canonical) || null;
}

/**
 * Look up a topic strictly inside (termId, subjectId).
 */
export function getTopicByTermSubjectAndId(termId, subjectId, topicId) {
  const term = getTermById(termId);
  if (!term) return null;

  const canonicalSubj = canonicalizeSubjectId(term.id, subjectId);
  if (canonicalSubj === 'review' && term.reviewTopic) {
    if (!topicId || topicId === term.reviewTopic.id || topicId === 'review') {
      return term.reviewTopic;
    }
    return null;
  }

  const subject = getSubjectByTermAndId(term.id, canonicalSubj);
  if (!subject || !Array.isArray(subject.topics)) return null;
  return subject.topics.find((t) => t.id === topicId) || null;
}

/**
 * Builds metadata lookup map across all terms for reporting in the Parent Dashboard.
 */
export function getAllTopicMetadataMap() {
  const map = {};
  terms.forEach((term) => {
    term.subjects.forEach((subj) => {
      (subj.topics || []).forEach((t) => {
        const key = `${term.id}:${t.id}`;
        const entry = {
          topicId: t.id,
          title: t.title,
          icon: t.icon || '📝',
          subjectId: subj.id,
          subjectTitle: subj.title,
          termId: term.id,
          termShortName: term.shortName
        };
        map[key] = entry;
        if (!map[t.id]) {
          map[t.id] = entry;
        }
      });
    });
    if (term.reviewTopic) {
      const rt = term.reviewTopic;
      const entry = {
        topicId: rt.id,
        title: rt.title,
        icon: rt.icon || '⭐',
        subjectId: 'review',
        subjectTitle: `${term.shortName} Review`,
        termId: term.id,
        termShortName: term.shortName
      };
      map[`${term.id}:${rt.id}`] = entry;
      if (!map[rt.id]) {
        map[rt.id] = entry;
      }
    }
  });
  return map;
}
