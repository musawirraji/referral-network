'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Field from '@/components/Field';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/store';

const EMPTY = { candidateName: '', candidateEmail: '', linkedinUrl: '', reason: '' };

export default function ReferPage({ params }) {
  return (
    <AuthGuard>
      <ReferForm jobId={params.jobId} />
    </AuthGuard>
  );
}

function ReferForm({ jobId }) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState('');
  const [values, setValues] = useState(EMPTY);
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api(`/api/jobs/${encodeURIComponent(jobId)}`)
      .then((d) => !cancelled && setJob(d.job))
      .catch((err) => !cancelled && setJobError(err.message));
    return () => { cancelled = true; };
  }, [jobId]);

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Client checks only cover "required"; the server owns the real rules and its
    // messages are shown under each field.
    const missing = {};
    if (!values.candidateName.trim()) missing.candidateName = 'Candidate name is required';
    if (!values.candidateEmail.trim()) missing.candidateEmail = 'Candidate email is required';
    if (!values.linkedinUrl.trim()) missing.linkedinUrl = 'LinkedIn URL is required';
    if (!values.reason.trim()) missing.reason = 'Reason is required';
    setFields(missing);
    if (Object.keys(missing).length) return;

    setSubmitting(true);
    try {
      await api('/api/referrals', { method: 'POST', body: { jobId, ...values } });
      showToast('Referral submitted');
      router.push('/dashboard');
    } catch (err) {
      setFields(err.fields || {});
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (jobError) {
    return (
      <div className="card narrow">
        <p className="form-error" role="alert">{jobError}</p>
        <Link href="/">Back to jobs</Link>
      </div>
    );
  }
  if (!job) return <p className="status" role="status">Loading job…</p>;

  const reasonLength = values.reason.trim().length;

  return (
    <section className="card narrow">
      <Link href="/" className="back">← All jobs</Link>
      <header className="job-header">
        <p className="company">{job.company}</p>
        <h1>Refer someone for {job.title}</h1>
        <p className="location">{job.location}</p>
      </header>

      <form onSubmit={onSubmit} noValidate>
        <Field id="candidateName" label="Candidate name" autoComplete="off"
          value={values.candidateName} onChange={onChange} error={fields.candidateName} required />
        <Field id="candidateEmail" label="Candidate email" type="email" autoComplete="off"
          value={values.candidateEmail} onChange={onChange} error={fields.candidateEmail} required />
        <Field id="linkedinUrl" label="LinkedIn URL" type="url" placeholder="https://www.linkedin.com/in/name"
          value={values.linkedinUrl} onChange={onChange} error={fields.linkedinUrl} required />
        <Field id="reason" label="Why are they a good fit?" as="textarea" rows={5} maxLength={500}
          hint={`10 to 500 characters. ${reasonLength}/500`}
          value={values.reason} onChange={onChange} error={fields.reason} required />
        {fields.jobId && <p className="field-error">{fields.jobId}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-block" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit referral'}
        </button>
      </form>
    </section>
  );
}
