import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HomeView from './views/HomeView.jsx';
import SubjectTopicsView from './views/SubjectTopicsView.jsx';
import PracticeSession from './views/PracticeSession.jsx';
import SessionSummary from './views/SessionSummary.jsx';
import ParentDashboard from './views/ParentDashboard.jsx';
import WelcomeScreen from './player/WelcomeScreen.jsx';
import PlayerSwitcherModal from './player/PlayerSwitcherModal.jsx';
import {
  getCurrentPlayer,
  getSettings,
  updateSettings,
  setPlayerLastTerm
} from './player/playerStorage.js';
import {
  DEFAULT_TERM_ID,
  getTermById,
  getSubjectByTermAndId,
  getTopicByTermSubjectAndId
} from './terms/index.js';
import {
  resolveRoute,
  buildHomeRoute,
  buildSubjectRoute,
  buildTopicRoute,
  getExitRoute
} from './utils/routes.js';

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(getCurrentPlayer());
  const [settings, setSettings] = useState(getSettings());
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [isSwitchingPlayer, setIsSwitchingPlayer] = useState(false);
  const [isAddingNewPlayer, setIsAddingNewPlayer] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Sync hash routing
  useEffect(() => {
    function handleHashChange() {
      setHash(window.location.hash || '#/');
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newHash) => {
    window.location.hash = newHash;
    setHash(newHash);
  };

  const refreshPlayerData = () => {
    setCurrentPlayer(getCurrentPlayer());
  };

  const handleToggleSound = () => {
    const updated = updateSettings({ soundEnabled: !settings.soundEnabled });
    setSettings(updated);
  };

  const handleToggleSpokenPraise = () => {
    const updated = updateSettings({ spokenPraiseEnabled: !settings.spokenPraiseEnabled });
    setSettings(updated);
  };

  const handlePlayerCreated = (newPlayer) => {
    setCurrentPlayer(newPlayer);
    setIsAddingNewPlayer(false);
    // New players always open on Q2 by default
    navigate(buildHomeRoute(newPlayer?.lastTerm || DEFAULT_TERM_ID));
  };

  const fallbackTermId = currentPlayer?.lastTerm || DEFAULT_TERM_ID;
  const route = resolveRoute(hash, fallbackTermId);

  // Redirect legacy bookmarked URLs (e.g. #/subject/english -> #/q1/english)
  useEffect(() => {
    if (route.redirectTo && window.location.hash !== route.redirectTo) {
      window.location.replace(route.redirectTo);
      setHash(route.redirectTo);
    }
  }, [route.redirectTo]);

  // If no players exist at all, or user chose "Add New Player", show WelcomeScreen
  if (!currentPlayer || isAddingNewPlayer) {
    return (
      <div className="app-root-shell">
        <WelcomeScreen
          onPlayerCreated={handlePlayerCreated}
          isAddingNew={isAddingNewPlayer}
          onCancel={isAddingNewPlayer ? () => setIsAddingNewPlayer(false) : null}
        />
      </div>
    );
  }

  const handleSelectTerm = (termId) => {
    setPlayerLastTerm(currentPlayer.id, termId);
    refreshPlayerData();
    navigate(buildHomeRoute(termId));
  };

  const handleSelectSubject = (termId, subjectId) => {
    if (currentPlayer.lastTerm !== termId) {
      setPlayerLastTerm(currentPlayer.id, termId);
      refreshPlayerData();
    }
    navigate(buildSubjectRoute(termId, subjectId));
  };

  const handleStartTopic = (termId, subjectId, topicId, level = 1) => {
    navigate(buildTopicRoute(termId, subjectId, topicId, level));
  };

  const handleStartReview = (termId, reviewTopicId) => {
    navigate(buildTopicRoute(termId, 'review', reviewTopicId, 1));
  };

  const handleFinishSession = (results) => {
    setSummaryData(results);
    refreshPlayerData();
    navigate('#/summary');
  };

  const isInPractice = route.view === 'practice';
  let currentViewComponent = null;

  if (route.view === 'parent') {
    currentViewComponent = (
      <ParentDashboard
        onBackToPractice={() => navigate(buildHomeRoute(currentPlayer?.lastTerm || DEFAULT_TERM_ID))}
        onPlayerStateChanged={refreshPlayerData}
      />
    );
  } else if (route.view === 'practice') {
    const term = getTermById(route.termId);
    const subject = getSubjectByTermAndId(route.termId, route.subjectId);
    const topic = getTopicByTermSubjectAndId(route.termId, route.subjectId, route.topicId);

    if (term && subject && topic) {
      currentViewComponent = (
        <PracticeSession
          player={currentPlayer}
          termId={term.id}
          subject={subject}
          topic={topic}
          level={route.level || 1}
          settings={settings}
          onToggleSound={handleToggleSound}
          onToggleSpokenPraise={handleToggleSpokenPraise}
          onChangePlayer={() => setIsSwitchingPlayer(true)}
          onNavigateParent={() => navigate('#/parent')}
          onFinishSession={handleFinishSession}
          onExit={(exitTermId, exitSubjectId) => {
            refreshPlayerData();
            navigate(getExitRoute(exitTermId || term.id, exitSubjectId || subject.id));
          }}
        />
      );
    } else {
      currentViewComponent = (
        <div className="route-error-card">
          <p>Topic not found.</p>
          <button
            type="button"
            onClick={() => navigate(buildHomeRoute(currentPlayer?.lastTerm || DEFAULT_TERM_ID))}
          >
            Back to Subjects
          </button>
        </div>
      );
    }
  } else if (route.view === 'subject') {
    const term = getTermById(route.termId);
    const subject = getSubjectByTermAndId(route.termId, route.subjectId);

    currentViewComponent = (
      <SubjectTopicsView
        player={currentPlayer}
        term={term}
        subject={subject}
        onBackToTerm={(targetTermId) => navigate(buildHomeRoute(targetTermId))}
        onStartTopic={handleStartTopic}
        soundEnabled={settings.soundEnabled}
      />
    );
  } else if (route.view === 'summary' && summaryData) {
    currentViewComponent = (
      <SessionSummary
        summaryData={summaryData}
        player={currentPlayer}
        settings={settings}
        onPlayAgain={() => {
          navigate(
            buildTopicRoute(
              summaryData.termId || 'q1',
              summaryData.subject.id,
              summaryData.topic.id,
              summaryData.level
            )
          );
        }}
        onBackToSubject={(sumTermId, sumSubjectId) => {
          navigate(getExitRoute(sumTermId || summaryData.termId || 'q1', sumSubjectId || summaryData.subject?.id));
        }}
        onBackToHome={(sumTermId) => {
          navigate(buildHomeRoute(sumTermId || summaryData.termId || currentPlayer?.lastTerm || DEFAULT_TERM_ID));
        }}
      />
    );
  } else {
    // Default Home Screen: Term picker (Q2 | Q1) + Subject Cards
    currentViewComponent = (
      <HomeView
        player={currentPlayer}
        activeTermId={route.termId || fallbackTermId}
        onSelectTerm={handleSelectTerm}
        onSelectSubject={handleSelectSubject}
        onStartReview={handleStartReview}
        soundEnabled={settings.soundEnabled}
      />
    );
  }

  return (
    <div className={`app-root-shell ${isInPractice ? 'in-practice-mode' : ''}`}>
      {!isInPractice && (
        <Navbar
          player={currentPlayer}
          settings={settings}
          onToggleSound={handleToggleSound}
          onToggleSpokenPraise={handleToggleSpokenPraise}
          onChangePlayer={() => setIsSwitchingPlayer(true)}
          onNavigateHome={() => navigate(buildHomeRoute(currentPlayer?.lastTerm || DEFAULT_TERM_ID))}
          onNavigateParent={() => navigate('#/parent')}
          currentRoute={route.view}
        />
      )}

      <main className={`app-main-viewport ${isInPractice ? 'viewport-practice' : ''}`}>
        {currentViewComponent}
      </main>

      {/* Switch Player Modal */}
      {isSwitchingPlayer && (
        <PlayerSwitcherModal
          currentPlayer={currentPlayer}
          onPlayerSelected={(selected) => {
            setCurrentPlayer(selected);
            setIsSwitchingPlayer(false);
            // Switch to that player's remembered term (or Q2)
            navigate(buildHomeRoute(selected?.lastTerm || DEFAULT_TERM_ID));
          }}
          onAddNewPlayer={() => {
            setIsSwitchingPlayer(false);
            setIsAddingNewPlayer(true);
          }}
          onClose={() => setIsSwitchingPlayer(false)}
        />
      )}
    </div>
  );
}
