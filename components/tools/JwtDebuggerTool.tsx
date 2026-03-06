'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type JwtState = {
  header: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  signature: string
  error: string
  verification: string
}

const initialToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZlbG9wZXIiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.K8xevjaj8EjvJwrl0A6a3Nf-3Uf_hglwtw95RQzxvdo'

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function encodeBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let out = 0
  for (let i = 0; i < left.length; i += 1) {
    out |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return out === 0
}

async function verifyHs256(signingInput: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const result = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const actual = encodeBase64Url(new Uint8Array(result))
  return safeEqual(actual, signature)
}

export default function JwtDebuggerTool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [token, setToken] = useState(initialToken)
  const [secret, setSecret] = useState('')
  const [state, setState] = useState<JwtState>({
    header: null,
    payload: null,
    signature: '',
    error: '',
    verification: '',
  })

  useEffect(() => {
    const sharedToken = searchParams.get('token')
    if (sharedToken) setToken(sharedToken)
  }, [searchParams])

  const analyzeToken = async () => {
    try {
      const parts = token.trim().split('.')
      if (parts.length !== 3) {
        setState({
          header: null,
          payload: null,
          signature: '',
          error: 'Token must include header.payload.signature.',
          verification: '',
        })
        return
      }

      const header = JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>
      const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>
      let verification = ''

      if (secret && header.alg === 'HS256') {
        const valid = await verifyHs256(`${parts[0]}.${parts[1]}`, parts[2], secret)
        verification = valid
          ? 'Signature verification: valid (HS256)'
          : 'Signature verification: invalid'
      } else if (secret && header.alg !== 'HS256') {
        verification = `Verification currently supports HS256 only. Current alg: ${String(header.alg)}`
      }

      setState({
        header,
        payload,
        signature: parts[2],
        error: '',
        verification,
      })
    } catch {
      setState({
        header: null,
        payload: null,
        signature: '',
        error: 'Unable to decode token. Verify Base64URL segments and JSON payloads.',
        verification: '',
      })
    }
  }

  const expSeconds = typeof state.payload?.exp === 'number' ? state.payload.exp : null
  const expTime = expSeconds ? new Date(expSeconds * 1000).toISOString() : null
  const isExpired = expSeconds ? expSeconds * 1000 < Date.now() : null

  const shareState = async () => {
    const params = new URLSearchParams(searchParams.toString())
    if (token) params.set('token', token)
    else params.delete('token')
    params.delete('secret')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Interactive JWT Debugger
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Decode header and payload instantly. Add an HMAC secret to verify HS256 signatures.
      </p>

      <label
        htmlFor="jwt-token"
        className="mt-5 mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        JWT Token
      </label>
      <textarea
        id="jwt-token"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        className="h-36 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        spellCheck={false}
      />

      <label
        htmlFor="jwt-secret"
        className="mt-4 mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        HMAC Secret (optional)
      </label>
      <input
        id="jwt-secret"
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        placeholder="Used only for HS256 verification"
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={analyzeToken}
          className="bg-primary-600 hover:bg-primary-500 rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          Decode token
        </button>
        <button
          onClick={shareState}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Share link
        </button>
        <button
          onClick={() => {
            setToken('')
            setSecret('')
            setState({ header: null, payload: null, signature: '', error: '', verification: '' })
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Clear
        </button>
      </div>

      {state.error && (
        <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}

      {(state.header || state.payload) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Header</h3>
            <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100">
              {JSON.stringify(state.header, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Payload</h3>
            <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-100">
              {JSON.stringify(state.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {state.signature && (
        <p className="mt-4 text-xs break-all text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Signature:</span> {state.signature}
        </p>
      )}

      {expTime && (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Token expiry: <span className="font-semibold">{expTime}</span>{' '}
          {isExpired ? '(expired)' : '(active)'}
        </p>
      )}

      {state.verification && (
        <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          {state.verification}
        </p>
      )}
    </section>
  )
}
