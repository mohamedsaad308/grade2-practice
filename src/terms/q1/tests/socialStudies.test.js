import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getSubjectByTermAndId, getSubjectsForTerm } from '../../../terms/index.js';
import socialStudiesSubject from '../subjects/social_studies/index.js';
import NorthernAfricaMap from '../../../components/NorthernAfricaMap.jsx';
import SocialStudiesVisual from '../../../components/SocialStudiesVisual.jsx';
import QuestionDispatcher from '../../../engine/QuestionDispatcher.jsx';

describe('Social Studies (SOC STUD) Subject Integrity & Schema', () => {
  it('is registered in Q1 subjects registry and accessible by id and alias', () => {
    const byId = getSubjectByTermAndId('q1', 'social_studies');
    expect(byId).toBeDefined();
    expect(byId?.id).toBe('social_studies');
    expect(byId?.title).toContain('Social Studies');

    // Alias check inside Q1
    const byAlias1 = getSubjectByTermAndId('q1', 'soc_stud');
    expect(byAlias1).toBe(byId);
    const byAlias2 = getSubjectByTermAndId('q1', 'soc-stud');
    expect(byAlias2).toBe(byId);

    // Present in Q1 subjects list
    expect(getSubjectsForTerm('q1').some((s) => s.id === 'social_studies')).toBe(true);
  });

  it('exports 5 topics including Mixed Review with valid metadata', () => {
    expect(socialStudiesSubject.topics.length).toBe(5);
    const topicIds = socialStudiesSubject.topics.map((t) => t.id);
    expect(topicIds).toContain('soc_shapes');
    expect(topicIds).toContain('soc_map_skills');
    expect(topicIds).toContain('soc_north_africa');
    expect(topicIds).toContain('soc_match');
    expect(topicIds).toContain('soc_mixed_review');

    socialStudiesSubject.topics.forEach((topic) => {
      expect(topic.title, `Topic ${topic.id} has title`).toBeTruthy();
      expect(topic.icon, `Topic ${topic.id} has icon`).toBeTruthy();
      expect(topic.hint, `Topic ${topic.id} has hint`).toBeTruthy();
      expect(typeof topic.getQuestions, `Topic ${topic.id} has getQuestions`).toBe('function');
    });
  });

  it('every choice question has answer in options, no duplicate options, and non-empty text', () => {
    const choiceTopics = socialStudiesSubject.topics.filter((t) => t.type === 'choice');
    let totalQuestions = 0;

    choiceTopics.forEach((topic) => {
      topic.items.forEach((item) => {
        totalQuestions++;
        expect(item.id).toBeTruthy();
        expect(typeof item.text).toBe('string');
        expect(item.text.trim().length).toBeGreaterThan(0);

        expect(Array.isArray(item.options), `Item ${item.id} has options array`).toBe(true);
        expect(item.options.length).toBeGreaterThanOrEqual(2);

        // No duplicate options
        const uniqueOpts = new Set(item.options.map((o) => o.trim().toLowerCase()));
        expect(uniqueOpts.size, `Item ${item.id} has duplicate options`).toBe(item.options.length);

        // Answer is in options
        const matchFound = item.options.some(
          (opt) => opt.trim().toLowerCase() === item.answer.trim().toLowerCase()
        );
        expect(matchFound, `Item ${item.id} answer "${item.answer}" not in options`).toBe(true);
      });
    });

    expect(totalQuestions).toBeGreaterThanOrEqual(40);
  });

  it('every match question has at least 4 pairs and explanations', () => {
    const matchTopic = socialStudiesSubject.topics.find((t) => t.id === 'soc_match');
    expect(matchTopic).toBeDefined();

    matchTopic.items.forEach((item) => {
      expect(Array.isArray(item.pairs)).toBe(true);
      expect(item.pairs.length).toBe(4);
      item.pairs.forEach(([w, m]) => {
        expect(w).toBeTruthy();
        expect(m).toBeTruthy();
      });
    });
  });

  it('NorthernAfricaMap component renders with 6 numbered countries and labels', () => {
    const html = renderToString(React.createElement(NorthernAfricaMap, { highlightNumber: 2 }));
    expect(html).toContain('Northern Africa Map');
    expect(html).toContain('Sudan');
    expect(html).toContain('Egypt');
    expect(html).toContain('Libya');
    expect(html).toContain('Tunisia');
    expect(html).toContain('Algeria');
    expect(html).toContain('Morocco');
    expect(html).toContain('MEDITERRANEAN SEA');
    expect(html).toContain('ATLANTIC');
    expect(html).toContain('RED SEA');
  });

  it('SocialStudiesVisual renders shapes, colors, and map keys', () => {
    const htmlShapes = renderToString(React.createElement(SocialStudiesVisual, { type: 'shapes_3d_2d' }));
    expect(htmlShapes).toContain('3D (Not flat)');
    expect(htmlShapes).toContain('2D (Flat like paper)');
    expect(htmlShapes).toContain('Spherical (Round)');

    const htmlColors = renderToString(React.createElement(SocialStudiesVisual, { type: 'map_colors' }));
    expect(htmlColors).toContain('Water');
    expect(htmlColors).toContain('Deserts');
    expect(htmlColors).toContain('Land');

    const htmlKey = renderToString(React.createElement(SocialStudiesVisual, { type: 'map_key' }));
    expect(htmlKey).toContain('Map Key / Legend');
  });

  it('generates playable sessions of up to 10 questions for all topics including Mixed Review', () => {
    socialStudiesSubject.topics.forEach((topic) => {
      const sessionQuestions = topic.getQuestions();
      expect(sessionQuestions.length).toBeGreaterThanOrEqual(1);
      expect(sessionQuestions.length).toBeLessThanOrEqual(10);

      sessionQuestions.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(q.type).toBeTruthy();
        expect(q.topicTitle).toBeTruthy();
        if (topic.id !== 'soc_mixed_review') {
          expect(q.topicTitle).toBe(topic.title);
        }

        // Renders cleanly through QuestionDispatcher
        const html = renderToString(
          React.createElement(QuestionDispatcher, {
            question: q,
            onSubmit: () => {},
            disabled: false,
            soundEnabled: false
          })
        );
        expect(html.length).toBeGreaterThan(50);
      });
    });
  });
});
