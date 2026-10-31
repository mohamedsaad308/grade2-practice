import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HomeView from './views/HomeView.jsx';
import PracticeSession from './views/PracticeSession.jsx';
import SessionSummary from './views/SessionSummary.jsx';
import ParentDashboard from './views/ParentDashboard.jsx';
import WelcomeScreen from './player/WelcomeScreen.jsx';
import PlayerSwitcherModal from './player/PlayerSwitcherModal.jsx';
import {
  getCurrentPlayer,
  getPlayers,
  getSettings,
  updateSettings,
  switchPlayer
} from './player/playerStorage.js';
import { getSubjectById, getTopicById } from './subjects/index.js';

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(getCurrentPlayer());
  const [settings, setSettings] = useState(getSettings());
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [isSwitchingPlayer, setIsSwitchingPlayer] = useState(false);
  const [isAddingNewPlayer, setIsAddingNewPlayer] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [lastSubjectId, setLastSubjectId] = useState('english');

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
    navigate('#/');
  };

  const handleStartTopic = (subjectId, topicId, level = 1) => {
    if (subjectId) setLastSubjectId(subjectId);
    navigate(`#/practice/${subjectId}/${topicId}?level=${level}`);
  };

  const handleFinishSession = (results) => {
    setSummaryData(results);
    refreshPlayerData();
    navigate('#/summary');
  };

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

  // Parse current route from hash
  // e.g. #/parent or #/practice/math/math_more_less?level=2
  const cleanHash = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = cleanHash.split('?');
  const pathSegments = pathPart ? pathPart.split('/') : [];
  const primaryRoute = pathSegments[0] || '';

  // Render view
  let currentViewComponent = null;

  if (primaryRoute === 'parent') {
    currentViewComponent = (
      <ParentDashboard
        onBackToPractice={() => navigate('#/')}
        onPlayerStateChanged={refreshPlayerData}
      />
    );
  } else if (primaryRoute === 'practice') {
    const subjectId = pathSegments[1] || 'english';
    const topicId = pathSegments[2] || '';
    const searchParams = new URLSearchParams(queryPart || '');
    const level = parseInt(searchParams.get('level') || '1', 10);

    const subject = getSubjectById(subjectId);
    const topic = getTopicById(subjectId, topicId);

    if (subject && topic) {
      currentViewComponent = (
        <PracticeSession
          player={currentPlayer}
          subject={subject}
          topic={topic}
          level={level}
          settings={settings}
          onFinishSession={handleFinishSession}
          onExit={(exitSubjectId) => {
            refreshPlayerData();
            const target = exitSubjectId || subjectId || lastSubjectId || 'english';
            setLastSubjectId(target);
            navigate(`#/subject/${target}`);
          }}
        />
      );
    } else {
      currentViewComponent = (
        <div className="route-error-card">
          <p>Topic not found.</p>
          <button type="button" onClick={() => navigate(`#/subject/${lastSubjectId}`)}>
            Back to Topics
          </button>
        </div>
      );
    }
  } else if (primaryRoute === 'summary' && summaryData) {
    currentViewComponent = (
      <SessionSummary
        summaryData={summaryData}
        player={currentPlayer}
        settings={settings}
        onPlayAgain={() => {
          navigate(`#/practice/${summaryData.subject.id}/${summaryData.topic.id}?level=${summaryData.level}`);
        }}
        onBackToSubject={(subjectId) => {
          const target = subjectId || summaryData.subject?.id || lastSubjectId || 'english';
          setLastSubjectId(target);
          navigate(`#/subject/${target}`);
        }}
        onBackToHome={() => navigate('#/')}
      />
    );
  } else {
    // Default or Subject View: HomeView showing the selected subject's topics
    const activeSubjId = (primaryRoute === 'subject' ? pathSegments[1] : lastSubjectId) || 'english';

    currentViewComponent = (
      <HomeView
        player={currentPlayer}
        selectedSubjectId={activeSubjId}
        onSelectSubject={(id) => {
          setLastSubjectId(id);
          navigate(`#/subject/${id}`);
        }}
        onStartTopic={handleStartTopic}
        onChangePlayer={() => setIsSwitchingPlayer(true)}
        soundEnabled={settings.soundEnabled}
      />
    );
  }

  return (
    <div className="app-root-shell">
      <Navbar
        player={currentPlayer}
        settings={settings}
        onToggleSound={handleToggleSound}
        onToggleSpokenPraise={handleToggleSpokenPraise}
        onChangePlayer={() => setIsSwitchingPlayer(true)}
        onNavigateHome={() => navigate('#/')}
        onNavigateParent={() => navigate('#/parent')}
        currentRoute={primaryRoute}
      />

      <main className="app-main-viewport">
        {currentViewComponent}
      </main>

      {/* Switch Player Modal */}
      {isSwitchingPlayer && (
        <PlayerSwitcherModal
          currentPlayer={currentPlayer}
          onPlayerSelected={(selected) => {
            setCurrentPlayer(selected);
            setIsSwitchingPlayer(false);
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
