import math from './math/index.js';
import english from './english/index.js';
import reading from './reading/index.js';
import science from './science/index.js';

/**
 * Central Subject Registry
 * To add a new subject, create a folder in src/subjects/<name>/ and add it here!
 */
export const subjects = [
  math,
  english,
  reading,
  science
];

export function getSubjectById(id) {
  return subjects.find(s => s.id === id) || null;
}

export function getTopicById(subjectId, topicId) {
  const subject = getSubjectById(subjectId);
  if (!subject) return null;
  return subject.topics.find(t => t.id === topicId) || null;
}
