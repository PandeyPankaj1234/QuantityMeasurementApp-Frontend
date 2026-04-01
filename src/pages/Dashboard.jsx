import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { quantityApi } from '../services/api'
import './Dashboard.css'

const UNITS = {
  LENGTH:      ['FEET', 'INCH', 'YARDS', 'CENTIMETERS'],
  WEIGHT:      ['KILOGRAM', 'GRAM', 'POUND'],
  TEMPERATURE: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
  VOLUME:      ['LITRE', 'MILLILITRE', 'GALLON'],
}

const TYPE_ICONS = { LENGTH: '📏', WEIGHT: '⚖️', TEMPERATURE: '🌡️', VOLUME: '🧪' }
const MODE_ICONS = { convert: '🔄', add: '➕', subtract: '➖', divide: '➗', compare: '⚖️' }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [type, setType]   = useState('LENGTH')
  const [mode, setMode]   = useState('convert')
  const [value1, setValue1] = useState(1)
  const [value2, setValue2] = useState(1)
  const [unit1, setUnit1]   = useState('FEET')
  const [unit2, setUnit2]   = useState('INCH')

  const [result, setResult]               = useState(null)
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [history, setHistory]             = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  const unitList = UNITS[type] || []

  const handleSetType = (t) => {
    setType(t)
    const units = UNITS[t]
    setUnit1(units[0])
    setUnit2(units[1])
    setResult(null)
    setError('')
    setHistory([])
    setHistoryLoaded(false)
  }

  const handleSetMode = (m) => {
    setMode(m)
    setResult(null)
    setError('')
    setHistory([])
    setHistoryLoaded(false)
  }

  const perform = async () => {
    setResult(null)
    setError('')
    setLoading(true)
    try {
      const fn = quantityApi[mode]
      const res = await fn(value1, unit1, value2, unit2, type)
      const data = res.data
      if (data.error) {
        setError(data.errorMessage)
      } else if (data.resultValue != null) {
        setResult(`${data.resultValue} ${data.resultUnit ?? ''}`.trim())
      } else if (data.resultString != null) {
        setResult(`Equal: ${data.resultString}`)
      } else {
        setResult('Done')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
        navigate('/login')
      } else {
        setError('Request failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryLoaded(false)
    setHistory([])
    try {
      const res = await quantityApi.getHistory(mode)
      setHistory(res.data.slice(-5).reverse())
    } catch {
      setHistory([])
    } finally {
      setHistoryLoaded(true)
      setHistoryLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dash-wrapper">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-logo">⚖️</span>
          <span className="dash-title">QuantityMeter</span>
        </div>
        <div className="dash-user">
          <span className="dash-username">👤 {user?.name || user?.email || 'User'}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dash-main">
        {/* Type Selector */}
        <section className="section-card">
          <p className="section-label">Measurement Type</p>
          <div className="pill-group">
            {Object.keys(UNITS).map(t => (
              <button
                key={t}
                className={`pill ${type === t ? 'active' : ''}`}
                onClick={() => handleSetType(t)}
              >
                {TYPE_ICONS[t]} {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Mode Selector */}
        <section className="section-card">
          <p className="section-label">Operation</p>
          <div className="pill-group">
            {['convert', 'add', 'subtract', 'divide', 'compare'].map(m => (
              <button
                key={m}
                className={`pill ${mode === m ? 'active' : ''}`}
                onClick={() => handleSetMode(m)}
              >
                {MODE_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Inputs */}
        <section className="section-card">
          <div className="inputs-grid">
            <div className="input-block">
              <p className="section-label">From</p>
              <div className="input-row">
                <input
                  type="number"
                  className="num-input"
                  value={value1}
                  onChange={e => setValue1(parseFloat(e.target.value) || 0)}
                />
                <select
                  className="unit-select"
                  value={unit1}
                  onChange={e => setUnit1(e.target.value)}
                >
                  {unitList.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="op-divider">{MODE_ICONS[mode]}</div>

            <div className="input-block">
              <p className="section-label">To</p>
              <div className="input-row">
                <input
                  type="number"
                  className="num-input"
                  value={value2}
                  onChange={e => setValue2(parseFloat(e.target.value) || 0)}
                />
                <select
                  className="unit-select"
                  value={unit2}
                  onChange={e => setUnit2(e.target.value)}
                >
                  {unitList.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-row">
            <button className="btn-calculate" onClick={perform} disabled={loading}>
              {loading ? '⏳ Calculating…' : '🚀 Calculate'}
            </button>
            <button className="btn-history" onClick={loadHistory} disabled={historyLoading}>
              {historyLoading ? '⏳ Loading…' : '🕑 History'}
            </button>
          </div>
        </section>

        {/* Result */}
        {result !== null && (
          <div className="result-card success">
            <span className="result-label">Result</span>
            <span className="result-value">{result}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="result-card error">
            <span className="result-label">Error</span>
            <span className="result-value">{error}</span>
          </div>
        )}

        {/* History */}
        {historyLoaded && (
          <section className="section-card history-section">
            <p className="section-label">Recent History (last 5)</p>
            {history.length === 0 ? (
              <p className="no-history">No history found for this operation.</p>
            ) : (
              <div className="history-list">
                {history.map((h, i) => (
                  <div key={i} className={`history-item ${h.error ? 'has-error' : ''}`}>
                    <span className="op-tag">{h.operation?.toUpperCase()}</span>
                    <span className="history-values">
                      {h.thisValue} <span className="unit-badge">{h.thisUnit}</span>
                      {h.resultValue != null && (
                        <> → <strong>{h.resultValue}</strong> <span className="unit-badge">{h.resultUnit}</span></>
                      )}
                      {h.resultValue == null && h.resultString != null && (
                        <> → {h.resultString}</>
                      )}
                    </span>
                    {h.error && <span className="err-tag">❌ ERROR</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
