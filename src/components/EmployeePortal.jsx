import { Eye } from 'lucide-react'
import Button from './Button'

function EmployeePortal({ prompt, setPrompt, onNext }) {
  // Pre-filled example with sensitive data (for demo)
  const examplePrompt = "Create a portfolio summary for Rajesh Kumar, account 9876543210, with ₹45 lakh investment in equity funds."

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex text-white items-center gap-2">
        <Eye className="w-6 h-6 text-white-400" />
        Employee ChatGPT Portal
      </h2>
      
      <p className="text-gray-300 mb-6">
        Employee wants to use ChatGPT to create a client portfolio summary...
      </p>

      {/* Input area */}
      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          Enter your prompt for ChatGPT:
        </label>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt here..."
          className="w-full h-32 bg-slate-800 text-white rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
        />
        
        {/* Helper button to fill example */}
        <button
          onClick={() => setPrompt(examplePrompt)}
          className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-blue-300 transition"
        >
          Use Example Prompt (contains sensitive data)
        </button>
      </div>

      {/* Warning box if sensitive data detected */}
      {prompt.includes('account') && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-200 text-sm">
            Potential sensitive data detected. G.U.A.R.D. will analyze this before sending to ChatGPT...
          </p>
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={onNext}
        disabled={!prompt}
        fullWidth
        variant="primary"
      >
        Submit to ChatGPT →
      </Button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Without G.U.A.R.D., this prompt would leak client data directly to OpenAI servers
      </p>
    </div>
  )
}

export default EmployeePortal