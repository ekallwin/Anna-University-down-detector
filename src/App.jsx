import { useState } from 'react';
import { FaDesktop, FaServer, FaSearch, FaExclamationCircle, FaCheckCircle, FaCircleNotch } from 'react-icons/fa';
import './App.css';
import { Analytics } from "@vercel/analytics/react"
function App() {
  const [status, setStatus] = useState('idle');
  const [checkStep, setCheckStep] = useState(0);
  const [checkResult, setCheckResult] = useState('');
  const [lastChecked, setLastChecked] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const urlToCheck = 'https://coe.annauniv.edu/home';

  const checkStatus = async () => {
    setStatus('checking');
    setCheckStep(1);
    setCheckResult('');
    const startTime = Date.now();

    await new Promise(r => setTimeout(r, 800));

    if (!navigator.onLine) {
      setCheckStep(3);
      setCheckResult('Unable to reach');
      await new Promise(r => setTimeout(r, 800));
      setStatus('down');
      setLastChecked(new Date());
      setResponseTime(null);
      return;
    }

    setCheckStep(2);

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 1500;

    const proxyUrls = (timestamp) => [
      `https://api.allorigins.win/get?url=${encodeURIComponent(`${urlToCheck}?t=${timestamp}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`${urlToCheck}?t=${timestamp}`)}`,
    ];

    const tryFetch = async () => {
      const timestamp = new Date().getTime();
      const urls = proxyUrls(timestamp);

      for (const url of urls) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!response.ok) continue;

          // allorigins returns JSON with status.http_code; corsproxy returns the raw page
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (data.status && data.status.http_code >= 200 && data.status.http_code < 400) {
              return true;
            }
          } else {
            // corsproxy returned the raw page directly — if we got here without throwing, it's up
            return true;
          }
        } catch {
          // this proxy failed, try the next one
        }
      }
      return false; // both proxies failed for this attempt
    };

    let isUp = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
      isUp = await tryFetch();
      if (isUp) break;
    }

    setCheckStep(3);
    setCheckResult(isUp ? 'Success' : 'Unable to reach');
    await new Promise(r => setTimeout(r, 800));

    setResponseTime(Date.now() - startTime);
    setLastChecked(new Date());
    setStatus(isUp ? 'up' : 'down');
  };



  return (
    <>
      <Analytics />
      <div className="app-container">
        <div className="background-gradient"></div>
        <main className="glass-panel">
          <header className="header">
            <h1>Anna University</h1>
            <h2>Down Detector</h2>
          </header>

          <section className="connection-path-section">
            <div className="node client-node">
              <div className="icon-wrapper small">
                <FaDesktop />
              </div>
              <span className="node-label">Device</span>
            </div>

            <div className="pathway">
              <div className="path-line request-line">
                <span className="path-text">Request</span>
                <div className={`particle request-particle ${status === 'checking' ? 'active' : ''}`}></div>
              </div>
              <div className="path-line response-line">
                <div className={`particle response-particle ${status === 'up' || status === 'down' ? `active ${status}` : ''}`}></div>
                <span className="path-text">Response</span>
              </div>
            </div>

            <div className="node server-node">
              <div className="icon-wrapper small">
                <FaServer />
              </div>
              <span className="node-label">AU Servers</span>
            </div>
          </section>

          <section className="status-section">
            {status === 'idle' && (
              <div className="status-indicator idle fade-in">
                <div className="icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <FaSearch />
                </div>
                <h3 className="success-text" style={{ color: '#818cf8' }}>Ready to Check</h3>
                <p className="subtitle">Click the button below to check the status of Anna University COE Servers</p>
              </div>
            )}

            {status === 'checking' && (
              <div className="status-indicator checking">
                <div className="flow-container">
                  <div className={`flow-step ${checkStep >= 1 ? 'active' : 'pending'}`}>
                    <div className="step-icon-wrapper">
                      {checkStep > 1 ? <FaCheckCircle className="step-icon success" /> : checkStep === 1 ? <FaCircleNotch className="step-icon spinning" /> : <div className="step-dot" />}
                    </div>
                    <span className="step-label">Request sent from your device</span>
                  </div>

                  <div className={`step-connector ${checkStep >= 2 ? 'active' : ''}`}></div>

                  <div className={`flow-step ${checkStep >= 2 ? 'active' : 'pending'}`}>
                    <div className="step-icon-wrapper">
                      {checkStep > 2 ? <FaCheckCircle className="step-icon success" /> : checkStep === 2 ? <FaCircleNotch className="step-icon spinning" /> : <div className="step-dot" />}
                    </div>
                    <span className="step-label">Connecting with AU servers</span>
                  </div>

                  <div className={`step-connector ${checkStep >= 3 ? 'active' : ''}`}></div>

                  <div className={`flow-step ${checkStep >= 3 ? 'active' : 'pending'}`}>
                    <div className="step-icon-wrapper">
                      {checkStep === 3 ? (
                        checkResult === 'Success' ? <FaCheckCircle className="step-icon success" /> : <FaExclamationCircle className="step-icon error" />
                      ) : <div className="step-dot" />}
                    </div>
                    <span className="step-label">{checkStep === 3 ? checkResult : 'Waiting for server`s response'}</span>
                  </div>
                </div>
              </div>
            )}

            {status === 'up' && (
              <div className="status-indicator up fade-in">
                <h3 className="success-text">Anna University COE Website is reachable</h3>
                <p className="subtitle">Anna University Servers are operational</p>
              </div>
            )}

            {status === 'down' && (
              <div className="status-indicator down fade-in">
                <div className="icon-wrapper">
                  <FaExclamationCircle />
                </div>
                <h3 className="error-text">Anna University COE Website is down</h3>
                <p className="subtitle">The servers might be under maintenance or experiencing overload due to high traffic</p>
              </div>
            )}
          </section>

          <button
            className="refresh-button"
            onClick={checkStatus}
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Checking...' : status === 'idle' ? 'Check Status' : 'Check Again'}
          </button>

          <section className="details-section">
            <div className="detail-item">
              <span className="detail-label">Target</span>
              <span className="detail-value">Anna University COE Servers</span>
            </div>
            {lastChecked && (
              <div className="detail-item">
                <span className="detail-label">Last Checked</span>
                <span className="detail-value">{lastChecked.toLocaleTimeString()}</span>
              </div>
            )}
            {responseTime !== null && (
              <div className="detail-item">
                <span className="detail-label">Response Time</span>
                <span className="detail-value">{responseTime}ms</span>
              </div>
            )}
          </section>



          <p className="footer-link-text">
            Anna University Result —{' '}
            <a href="https://coe.annauniv.edu/home" target="_blank" rel="noopener noreferrer" className="footer-link">
              Click here
            </a>
          </p>
        </main>
      </div>
    </>
  );
}

export default App;
