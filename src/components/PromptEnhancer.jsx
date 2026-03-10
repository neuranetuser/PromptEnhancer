import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Sparkles, Copy, Trash2, Settings, History, Loader } from 'lucide-react'

export default function PromptEnhancer({ session }) {
  const [prompt, setPrompt] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelType, setModelType] = useState('7B')
  const [temperature, setTemperature] = useState(0.7)
  const [history, setHistory] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setHistory(data)
    }
  }

  const handleEnhance = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setEnhancedPrompt('')

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          modelType,
          temperature,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEnhancedPrompt(data.enhancedPrompt)

        await supabase.from('prompts').insert({
          user_id: session.user.id,
          original_prompt: prompt,
          enhanced_prompt: data.enhancedPrompt,
          model_type: modelType,
          temperature,
        })

        loadHistory()
      }
    } catch (error) {
      console.error('Enhancement failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(enhancedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (id) => {
    await supabase.from('prompts').delete().eq('id', id)
    loadHistory()
  }

  const handleLoadFromHistory = (item) => {
    setPrompt(item.original_prompt)
    setEnhancedPrompt(item.enhanced_prompt)
    setModelType(item.model_type)
    setTemperature(item.temperature)
    setShowHistory(false)
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'var(--spacing-4)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: showHistory ? '1fr 380px' : '1fr',
        gap: 'var(--spacing-3)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-4)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-3)',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--neutral-900)',
              }}>
                Original Prompt
              </h2>
              <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    padding: '8px',
                    background: showSettings ? 'var(--primary-100)' : 'var(--neutral-100)',
                    border: '1px solid var(--neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Settings size={18} color={showSettings ? 'var(--primary-600)' : 'var(--neutral-600)'} />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    padding: '8px',
                    background: showHistory ? 'var(--primary-100)' : 'var(--neutral-100)',
                    border: '1px solid var(--neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <History size={18} color={showHistory ? 'var(--primary-600)' : 'var(--neutral-600)'} />
                </button>
              </div>
            </div>

            {showSettings && (
              <div style={{
                padding: 'var(--spacing-3)',
                background: 'var(--neutral-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--neutral-700)',
                    marginBottom: 'var(--spacing-1)',
                  }}>
                    Model Type
                  </label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--neutral-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      background: 'white',
                    }}
                  >
                    <option value="7B">7B Model</option>
                    <option value="32B">32B Model</option>
                    <option value="GGUF">GGUF Model</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--neutral-700)',
                    marginBottom: 'var(--spacing-1)',
                  }}>
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={6}
              style={{
                width: '100%',
                padding: 'var(--spacing-2)',
                border: '1px solid var(--neutral-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleEnhance}
              disabled={loading || !prompt.trim()}
              style={{
                marginTop: 'var(--spacing-2)',
                width: '100%',
                padding: '12px',
                background: loading || !prompt.trim() ? 'var(--neutral-300)' : 'var(--primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-1)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Enhance Prompt
                </>
              )}
            </button>
          </div>

          {enhancedPrompt && (
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-4)',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-3)',
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--neutral-900)',
                }}>
                  Enhanced Prompt
                </h2>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 16px',
                    background: copied ? 'var(--success-500)' : 'var(--primary-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div style={{
                padding: 'var(--spacing-3)',
                background: 'var(--neutral-50)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--neutral-800)',
              }}>
                {enhancedPrompt}
              </div>
            </div>
          )}
        </div>

        {showHistory && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--spacing-3)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--neutral-900)',
              marginBottom: 'var(--spacing-3)',
            }}>
              History
            </h3>

            {history.length === 0 ? (
              <p style={{
                fontSize: '14px',
                color: 'var(--neutral-500)',
                textAlign: 'center',
                padding: 'var(--spacing-3)',
              }}>
                No history yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 'var(--spacing-2)',
                      background: 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--neutral-100)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--neutral-50)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 'var(--spacing-1)',
                    }}>
                      <div
                        onClick={() => handleLoadFromHistory(item)}
                        style={{ flex: 1 }}
                      >
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--neutral-500)',
                          marginBottom: '4px',
                        }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--neutral-700)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {item.original_prompt}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={14} color="var(--error-500)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
