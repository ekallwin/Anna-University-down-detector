import { useState, useEffect } from 'react';
import { FaDesktop, FaServer, FaSearch, FaExclamationCircle, FaCheckCircle, FaCircleNotch } from 'react-icons/fa';
import './App.css';
import { Analytics } from "@vercel/analytics/react"
import OfflinePage from './Offline/Offline';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState('idle');
  const [checkStep, setCheckStep] = useState(0);
  const [checkResult, setCheckResult] = useState('');
  const [lastChecked, setLastChecked] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const urlToCheck = 'https://coe.annauniv.edu/home';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkStatus = async () => {
    setStatus('checking');
    setCheckStep(1);
    setCheckResult('');
    const startTime = Date.now();

    if (!navigator.onLine) {
      setCheckStep(3);
      setCheckResult('Unable to reach');
      setStatus('down');
      setLastChecked(new Date());
      setResponseTime(null);
      return;
    }

    await new Promise(r => setTimeout(r, 100));
    setCheckStep(2);

    const tryFetchParallel = async () => {
      const timestamp = new Date().getTime();
      const targetWithQuery = `${urlToCheck}?t=${timestamp}`;

      const proxyTemplates = [
        import.meta.env.VITE_PROXY_1,
        import.meta.env.VITE_PROXY_2,
        import.meta.env.VITE_PROXY_3
      ];

      const urls = proxyTemplates.map(template => `${template}${encodeURIComponent(targetWithQuery)}`);

      return new Promise((resolve) => {
        let failures = 0;
        let hasResolved = false;

        const handleSuccess = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve(true);
          }
        };

        const handleFailure = (immediate = false) => {
          failures++;
          if ((immediate || failures === urls.length) && !hasResolved) {
            hasResolved = true;
            resolve(false);
          }
        };

        urls.forEach(async (url) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
              handleFailure(response.status >= 500);
              return;
            }

            if (url.includes('allorigins')) {
              const data = await response.json();
              if (data.status && data.status.http_code >= 200 && data.status.http_code < 400) {
                handleSuccess();
              } else if (data.status && data.status.http_code >= 500) {
                handleFailure(true);
              } else {
                handleFailure();
              }
            } else {
              handleSuccess();
            }
          } catch {
            handleFailure();
          }
        });
      });
    };

    let isUp = await tryFetchParallel();

    if (!isUp) {
      await new Promise(r => setTimeout(r, 1000));
      isUp = await tryFetchParallel();
    }

    setCheckStep(3);
    setCheckResult(isUp ? 'Success' : 'Unable to reach');

    await new Promise(r => setTimeout(r, 1500));

    setResponseTime(Date.now() - startTime);
    setLastChecked(new Date());
    setStatus(isUp ? 'up' : 'down');
  };



  if (!isOnline) {
    return <OfflinePage />;
  }

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
                <div className={`particle request-particle ${status === 'checking' && checkStep < 3 ? 'active' : ''}`}></div>
              </div>
              <div className="path-line response-line">
                <div className={`particle response-particle ${status === 'up' || status === 'down' || (status === 'checking' && checkStep === 3) ? `active ${status === 'up' || checkResult === 'Success' ? 'up' : 'down'}` : ''}`}></div>
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
                <span className="detail-value">{responseTime} milliseconds</span>
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
