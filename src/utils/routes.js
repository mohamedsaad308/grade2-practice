import {
  DEFAULT_TERM_ID,
  getTermById,
  canonicalizeSubjectId,
  getSubjectByTermAndId
} from '../terms/index.js';

export function buildHomeRoute(termId = DEFAULT_TERM_ID) {
  const validTerm = getTermById(termId)?.id || DEFAULT_TERM_ID;
  return `#/${validTerm}`;
}

export function buildSubjectRoute(termId, subjectId) {
  const validTerm = getTermById(termId)?.id || DEFAULT_TERM_ID;
  if (!subjectId || subjectId === 'review') {
    return `#/${validTerm}/review`;
  }
  const canonical = canonicalizeSubjectId(validTerm, subjectId);
  return `#/${validTerm}/${canonical}`;
}

export function buildTopicRoute(termId, subjectId, topicId, level = 1) {
  const validTerm = getTermById(termId)?.id || DEFAULT_TERM_ID;
  const canonical = canonicalizeSubjectId(validTerm, subjectId);
  const query = level && Number(level) > 1 ? `?level=${level}` : '';
  return `#/${validTerm}/${canonical}/${topicId}${query}`;
}

export function getExitRoute(termId, subjectId) {
  const validTerm = getTermById(termId)?.id || DEFAULT_TERM_ID;
  if (!subjectId || subjectId === 'review') {
    return `#/${validTerm}`;
  }
  return buildSubjectRoute(validTerm, subjectId);
}

/**
 * Resolves any current or legacy hash URL into a canonical view descriptor
 * plus an optional `redirectTo` canonical hash for seamless bookmark compatibility.
 */
export function resolveRoute(rawHash, fallbackTermId = DEFAULT_TERM_ID) {
  const safeDefaultTerm = getTermById(fallbackTermId)?.id || DEFAULT_TERM_ID;
  const cleanHash = String(rawHash || '').replace(/^#\/?/, '');
  const [pathPart, queryPart] = cleanHash.split('?');
  const segments = pathPart ? pathPart.split('/').filter(Boolean) : [];
  const searchParams = new URLSearchParams(queryPart || '');
  const parsedLevel = parseInt(searchParams.get('level') || '1', 10);
  const level = Number.isNaN(parsedLevel) || parsedLevel < 1 ? 1 : parsedLevel;
  const querySuffix = queryPart ? `?${queryPart}` : '';

  // 1. Empty or root hash -> Home on player's default/last term
  if (segments.length === 0) {
    return {
      view: 'home',
      termId: safeDefaultTerm,
      redirectTo: null
    };
  }

  const first = segments[0].toLowerCase();

  // 2. Shared top-level routes
  if (first === 'parent') {
    return { view: 'parent', termId: safeDefaultTerm, redirectTo: null };
  }
  if (first === 'summary') {
    return { view: 'summary', termId: safeDefaultTerm, redirectTo: null };
  }

  // 3. Legacy /#/subject/... routes -> redirect to /#/q1/<subject>
  if (first === 'subject') {
    const rawSubj = segments[1];
    if (!rawSubj) {
      return { view: 'home', termId: 'q1', redirectTo: '#/q1' };
    }
    const canonicalSubj = canonicalizeSubjectId('q1', rawSubj);
    return {
      view: 'subject',
      termId: 'q1',
      subjectId: canonicalSubj,
      redirectTo: `#/q1/${canonicalSubj}`
    };
  }

  // 4. Legacy /#/practice/... routes -> redirect to /#/q1/<subject>/<topic>
  if (first === 'practice') {
    const rawSubj = segments[1];
    const topicId = segments[2];
    if (!rawSubj) {
      return { view: 'home', termId: 'q1', redirectTo: '#/q1' };
    }
    const canonicalSubj = canonicalizeSubjectId('q1', rawSubj);
    if (!topicId) {
      return {
        view: 'subject',
        termId: 'q1',
        subjectId: canonicalSubj,
        redirectTo: `#/q1/${canonicalSubj}`
      };
    }
    return {
      view: 'practice',
      termId: 'q1',
      subjectId: canonicalSubj,
      topicId,
      level,
      redirectTo: `#/q1/${canonicalSubj}/${topicId}${querySuffix}`
    };
  }

  // 5. Term-scoped canonical routes: /#/<term>/<subject>/<topic>
  const matchedTerm = getTermById(first);
  if (matchedTerm) {
    if (segments.length === 1) {
      return {
        view: 'home',
        termId: matchedTerm.id,
        redirectTo: null
      };
    }

    const second = segments[1];
    const canonicalSubj = canonicalizeSubjectId(matchedTerm.id, second);

    // Term mixed review route: /#/q1/review or /#/q1/review/q1_review
    if (canonicalSubj === 'review') {
      const reviewTopicId = segments[2] || matchedTerm.reviewTopic?.id || `${matchedTerm.id}_review`;
      return {
        view: 'practice',
        termId: matchedTerm.id,
        subjectId: 'review',
        topicId: reviewTopicId,
        level,
        redirectTo: null
      };
    }

    // Subject topic list: /#/<term>/<subject>
    if (segments.length === 2) {
      const expectedCanonicalHash = second !== canonicalSubj ? `#/${matchedTerm.id}/${canonicalSubj}` : null;
      return {
        view: 'subject',
        termId: matchedTerm.id,
        subjectId: canonicalSubj,
        redirectTo: expectedCanonicalHash
      };
    }

    // Practice session: /#/<term>/<subject>/<topic>
    const topicId = segments[2];
    return {
      view: 'practice',
      termId: matchedTerm.id,
      subjectId: canonicalSubj,
      topicId,
      level,
      redirectTo: null
    };
  }

  // 6. Legacy shorthand bare subject URL (e.g. /#/english or /#/soc_stud) -> /#/q1/<subject>
  const q1SubjMatch = getSubjectByTermAndId('q1', first);
  if (q1SubjMatch) {
    if (segments[1]) {
      return {
        view: 'practice',
        termId: 'q1',
        subjectId: q1SubjMatch.id,
        topicId: segments[1],
        level,
        redirectTo: `#/q1/${q1SubjMatch.id}/${segments[1]}${querySuffix}`
      };
    }
    return {
      view: 'subject',
      termId: 'q1',
      subjectId: q1SubjMatch.id,
      redirectTo: `#/q1/${q1SubjMatch.id}`
    };
  }

  // 7. Unknown route -> safe Home redirect
  return {
    view: 'home',
    termId: safeDefaultTerm,
    redirectTo: `#/${safeDefaultTerm}`
  };
}
