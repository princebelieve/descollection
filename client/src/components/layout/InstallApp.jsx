import { createContext, useContext, useEffect, useState } from 'react';

const InstallAppContext = createContext(null);
const DISMISSED_KEY = 'descollection-install-dismissed-until';

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function InstallAppProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isInstalled);
  const [ios] = useState(isIosDevice);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestionVisible, setSuggestionVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      let stillDismissed = false;
      try {
        stillDismissed = Date.now() < (Number(localStorage.getItem(DISMISSED_KEY)) || 0);
      } catch {
        // The install prompt remains available from the footer.
      }
      if (!stillDismissed) setSuggestionVisible(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setSuggestionVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    let dismissedUntil = 0;
    try {
      dismissedUntil = Number(localStorage.getItem(DISMISSED_KEY)) || 0;
    } catch {
      // Storage can be unavailable in private browsing; the prompt still works.
    }
    const timer = window.setTimeout(() => {
      if (isIosDevice() && !isInstalled() && Date.now() >= dismissedUntil) setSuggestionVisible(true);
    }, 7000);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismissSuggestion = () => {
    setSuggestionVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {
      // Dismissing remains effective for this page session.
    }
  };

  const install = async () => {
    if (ios || !installPrompt) {
      setDialogOpen(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice?.outcome === 'accepted') setSuggestionVisible(false);
    setInstallPrompt(null);
  };

  const value = { installed, install, ios };

  return (
    <InstallAppContext.Provider value={value}>
      {children}
      {!installed && suggestionVisible && (
        <aside className="install-suggestion" aria-label="Install app suggestion">
          <button className="install-suggestion-close" type="button" aria-label="Dismiss install suggestion" onClick={dismissSuggestion}>×</button>
          <strong>Take Des Collection with you</strong>
          <p>Add our app to your home screen for quick access.</p>
          <button className="install-app-action" type="button" onClick={install}>Install app</button>
        </aside>
      )}
      {dialogOpen && (
        <div className="install-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialogOpen(false);
        }}>
          <section className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-modal-title">
            <button className="install-modal-close" type="button" aria-label="Close" onClick={() => setDialogOpen(false)}>×</button>
            <p className="kicker">DES COLLECTION LTD</p>
            <h2 id="install-modal-title">{ios ? 'Add to your Home Screen' : 'Install the app'}</h2>
            {ios ? (
              <ol>
                <li>Tap the <strong>Share</strong> button <span className="ios-share-symbol" aria-label="Share">↑</span> in Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> to finish.</li>
              </ol>
            ) : (
              <ol>
                <li>Open this site in Chrome.</li>
                <li>Tap the <strong>⋮</strong> menu, then <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Confirm by tapping <strong>Install</strong> or <strong>Add</strong>.</li>
              </ol>
            )}
            <button className="install-app-action install-modal-done" type="button" onClick={() => setDialogOpen(false)}>Got it</button>
          </section>
        </div>
      )}
    </InstallAppContext.Provider>
  );
}

export function useInstallApp() {
  const context = useContext(InstallAppContext);
  if (!context) throw new Error('useInstallApp must be used inside InstallAppProvider');
  return context;
}
