'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      setStatus('loading');
      setMessage(null);

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'homepage',
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to subscribe right now.');
      }

      setStatus('success');
      setMessage('Thanks for subscribing! Please check your inbox for a confirmation.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again later.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="bg-[#163832]/50 border-[#8EB69B]/30 text-[#DAF1DE] placeholder-[#8EB69B]/60 focus:border-[#8EB69B] focus:outline-none"
          aria-label="Email address"
        />
        <Button
          type="submit"
          className="bg-[#8EB69B] text-[#051F20] hover:bg-[#DAF1DE] flex items-center justify-center gap-2"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Subscribe
        </Button>
      </form>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm max-w-md mx-auto ${
            status === 'success' ? 'text-[#8DE2C1]' : 'text-[#FECACA]'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
