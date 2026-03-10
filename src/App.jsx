import { useState } from 'react';
import { FaDesktop, FaServer, FaSearch, FaExclamationCircle } from 'react-icons/fa';
import './App.css';
import { Analytics } from "@vercel/analytics/react"
function App() {
  const [status, setStatus] = useState('idle');
  const [lastChecked, setLastChecked] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const urlToCheck = 'https://coe.annauniv.edu/home';

  const checkStatus = async () => {
    setStatus('checking');
    const startTime = Date.now();
    try {
      const timestamp = new Date().getTime();
      const noCacheUrl = `${urlToCheck}?t=${timestamp}`;
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(noCacheUrl)}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const timeTaken = Date.now() - startTime;

      setResponseTime(timeTaken);
      setLastChecked(new Date());

      if (data.status && data.status.http_code >= 200 && data.status.http_code < 400) {
        setStatus('up');
      } else {
        setStatus('down');
      }
    } catch (error) {
      setStatus('down');
      setLastChecked(new Date());
      setResponseTime(Date.now() - startTime);
    }
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
                <span className="loader"></span>
                <p>Checking server status...</p>
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
