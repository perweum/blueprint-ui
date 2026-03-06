import { useEffect, useState } from 'react';

interface SetupWizardProps {
  onDone: () => void;
}

type Step = 'path' | 'apikey';

export function SetupWizard({ onDone }: SetupWizardProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Path step state
  const [detectedPath, setDetectedPath] = useState<string | null>(null);
  const [manualPath, setManualPath] = useState('');
  const [pathSaving, setPathSaving] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);

  // API key step state
  const [apiKey, setApiKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/setup').then((r) => r.json()).catch(() => ({ configured: true })),
      fetch('/api/config').then((r) => r.json()).catch(() => ({ configured: true })),
    ]).then(([setup, config]: [{ configured: boolean; path?: string | null }, { configured: boolean }]) => {
      const needed: Step[] = [];
      if (!setup.configured) needed.push('path');
      if (!config.configured) needed.push('apikey');
      if (setup.path) setDetectedPath(setup.path);
      setSteps(needed);
      setLoading(false);
      if (needed.length === 0) onDone();
    });
  }, [onDone]);

  const currentStep = steps[stepIdx];

  async function handlePathSubmit() {
    const p = manualPath.trim() || detectedPath;
    if (!p) { setPathError('Enter the path to your nanoclaw installation.'); return; }
    setPathSaving(true);
    setPathError(null);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      advance();
    } catch (err) {
      setPathError(err instanceof Error ? err.message : String(err));
    } finally {
      setPathSaving(false);
    }
  }

  async function handleApiKeySubmit() {
    const key = apiKey.trim();
    if (!key) { setKeyError('Please enter your API key.'); return; }
    if (!key.startsWith('sk-ant-')) {
      setKeyError('Anthropic API keys start with sk-ant-. Double-check your key.');
      return;
    }
    setKeySaving(true);
    setKeyError(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ANTHROPIC_API_KEY: key }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      advance();
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : String(err));
    } finally {
      setKeySaving(false);
    }
  }

  function advance() {
    if (stepIdx + 1 < steps.length) {
      setStepIdx((i) => i + 1);
    } else {
      onDone();
    }
  }

  if (loading) return null;

  return (
    <div className="setup-wizard-backdrop">
      <div className="setup-wizard">
        <div className="setup-wizard__header">
          <div className="setup-wizard__logo">◈ Blueprint</div>
          <div className="setup-wizard__subtitle">
            Let's get your AI assistant set up.<br />
            This only takes a minute.
          </div>
        </div>

        <div className="setup-wizard__body">
          {currentStep === 'path' && (
            <div className="setup-wizard__step">
              <div className="setup-wizard__step-header">
                <span className="setup-wizard__step-num">1</span>
                <span className="setup-wizard__step-title">Connect to nanoclaw</span>
              </div>
              {detectedPath ? (
                <p className="setup-wizard__step-desc">
                  Found nanoclaw at:<br />
                  <code style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>{detectedPath}</code>
                  <br />Confirm this is correct, or enter a different path below.
                </p>
              ) : (
                <p className="setup-wizard__step-desc">
                  Blueprint needs to know where nanoclaw is installed. Enter the full path to
                  your nanoclaw directory (the one that contains a <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>groups/</code> folder).
                </p>
              )}
              <input
                className="setup-wizard__input"
                type="text"
                placeholder={detectedPath ?? '/Users/you/nanoclaw'}
                value={manualPath}
                onChange={(e) => { setManualPath(e.target.value); setPathError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handlePathSubmit()}
                autoFocus={!detectedPath}
                spellCheck={false}
              />
              {pathError && <p className="setup-wizard__error">{pathError}</p>}
            </div>
          )}

          {currentStep === 'apikey' && (
            <div className="setup-wizard__step">
              <div className="setup-wizard__step-header">
                <span className="setup-wizard__step-num">{steps.indexOf('apikey') + 1}</span>
                <span className="setup-wizard__step-title">Add your Anthropic API key</span>
              </div>
              <p className="setup-wizard__step-desc">
                This is how Blueprint connects to Claude AI. Get your key from{' '}
                <strong>console.anthropic.com</strong> → API Keys → Create Key.
                It looks like <code style={{ fontFamily: 'monospace', fontSize: '11px' }}>sk-ant-api03-…</code>
              </p>
              <input
                className="setup-wizard__input"
                type="password"
                placeholder="sk-ant-api03-…"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setKeyError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                autoFocus
                spellCheck={false}
              />
              {keyError && <p className="setup-wizard__error">{keyError}</p>}
            </div>
          )}

          {!currentStep && (
            <div className="setup-wizard__step">
              <div className="setup-wizard__step-header">
                <span className="setup-wizard__step-num" style={{ background: 'var(--accent)', color: '#fff' }}>✓</span>
                <span className="setup-wizard__step-title">All set!</span>
              </div>
              <p className="setup-wizard__step-desc">
                Blueprint is ready. Use <strong>Open group…</strong> to load a nanoclaw group,
                then describe what you want your bot to do.
              </p>
            </div>
          )}

          <div className="setup-wizard__step" style={{ opacity: 0.5 }}>
            <div className="setup-wizard__step-header">
              <span className="setup-wizard__step-num" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {steps.length + 1}
              </span>
              <span className="setup-wizard__step-title" style={{ color: 'var(--text-muted)' }}>Open a group and describe your bot</span>
            </div>
            <p className="setup-wizard__step-desc">
              Use <strong>Open group…</strong> in the toolbar to load a nanoclaw group.
              Then use the AI chat to design your bot — just describe what you want it to do.
            </p>
          </div>
        </div>

        <div className="setup-wizard__footer">
          <button className="setup-wizard__skip" onClick={onDone}>
            Skip for now
          </button>
          {currentStep === 'path' && (
            <button
              className="setup-wizard__submit"
              onClick={handlePathSubmit}
              disabled={pathSaving}
            >
              {pathSaving ? 'Checking…' : detectedPath && !manualPath ? 'Confirm path' : 'Save path'}
            </button>
          )}
          {currentStep === 'apikey' && (
            <button
              className="setup-wizard__submit"
              onClick={handleApiKeySubmit}
              disabled={keySaving || !apiKey.trim()}
            >
              {keySaving ? 'Saving…' : 'Save & Start'}
            </button>
          )}
          {!currentStep && (
            <button className="setup-wizard__submit" onClick={onDone}>
              Get started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
