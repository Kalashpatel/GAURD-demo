import { useState, useEffect } from 'react'
import { Shield, CheckCircle, ArrowRight, Eye, FileCheck, Ban, AlertTriangle, XCircle } from 'lucide-react'
import Button from './Button'

function OutputVerification({ prompt, decision, onBack, onRestart }) {
  const [currentPhase, setCurrentPhase] = useState(1)
  const [processing, setProcessing] = useState(true)
  const [caseId] = useState(() => Math.floor(10000 + Math.random() * 90000))

  // --- Entity parsing ---
  const nameMatch    = prompt.match(/[A-Z][a-z]+ [A-Z][a-z]+/)
  const accountMatch = prompt.match(/\d{10,}/)
  const amountMatch  = prompt.match(/₹[\d.]+ (?:lakh|crore)/i)
  const emailMatch   = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  const origName    = nameMatch?.[0]    ?? null
  const origAccount = accountMatch?.[0] ?? null
  const origAmount  = amountMatch?.[0]  ?? null

  const tokenName    = origName    ? `USER_${origName.split('').reduce((a,c) => a + c.charCodeAt(0), 0).toString(36).toUpperCase().slice(0,5)}` : null
  const tokenAccount = origAccount ? `XXXX${origAccount.slice(-4)}` : null
  const tokenAmount  = origAmount  ? '[HIGH_VALUE]' : null

  // --- Template response based on detected entities ---
  const tName    = tokenName    || 'CUSTOMER'
  const tAccount = tokenAccount || 'ACCT_XXXX'
  const tAmount  = tokenAmount  || '[AMOUNT]'

  const p = prompt.toLowerCase()
  const intent = p.includes('portfolio') || p.includes('investment') || p.includes('fund') || p.includes('equity') ? 'portfolio'
    : p.includes('loan') || p.includes('emi') || p.includes('credit') ? 'loan'
    : p.includes('statement') || p.includes('transaction') || p.includes('history') ? 'statement'
    : p.includes('fd') || p.includes('fixed deposit') ? 'deposit'
    : p.includes('kyc') || p.includes('document') || p.includes('verify') ? 'kyc'
    : 'general'

  const templates = {
    portfolio: (n, a, amt) =>
`Portfolio Analysis for ${n}:

Account ${a} shows a ${amt} investment portfolio.

1. Diversification: Well-balanced — large-cap (60%), mid-cap (40%) equity funds
2. Risk Profile: Moderate-aggressive, 5-year investment horizon
3. Performance: 12.3% CAGR over past 3 years, outperforming Nifty by 2.1%
4. Recommendation: Add 10–15% debt allocation for stability
5. Tax Optimization: Holdings eligible for LTCG benefits after 1-year period

Next Review: Quarterly rebalancing suggested based on market conditions.`,

    loan: (n, a, amt) =>
`Loan Assessment for ${n}:

Account ${a} — Eligibility summary for ${amt} request.

1. Credit Score: 762 (Excellent) — qualifies for prime lending rates
2. Debt-to-Income Ratio: 28% — within acceptable limit (< 40%)
3. Eligible Amount: Up to ${amt} at 8.75% p.a. (floating)
4. Recommended Tenure: 15–20 years for optimal EMI burden
5. Next Steps: Submit income proof and property documents for sanction letter`,

    statement: (n, a) =>
`Account Statement Summary for ${n}:

Account ${a} — Transaction analysis for requested period.

1. Total Credits: ₹3.2 lakh (12 transactions)
2. Total Debits: ₹2.8 lakh (34 transactions)
3. Closing Balance: ₹1.4 lakh
4. Unusual Activity: No suspicious transactions detected
5. Note: 3 high-value transactions flagged for RBI record-keeping compliance`,

    deposit: (n, a, amt) =>
`Fixed Deposit Options for ${n}:

Account ${a} — FD options for ${amt} investment.

1. Regular FD (1yr): 6.75% p.a.
2. Senior Citizen FD (1yr): 7.25% p.a. (if applicable)
3. Tax-Saver FD (5yr): 6.50% p.a. — 80C benefit up to ₹1.5 lakh
4. Flexi FD: Linked to savings — FD rates with full liquidity
5. Recommendation: 1-year Regular FD with auto-renewal for best returns`,

    kyc: (n, a) =>
`KYC Verification Summary for ${n}:

Account ${a} — Document verification status.

1. Aadhaar Verification: ✅ Linked and verified
2. PAN Card: ✅ Validated against IT database
3. Address Proof: ⚠️ Last updated 3 years ago — re-submission recommended
4. Photograph: ✅ Biometric match confirmed
5. Action Required: Request updated address proof within 30 days (RBI KYC norms)`,

    general: (n, a) =>
`Banking Assistant Response for ${n} (Account: ${a}):

Based on the query received:

1. Account Status: Active and in good standing
2. Last Interaction: ${new Date().toLocaleDateString()}
3. Pending Actions: None flagged in the system
4. Compliance Status: All regulatory requirements met
5. For specific details, please refer to the core banking system`,
  }

  const buildResponse = (n, a, amt) => templates[intent](n, a, amt)

  // What ChatGPT sees (tokenized for protect path, real for approve)
  const chatGPTResponse = decision === 'approve'
    ? buildResponse(origName || 'Customer', origAccount || 'N/A', origAmount || 'N/A')
    : buildResponse(tName, tAccount, tAmount)

  // What employee sees (real values always)
  const finalResponse = decision === 'approve'
    ? chatGPTResponse
    : buildResponse(origName || tName, origAccount || tAccount, origAmount || tAmount)

  // Detected sensitive data types
  const detectedTypes = [
    origName    && 'name',
    origAccount && 'account number',
    origAmount  && 'financial amount',
    emailMatch  && 'email',
  ].filter(Boolean)

  const safetyChecks = [
    {
      name: 'Hallucination Detection',
      status: 'pass',
      detail: origName
        ? `No invented names — "${origName}" verified against source`
        : 'No customer names found in response',
    },
    { name: 'Harmful Content Scan', status: 'pass', detail: 'No illegal advice detected' },
    {
      name: 'Data Leak Check',
      status: decision === 'approve' ? 'warning' : 'pass',
      detail: decision === 'approve'
        ? `Real data sent to OpenAI: ${detectedTypes.join(', ') || 'none'}`
        : detectedTypes.length > 0
          ? `Tokenized before sending: ${detectedTypes.join(', ')}`
          : 'No sensitive data detected in prompt',
    },
    { name: 'Policy Compliance', status: 'pass', detail: 'Meets banking regulations' },
  ]

  // --- Phase timers ---
  useEffect(() => {
    if (decision === 'decline') {
      const t = setTimeout(() => setProcessing(false), 1500)
      return () => clearTimeout(t)
    }
    const timers = [
      setTimeout(() => setCurrentPhase(2), 2000),
      setTimeout(() => setCurrentPhase(3), 4000),
      setTimeout(() => { setCurrentPhase(4); setProcessing(false) }, 6000),
    ]
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ========== DECLINE PATH ==========
  if (decision === 'decline') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Ban className="w-6 h-6 text-red-400" />
          Request Declined by Security Officer
        </h2>

        <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <XCircle className="w-24 h-24 mx-auto text-red-400 mb-4" />
            <h3 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h3>
            <p className="text-gray-300">This prompt has been blocked due to policy violation.</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-400 mb-2">Blocked Prompt:</p>
            <p className="text-gray-300 italic">{prompt}</p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3"><strong>Employee Notification:</strong></p>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Your ChatGPT request has been reviewed and declined.</p>
              <p className="bg-red-900/30 p-3 rounded border-l-4 border-red-500">
                <strong>Reason:</strong> Prompt contains sensitive customer PII and financial data that cannot be
                shared with external AI services.
              </p>
              <p><strong>Alternative:</strong> Rephrase without specific names, account numbers, or amounts.</p>
              <p className="text-gray-500">- Security Team</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Audit Trail</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Case ID:</span>
              <span className="font-mono text-white">CASE-{caseId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Decision:</span>
              <span className="text-red-400 font-semibold">DECLINED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Biometric Proof:</span>
              <span className="text-green-400">✓ Verified (Fingerprint)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timestamp:</span>
              <span className="font-mono text-white">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>← Back to Review</Button>
          <Button variant="primary" onClick={onRestart} fullWidth>Start New Demo</Button>
        </div>
      </div>
    )
  }

  // ========== APPROVE & TOKENIZE PATHS ==========
  const steps = (decision === 'tokenize' || decision === null)
    ? [
        { num: 1, label: 'Tokenize Input',  icon: Shield },
        { num: 2, label: 'Send to ChatGPT', icon: ArrowRight },
        { num: 3, label: 'Verify Output',   icon: FileCheck },
        { num: 4, label: 'De-tokenize',     icon: CheckCircle },
      ]
    : [
        { num: 1, label: 'Send Original',   icon: ArrowRight },
        { num: 2, label: 'ChatGPT Process', icon: Eye },
        { num: 3, label: 'Verify Output',   icon: FileCheck },
        { num: 4, label: 'Done',            icon: CheckCircle },
      ]

  return (
    <div>
      <h2 className="text-2xl text-white font-bold mb-6 flex items-center gap-2">
        {decision === 'approve' ? (
          <><CheckCircle className="w-6 h-6 text-yellow-400" /> Approved As-Is (Original Prompt Sent)</>
        ) : (
          <><Shield className="w-6 h-6 text-green-400" /> Layer 6: Bidirectional Protection (Tokenized)</>
        )}
      </h2>

      {decision === 'approve' && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <strong>Warning:</strong> Real customer data is being sent to ChatGPT.
          </p>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive  = currentPhase >= step.num
            const isCurrent = currentPhase === step.num
            return (
              <div key={step.num} className="flex flex-col items-center">
                <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all
                  ${isActive
                    ? (decision === 'tokenize' || decision === null) ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    : 'bg-gray-700 text-gray-400'}
                  ${isCurrent ? `ring-4 animate-pulse ${(decision === 'tokenize' || decision === null) ? 'ring-green-400' : 'ring-yellow-400'}` : ''}`}
                >
                  <Icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <p className={`text-xs text-center leading-tight ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase 1: Tokenization */}
      {(decision === 'tokenize' || decision === null) && detectedTypes.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Phase 1: Input Tokenization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">❌ Original (Sensitive):</p>
              <div className="bg-red-900/30 border border-red-600 rounded p-3 space-y-2">
                {origName    && <div><span className="text-xs text-gray-400">Customer:</span><p className="text-red-300 font-semibold">{origName}</p></div>}
                {origAccount && <div><span className="text-xs text-gray-400">Account:</span><p className="text-red-300 font-semibold">{origAccount}</p></div>}
                {origAmount  && <div><span className="text-xs text-gray-400">Amount:</span><p className="text-red-300 font-semibold">{origAmount}</p></div>}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">✅ Tokenized (Safe for AI):</p>
              <div className="bg-green-900/30 border border-green-600 rounded p-3 space-y-2">
                {tokenName    && <div><span className="text-xs text-gray-400">Token:</span><p className="text-green-300 font-semibold font-mono">{tokenName}</p></div>}
                {tokenAccount && <div><span className="text-xs text-gray-400">Token:</span><p className="text-green-300 font-semibold font-mono">{tokenAccount}</p></div>}
                {tokenAmount  && <div><span className="text-xs text-gray-400">Token:</span><p className="text-green-300 font-semibold font-mono">{tokenAmount}</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: ChatGPT Response */}
      {currentPhase >= 2 && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            ChatGPT Response
          </h3>

          <>
            <div className="bg-slate-800 rounded p-4 border-l-4 border-purple-500">
              <p className="text-xs text-gray-500 mb-2">
                {(decision === 'tokenize' || decision === null)
                  ? 'AI sees tokenized prompt — no real customer data:'
                  : 'AI sees original prompt:'}
              </p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{chatGPTResponse}</p>
            </div>

              {(decision === 'tokenize' || decision === null) && origName && (
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <p>
                    AI never saw
                    {origName    && <strong className="text-white"> "{origName}"</strong>}
                    {origAccount && <span> or <strong className="text-white">"{origAccount}"</strong></span>}
                    — only tokens
                  </p>
                </div>
              )}

              {decision === 'approve' && (
                <div className="mt-4 flex items-start gap-2 text-sm text-yellow-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <p>Real customer data was sent to AI servers</p>
                </div>
              )}
            </>
        </div>
      )}

      {/* Phase 3: Safety Verification */}
      {currentPhase >= 3 && (
        <div className="bg-slate-900 rounded-lg p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg text-white font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-yellow-400" />
            Output Safety Verification
          </h3>
          <div className="space-y-3">
            {safetyChecks.map((check, i) => (
              <div key={i} className="bg-slate-800 rounded p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{check.name}</p>
                  <p className="text-xs text-gray-400">{check.detail}</p>
                </div>
                <div className={`flex items-center gap-2 ${check.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {check.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  <span className="font-semibold">{check.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 4: Final De-tokenized Result */}
      {currentPhase >= 4 && !processing && (
        <div className={`border-2 rounded-lg p-6 mb-6 animate-fadeIn ${
          decision === 'tokenize'
            ? 'bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-600'
            : 'bg-yellow-900/30 border-yellow-600'
        }`}>
          <h3 className="text-xl text-white font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Final Result for Employee
            {(decision === 'tokenize' || decision === null) && origName && (
              <span className="text-sm font-normal text-green-400 ml-2">
                (real names restored)
              </span>
            )}
          </h3>

          <div className="bg-slate-900 rounded p-4 mb-4">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{finalResponse}</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 md:gap-4 text-center">
            <div className="bg-slate-800 rounded p-3">
              <p className={`text-2xl font-bold ${decision === 'tokenize' ? 'text-green-400' : 'text-yellow-400'}`}>
                {decision === 'tokenize' ? '100%' : '0%'}
              </p>
              <p className="text-xs text-gray-400">Data Protected</p>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <p className={`text-2xl font-bold ${decision === 'tokenize' ? 'text-blue-400' : 'text-red-400'}`}>
                {decision === 'tokenize' ? '0' : detectedTypes.length}
              </p>
              <p className="text-xs text-gray-400">Leaks to OpenAI</p>
            </div>
            <div className="bg-slate-800 rounded p-3">
              <p className="text-2xl font-bold text-purple-400">100%</p>
              <p className="text-xs text-gray-400">Utility</p>
            </div>
          </div>
        </div>
      )}

      {!processing && (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>← Back</Button>
          <Button variant="success" onClick={onRestart} fullWidth>Start New Demo</Button>
        </div>
      )}
    </div>
  )
}

export default OutputVerification
